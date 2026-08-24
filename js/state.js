/* ============================================================
   state.js — Sesión, usuario y estado global de la aplicación
   ============================================================ */
(function (A) {
  'use strict';

  const SKEY = 'nova.session';
  const PKEY = 'nova.prefs';

  const listeners = [];
  const emit = (evt) => listeners.forEach((f) => { try { f(evt); } catch (e) { console.error(e); } });

  const S = {
    user: A.store.get(SKEY, null),
    prefs: A.store.get(PKEY, { theme:'auto', lang:'es', push:true, email:true, whatsapp:true, consent:false }),
    cart: A.store.get('nova.cart', []),          // materiales añadidos al presupuesto
    searches: A.store.get('nova.searches', []),  // historial de búsqueda
    draft: A.store.get('nova.draft', null),      // borrador del cotizador
    unread: 0
  };

  /* ---------------- Autenticación ----------------
     Modo local: hash simple con salt (suficiente para la demo, pero el
     backend real usa Supabase Auth con bcrypt + JWT y verificación de correo). */
  async function digest(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return 'plain:' + A.hash(text);
  }

  async function register(data) {
    const users = await A.db.list('users');
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }
    const rec = await A.db.insert('users', {
      name: data.name, email: data.email.toLowerCase(), phone: data.phone || '',
      province: data.province || 'Madrid', pass: await digest(data.password + '·nova'),
      role: data.role || 'cliente', consent: !!data.consent, consent_version: A.config.gdpr.consentVersion
    });
    setUser(rec);
    await notify('¡Bienvenido a Vivas CR!', 'Tu cuenta está lista. Ya puedes calcular presupuestos, guardarlos y pedir tu visita técnica gratuita.', 'check-circle');
    return rec;
  }

  async function login(email, password) {
    const users = await A.db.list('users');
    const u = users.find((x) => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u) throw new Error('No encontramos ninguna cuenta con ese correo.');
    if (u.pass !== await digest(password + '·nova')) throw new Error('La contraseña no es correcta.');
    setUser(u);
    return u;
  }

  function setUser(u) {
    S.user = u ? { id:u.id, name:u.name, email:u.email, phone:u.phone, province:u.province, role:u.role } : null;
    A.store.set(SKEY, S.user);
    emit({ type:'auth' });
  }
  function logout() { setUser(null); emit({ type:'auth' }); }
  const isAdmin = () => !!(S.user && S.user.role === 'admin');

  /* ---------------- Preferencias ---------------- */
  function setPref(k, v) {
    S.prefs[k] = v; A.store.set(PKEY, S.prefs);
    if (k === 'theme') applyTheme();
    emit({ type:'prefs', key:k });
  }
  function applyTheme() {
    const t = S.prefs.theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }

  /* ---------------- Carrito de materiales ---------------- */
  function cartAdd(item) {
    const i = S.cart.findIndex((x) => x.id === item.id && x.store === item.store);
    if (i >= 0) S.cart[i].qty += (item.qty || 1);
    else S.cart.push(Object.assign({ qty:1 }, item));
    A.store.set('nova.cart', S.cart); emit({ type:'cart' });
  }
  function cartRemove(idx) { S.cart.splice(idx, 1); A.store.set('nova.cart', S.cart); emit({ type:'cart' }); }
  function cartQty(idx, q) { S.cart[idx].qty = Math.max(1, q); A.store.set('nova.cart', S.cart); emit({ type:'cart' }); }
  function cartClear() { S.cart = []; A.store.set('nova.cart', S.cart); emit({ type:'cart' }); }
  const cartTotal = () => S.cart.reduce((s, x) => s + x.price * x.qty, 0);

  /* ---------------- Historial de búsqueda ---------------- */
  function addSearch(q) {
    if (!q || !q.trim()) return;
    S.searches = [q.trim()].concat(S.searches.filter((x) => x !== q.trim())).slice(0, 12);
    A.store.set('nova.searches', S.searches);
  }
  function clearSearches() { S.searches = []; A.store.set('nova.searches', []); }

  /* ---------------- Notificaciones ---------------- */
  async function notify(title, body, icon, link) {
    const rec = await A.db.insert('notifications', {
      user_id: S.user ? S.user.id : 'anon', title, body, icon: icon || 'bell', link: link || '', read:false
    });
    emit({ type:'notify' });
    if (S.prefs.push && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(title, { body, tag: rec.id }); } catch (e) {}
    }
    return rec;
  }
  async function askPush() {
    if (!('Notification' in window)) { A.toast('Este dispositivo no admite notificaciones', 'err'); return false; }
    const p = await Notification.requestPermission();
    setPref('push', p === 'granted');
    A.toast(p === 'granted' ? 'Notificaciones activadas' : 'Notificaciones bloqueadas', p === 'granted' ? 'ok' : 'err');
    return p === 'granted';
  }
  async function unreadCount() {
    const list = await A.db.list('notifications', S.user ? { user_id:S.user.id } : null);
    return list.filter((n) => !n.read).length;
  }

  /* ---------------- Borrador del cotizador ---------------- */
  function saveDraft(d) { S.draft = d; A.store.set('nova.draft', d); }
  function clearDraft() { S.draft = null; A.store.del('nova.draft'); }

  /* ---------------- Puesta en marcha ----------------
     Crea la cuenta de administración la primera vez. No se inventa
     ningún historial: las obras, reseñas y presupuestos son los que
     tú vayas dando de alta. */
  async function seed() {
    if (A.store.get('nova.seeded', false)) return;
    await A.db.insert('users', {
      name:'Vivas CR', email:'admin@vivascr.es', phone:A.data.COMPANY.phone,
      province:'Tarragona', role:'admin', pass: await digest('vivas2026·nova'), consent:true
    });
    A.store.set('nova.seeded', true);
  }

  /* ---------------- Datos de ejemplo (opcional) ----------------
     Solo para ver cómo queda el panel lleno. Se pueden borrar de
     un clic desde Administración. */
  async function loadDemo() {
    const users = await A.db.list('users');
    let cli = users.find((u) => u.email === 'cliente@ejemplo.es');
    if (!cli) {
      cli = await A.db.insert('users', { name:'Cliente de ejemplo', email:'cliente@ejemplo.es',
        phone:'+34 600 000 000', province:'Tarragona', role:'cliente',
        pass: await digest('ejemplo1234·nova'), consent:true, demo:true });
    }
    const samples = [
      { sid:'ref-bano', qty:5, q:'estandar', prov:'Tarragona', st:'aceptado', days:-38 },
      { sid:'ref-cocina', qty:11, q:'premium', prov:'Barcelona', st:'en_obra', days:-24 },
      { sid:'ele-instalacion', qty:78, q:'estandar', prov:'Tarragona', st:'enviado', days:-12 },
      { sid:'cli-aire', qty:3, q:'estandar', prov:'Tarragona', st:'aceptado', days:-7 },
      { sid:'fon-calentador', qty:1, q:'basica', prov:'Girona', st:'enviado', days:-3 },
      { sid:'ref-pintura', qty:180, q:'estandar', prov:'Tarragona', st:'borrador', days:-1 }
    ];
    let n = 1;
    for (const x of samples) {
      const calc = A.engine.quote({ serviceId:x.sid, qty:x.qty, quality:x.q, province:x.prov, urgency:'normal', extras:[] });
      await A.db.insert('quotes', {
        user_id:cli.id, ref:A.ref('PRES', n++), service_id:x.sid, service_name:calc.service.name,
        category:calc.service.cat, qty:x.qty, quality:x.q, province:x.prov, urgency:'normal', extras:[],
        base:calc.base, vat:calc.vat, total:calc.total, days:calc.days, status:x.st,
        client_name:'Cliente de ejemplo', client_email:'cliente@ejemplo.es', client_phone:'+34 600 000 000',
        demo:true, created_at:new Date(Date.now() + x.days * 864e5).toISOString()
      });
    }
    await A.db.insert('appointments', { user_id:cli.id, type:'visita', title:'Visita técnica — baño',
      date:new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10), time:'10:30',
      address:'Amposta', status:'confirmada', notes:'Medición y comprobación de bajantes.', demo:true });
    A.store.set('nova.demo', true);
    return true;
  }

  async function clearDemo() {
    for (const t of ['quotes', 'appointments', 'messages', 'notifications', 'users']) {
      const rows = await A.db.list(t);
      for (const r of rows) if (r.demo) await A.db.remove(t, r.id);
    }
    A.store.set('nova.demo', false);
    return true;
  }

  /** Con Supabase, guardar requiere sesión: las políticas de seguridad
      atan cada registro a su usuario. En modo local no hace falta. */
  function requireAuth(motivo) {
    if (A.db.mode !== 'supabase' || S.user) return true;
    A.toast(motivo || 'Entra en tu cuenta para guardar esto', 'err');
    A.go('/login?next=' + encodeURIComponent(location.hash.replace(/^#/, '')));
    return false;
  }

  A.requireAuth = requireAuth;
  A.state = S;
  A.auth = { register, login, logout, setUser, isAdmin };
  A.on_ = (fn) => { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); };
  A.emit = emit;
  A.prefs = { set:setPref, applyTheme };
  A.cart = { add:cartAdd, remove:cartRemove, qty:cartQty, clear:cartClear, total:cartTotal };
  A.search = { add:addSearch, clear:clearSearches };
  A.notify = notify; A.askPush = askPush; A.unreadCount = unreadCount;
  A.draft = { save:saveDraft, clear:clearDraft };
  A.seed = seed; A.loadDemo = loadDemo; A.clearDemo = clearDemo;
})(window.App);

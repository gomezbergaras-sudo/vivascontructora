/* ============================================================
   app.js — Shell de la aplicación y enrutador
   ============================================================ */
(function (A) {
  'use strict';

  /* ---------------- Enrutador por hash ---------------- */
  const routes = [];
  function route(pattern, handler, meta) {
    const keys = [];
    const rx = new RegExp('^' + pattern.replace(/:[a-zA-Z]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
    routes.push({ rx, keys, handler, meta: meta || {}, pattern });
  }
  A.route = route;

  function currentPath() {
    const h = location.hash.replace(/^#/, '') || '/';
    return h.split('?')[0];
  }
  function query() {
    const h = location.hash.split('?')[1] || '';
    const o = {}; new URLSearchParams(h).forEach((v, k) => { o[k] = v; });
    return o;
  }
  A.query = query;
  A.go = (path) => { location.hash = path; };
  A.back = () => (history.length > 1 ? history.back() : A.go('/'));

  async function render() {
    const path = currentPath();
    const outlet = A.$('#outlet');
    for (const r of routes) {
      const m = path.match(r.rx);
      if (!m) continue;
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });

      if (r.meta.auth && !A.state.user) { A.go('/login?next=' + encodeURIComponent(path)); return; }
      if (r.meta.admin && !A.auth.isAdmin()) { A.toast('Necesitas permisos de administración', 'err'); A.go('/'); return; }

      outlet.innerHTML = '<div class="container" style="padding:40px 16px"><div class="skel" style="height:22px;width:45%;margin-bottom:14px"></div><div class="skel" style="height:150px"></div></div>';
      window.scrollTo({ top:0, behavior:'instant' in document.documentElement.style ? 'instant' : 'auto' });
      try {
        A._pending = [];
        const html = await r.handler(params, query());
        outlet.innerHTML = `<div class="view">${html}</div>`;
        (A._pending || []).forEach((fn) => { try { fn(); } catch (err) { console.error(err); } });
        A._pending = [];
      } catch (e) {
        console.error(e);
        outlet.innerHTML = `<div class="container"><div class="empty">${A.icon('alert', 40)}
          <h3>Algo ha fallado al cargar esta pantalla</h3><p class="small">${A.esc(e.message || '')}</p>
          <button class="btn btn-ghost btn-sm" style="margin-top:14px" onclick="location.reload()">Reintentar</button></div></div>`;
      }
      updateNav(path);
      document.title = (r.meta.title ? r.meta.title + ' · ' : '') + A.data.COMPANY.legalName;
      A.closeSheet();
      return;
    }
    outlet.innerHTML = `<div class="container"><div class="empty" style="padding-top:80px">${A.icon('search', 44)}
      <h3>Página no encontrada</h3><p class="small">La ruta <code>${A.esc(path)}</code> no existe.</p>
      <a class="btn btn-soft btn-sm" style="margin-top:16px" href="#/">Volver al inicio</a></div></div>`;
  }
  A.render = render;
  /** Registra una función que se ejecuta cuando el HTML ya está en el DOM. */
  A.onMount = (fn) => { A._pending = A._pending || []; A._pending.push(fn); };

  /* ---------------- Navegación ---------------- */
  const BOTTOM = [
    { href:'#/',           icon:'home',   key:'nav.home' },
    { href:'#/servicios',  icon:'grid',   key:'nav.services' },
    { href:'#/catalogo',   icon:'image',  key:'nav.catalog' },
    { href:'#/materiales', icon:'search', key:'nav.materials' },
    { href:'#/perfil',     icon:'user',   key:'nav.profile' }
  ];
  const DESK = [
    { href:'#/servicios',   key:'nav.services' },
    { href:'#/presupuesto', key:'nav.quote' },
    { href:'#/avaluo',      key:'nav.valuation' },
    { href:'#/catalogo',    key:'nav.catalog' },
    { href:'#/materiales',  key:'nav.materials' },
    { href:'#/render',      key:'nav.render' },
    { href:'#/empresa',     key:'nav.company' },
    { href:'#/empleo',      key:'nav.jobs' }
  ];

  function updateNav(path) {
    A.$$('.bottomnav a').forEach((a) => {
      const href = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', href === '/' ? path === '/' : path.indexOf(href) === 0);
    });
    A.$$('.desknav a').forEach((a) => {
      const href = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', path.indexOf(href) === 0);
    });
  }

  function shell() {
    const C = A.data.COMPANY;
    return `
    <header class="topbar">
      <div class="container topbar-inner">
        <a class="brand" href="#/" aria-label="${A.esc(C.legalName)}">
          <span class="brand-mark"><img src="${A.brand.mark96}" alt=""></span>
          <span><span class="brand-name">${A.esc(C.name)}</span><small>${A.esc(C.tagline)}</small></span>
        </a>
        <nav class="desknav">
          ${DESK.map((d) => `<a href="${d.href}">${A.esc(A.t(d.key))}</a>`).join('')}
        </nav>
        <div class="topbar-actions">
          <button class="lang-toggle" id="btn-lang" title="Idioma">${A.getLang().toUpperCase()}</button>
          <button class="iconbtn" id="btn-theme" title="Tema">${A.icon('moon', 20)}</button>
          <a class="iconbtn" href="#/notificaciones" title="Notificaciones" id="btn-notif">${A.icon('bell', 20)}</a>
          <button class="iconbtn" id="btn-menu" title="Menú">${A.icon('menu', 22)}</button>
        </div>
      </div>
    </header>

    <main class="main" id="outlet"></main>

    <nav class="bottomnav">
      ${BOTTOM.map((b) => `<a href="${b.href}">${A.icon(b.icon, 21)}<span>${A.esc(A.t(b.key))}</span></a>`).join('')}
    </nav>

    <div class="scrim" id="scrim"></div>
    <aside class="drawer" id="drawer">
      <div class="drawer-head">
        <span class="brand-mark"><img src="${A.brand.mark96}" alt=""></span>
        <div style="flex:1">
          <div class="brand-name">${A.esc(C.name)}</div>
          <div class="small muted">${A.esc(C.claim)}</div>
        </div>
        <button class="iconbtn" id="drawer-close">${A.icon('x', 20)}</button>
      </div>
      <div class="drawer-body" id="drawer-body"></div>
    </aside>`;
  }

  function drawerContent() {
    const u = A.state.user;
    const item = (href, icon, label, badge) =>
      `<a href="${href}" data-nav>${A.icon(icon, 19)}<span style="flex:1">${A.esc(label)}</span>
        ${badge ? `<span class="badge badge-navy">${badge}</span>` : A.icon('chev', 16)}</a>`;
    return `
      ${u ? `<div class="row" style="padding:12px 13px;gap:12px">
              ${A.avatar(u.name, 42)}
              <div style="min-width:0">
                <div style="font-weight:700">${A.esc(u.name)}</div>
                <div class="small muted" style="overflow:hidden;text-overflow:ellipsis">${A.esc(u.email)}</div>
              </div>
            </div>`
           : `<div style="padding:10px 13px 4px"><a class="btn btn-block" href="#/login" data-nav>${A.esc(A.t('auth.login'))}</a>
              <a class="btn btn-ghost btn-block" style="margin-top:8px" href="#/registro" data-nav>${A.esc(A.t('auth.register'))}</a></div>`}
      <div class="drawer-sec">Servicios</div>
      ${item('#/presupuesto', 'calc', A.t('quote.title'))}
      ${item('#/avaluo', 'building', A.t('valuation.title'))}
      ${item('#/render', 'sparkles', A.t('render.title'))}
      ${item('#/materiales', 'cart', A.t('materials.title'), A.state.cart.length || '')}
      <div class="drawer-sec">Mi cuenta</div>
      ${item('#/presupuestos', 'file-text', A.t('nav.quotes'))}
      ${item('#/citas', 'calendar', A.t('nav.appointments'))}
      ${item('#/mensajes', 'chat', A.t('nav.messages'))}
      ${item('#/notificaciones', 'bell', A.t('nav.notifications'))}
      ${item('#/pagos', 'card', A.t('nav.payments'))}
      ${item('#/perfil', 'user', A.t('nav.profile'))}
      <div class="drawer-sec">Empresa</div>
      ${item('#/empresa', 'building', A.t('nav.company'))}
      ${item('#/empleo', 'briefcase', 'Trabaja con nosotros')}
      ${item('#/catalogo', 'image', A.t('nav.catalog'))}
      ${item('#/privacidad', 'lock', A.t('nav.privacy'))}
      ${A.auth.isAdmin() ? `<div class="drawer-sec">Gestión</div>${item('#/admin', 'chart', A.t('nav.admin'))}` : ''}
      ${u ? `<div style="padding:14px 13px"><button class="btn btn-ghost btn-block" id="btn-logout">
              ${A.icon('logout', 18)} ${A.esc(A.t('auth.logout'))}</button></div>` : ''}
      <div style="padding:16px 13px" class="small muted">
        <div>${A.esc(A.data.COMPANY.phone)}${A.data.COMPANY.email ? ' · ' + A.esc(A.data.COMPANY.email) : ''}</div>
        <div style="margin-top:6px">v${A.config.version} · Datos: ${A.db.mode === 'supabase' ? 'Supabase' : 'local'}</div>
      </div>`;
  }

  function openDrawer(open) {
    A.$('#drawer').classList.toggle('open', open);
    A.$('#scrim').classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) A.$('#drawer-body').innerHTML = drawerContent();
  }

  /* ---------------- Arranque ---------------- */
  async function boot() {
    document.getElementById('app').innerHTML = shell();
    A.prefs.applyTheme();

    A.$('#btn-menu').addEventListener('click', () => openDrawer(true));
    A.$('#drawer-close').addEventListener('click', () => openDrawer(false));
    A.$('#scrim').addEventListener('click', () => openDrawer(false));
    A.$('#drawer').addEventListener('click', (e) => {
      if (e.target.closest('[data-nav]')) openDrawer(false);
      if (e.target.closest('#btn-logout')) { A.auth.logout(); openDrawer(false); A.toast('Sesión cerrada'); A.go('/'); }
    });
    A.$('#btn-lang').addEventListener('click', () => {
      A.setLang(A.getLang() === 'es' ? 'en' : 'es');
      document.getElementById('app').innerHTML = shell();
      boot2(); render();
    });
    A.$('#btn-theme').addEventListener('click', () => {
      const order = ['auto', 'light', 'dark'];
      const next = order[(order.indexOf(A.state.prefs.theme) + 1) % 3];
      A.prefs.set('theme', next);
      A.toast('Tema: ' + (next === 'auto' ? 'automático' : next === 'light' ? 'claro' : 'oscuro'));
    });

    /* Configuración del backend */
    let onSupabase = false;
    if (A.config.supabase.url && A.config.supabase.anonKey) {
      onSupabase = A.db.useSupabase(A.config.supabase.url, A.config.supabase.anonKey);
      if (onSupabase) {
        /* Si la base de datos no responde (sin cobertura en obra, corte de red),
           se sigue trabajando en el dispositivo en vez de dejar la app muerta. */
        const alcanzable = await Promise.race([
          A.db.client.from('services').select('id').limit(1).then((r) => !r.error || r.error.code !== undefined),
          new Promise((res) => setTimeout(() => res(false), 6000))
        ]).catch(() => false);
        if (!alcanzable) {
          onSupabase = false;
          A.db.useLocal();
          console.warn('[Vivas CR] Supabase no responde: modo local temporal');
          setTimeout(() => A.toast('Sin conexión con la nube. Trabajando en este dispositivo.', 'err'), 900);
        } else if (A.authSupabase) {
          A.authSupabase.install();
          try { await A.authSupabase.restore(); } catch (e) { console.warn('[Vivas CR] sesión no recuperada', e); }
        }
      }
    }
    if (!onSupabase) await A.seed();
    await refreshBadge();

    window.addEventListener('hashchange', render);
    A.on_((e) => { if (e.type === 'notify' || e.type === 'auth') refreshBadge(); });
    render();
  }
  function boot2() {
    A.$('#btn-menu').addEventListener('click', () => openDrawer(true));
    A.$('#drawer-close').addEventListener('click', () => openDrawer(false));
    A.$('#scrim').addEventListener('click', () => openDrawer(false));
    A.$('#btn-lang').addEventListener('click', () => {
      A.setLang(A.getLang() === 'es' ? 'en' : 'es');
      document.getElementById('app').innerHTML = shell(); boot2(); render();
    });
    A.$('#btn-theme').addEventListener('click', () => {
      const order = ['auto', 'light', 'dark'];
      const next = order[(order.indexOf(A.state.prefs.theme) + 1) % 3];
      A.prefs.set('theme', next);
    });
  }

  async function refreshBadge() {
    const n = await A.unreadCount();
    const b = A.$('#btn-notif');
    if (!b) return;
    b.innerHTML = A.icon('bell', 20) + (n > 0 ? '<span class="dot"></span>' : '');
  }
  A.refreshBadge = refreshBadge;

  A.boot = boot;
})(window.App);

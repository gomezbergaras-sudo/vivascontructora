/* ============================================================
   views/account.js — Acceso, perfil, citas, mensajes, avisos, pagos
   ============================================================ */
(function (A) {
  'use strict';

  /* ---------------- LOGIN ---------------- */
  A.route('/login', async (p, qs) => {
    A.onMount(() => {
      A.$('#l-go').addEventListener('click', async () => {
        const e = A.$('#l-email').value, pw = A.$('#l-pass').value;
        const box = A.$('#l-err');
        try {
          await A.auth.login(e, pw);
          A.toast('Sesión iniciada', 'ok');
          A.go(qs.next ? decodeURIComponent(qs.next) : '/perfil');
        } catch (err) { box.style.display = 'block'; box.textContent = err.message; }
      });
      A.$('#l-admin').addEventListener('click', () => {
        A.$('#l-email').value = 'admin@vivascr.es'; A.$('#l-pass').value = 'vivas2026';
      });
    });
    return `<div class="container" style="padding-top:32px;max-width:420px">
      <div class="center" style="margin-bottom:20px">
        <img src="${A.brand.mark256}" alt="" style="width:76px;height:76px;object-fit:contain;margin:0 auto 10px">
        <div class="brand-name" style="font-size:24px;margin-bottom:10px">${A.esc(A.data.COMPANY.name)}</div>
        <h1 style="font-size:20px">${A.esc(A.t('auth.login'))}</h1>
        <p class="small muted" style="margin-top:5px">Accede a tus presupuestos, citas y mensajes.</p>
      </div>
      <div class="card card-p">
        <div class="field"><label class="label">Correo electrónico</label>
          <input class="input" id="l-email" type="email" placeholder="tu@correo.es" autocomplete="username"></div>
        <div class="field"><label class="label">Contraseña</label>
          <input class="input" id="l-pass" type="password" placeholder="••••••••" autocomplete="current-password"></div>
        <div id="l-err" class="small" style="color:var(--red);display:none;margin-bottom:10px"></div>
        <button class="btn btn-block" id="l-go">${A.esc(A.t('auth.login'))}</button>
        <div class="center small muted" style="margin-top:14px">
          ¿No tienes cuenta? <a class="link" href="#/registro">Crear una</a></div>
      </div>
      <div class="card card-p" style="margin-top:12px">
        <div class="small muted" style="margin-bottom:8px">Acceso de la empresa</div>
        <button class="btn btn-ghost btn-sm btn-block" id="l-admin">Rellenar datos de administración</button>
        <p class="small muted" style="margin-top:8px">Cambia el correo y la contraseña desde tu perfil en cuanto entres por primera vez.</p>
      </div>
    </div>`;
  }, { title:'Acceso' });

  /* ---------------- REGISTRO ---------------- */
  A.route('/registro', async () => {
    A.onMount(() => {
      const cons = A.$('#r-consent');
      let ok = false;
      cons.addEventListener('click', () => { ok = !ok; cons.classList.toggle('on', ok); });
      A.$('#r-go').addEventListener('click', async () => {
        const d = { name:A.$('#r-name').value, email:A.$('#r-email').value, phone:A.$('#r-phone').value,
          province:A.$('#r-prov').value, password:A.$('#r-pass').value, consent:ok };
        const errs = [];
        if (!A.v.min(d.name, 3)) errs.push('Escribe tu nombre completo.');
        if (!A.v.email(d.email)) errs.push('El correo no es válido.');
        if (!A.v.phone(d.phone)) errs.push('El teléfono no es válido.');
        if (!A.v.min(d.password, 8)) errs.push('La contraseña debe tener al menos 8 caracteres.');
        if (!ok) errs.push('Debes aceptar la política de privacidad.');
        const box = A.$('#r-err');
        if (errs.length) { box.style.display = 'block'; box.innerHTML = errs.map(A.esc).join('<br>'); return; }
        try { await A.auth.register(d); A.toast('Cuenta creada', 'ok'); A.go('/perfil'); }
        catch (err) { box.style.display = 'block'; box.textContent = err.message; }
      });
    });
    return `<div class="container" style="padding-top:28px;max-width:460px">
      <div class="center" style="margin-bottom:18px">
        <h1 style="font-size:22px">${A.esc(A.t('auth.register'))}</h1>
        <p class="small muted" style="margin-top:5px">Guarda presupuestos, sigue tu obra y habla con tu jefe de obra.</p>
      </div>
      <div class="card card-p">
        <div class="field"><label class="label">Nombre y apellidos</label><input class="input" id="r-name"></div>
        <div class="gf">
          <div class="field"><label class="label">Teléfono</label><input class="input" id="r-phone" inputmode="tel" placeholder="600 000 000"></div>
          <div class="field"><label class="label">Provincia</label>
            <select class="select" id="r-prov">${A.data.PROVINCES.map((x) => `<option>${x}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label class="label">Correo electrónico</label><input class="input" id="r-email" type="email"></div>
        <div class="field"><label class="label">Contraseña</label>
          <input class="input" id="r-pass" type="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password"></div>
        <div class="switchrow">
          <div><div style="font-weight:600;font-size:14px">Acepto la política de privacidad</div>
            <div class="small muted">Conforme al RGPD. <a class="link" href="#/privacidad">Leer</a></div></div>
          <button class="switch" id="r-consent"></button>
        </div>
        <div id="r-err" class="small" style="color:var(--red);display:none;margin:10px 0"></div>
        <button class="btn btn-block" id="r-go" style="margin-top:14px">Crear cuenta</button>
        <div class="center small muted" style="margin-top:12px">
          ¿Ya tienes cuenta? <a class="link" href="#/login">Entrar</a></div>
      </div>
    </div>`;
  }, { title:'Registro' });

  /* ---------------- PERFIL ---------------- */
  A.route('/perfil', async () => {
    const u = A.state.user;
    if (!u) return `<div class="container"><div class="empty" style="padding-top:70px">${A.icon('user', 44)}
      <h3>Accede a tu cuenta</h3><p class="small">Guarda presupuestos y sigue tus obras.</p>
      <div class="row center" style="justify-content:center;gap:9px;margin-top:16px">
        <a class="btn" href="#/login">Iniciar sesión</a>
        <a class="btn btn-ghost" href="#/registro">Crear cuenta</a></div></div></div>`;

    const [qs, vs, ap] = await Promise.all([
      A.db.list('quotes', { user_id:u.id }), A.db.list('valuations', { user_id:u.id }),
      A.db.list('appointments', { user_id:u.id })
    ]);
    const spent = qs.filter((q) => ['aceptado', 'en_obra', 'finalizado'].indexOf(q.status) !== -1)
      .reduce((s, q) => s + q.total, 0);

    A.onMount(() => {
      A.$$('[data-pref]').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.pref; const v = !A.state.prefs[k];
        A.prefs.set(k, v); b.classList.toggle('on', v);
        if (k === 'push' && v) A.askPush();
      }));
      A.$('#p-theme').addEventListener('change', (e) => A.prefs.set('theme', e.target.value));
      A.$('#p-lang').addEventListener('change', (e) => { A.setLang(e.target.value); location.reload(); });
      A.$('#p-export').addEventListener('click', () => {
        A.download('nova-datos.json', new Blob([JSON.stringify(A.db.exportAll(), null, 2)], { type:'application/json' }));
        A.toast('Copia de tus datos descargada', 'ok');
      });
      A.$('#p-wipe').addEventListener('click', async () => {
        if (await A.confirm('Borrar mis datos', 'Se eliminarán presupuestos, avalúos, citas y mensajes de este dispositivo.', 'Borrar todo')) {
          A.db.wipe(); A.store.del('nova.seeded'); A.auth.logout(); A.toast('Datos eliminados'); A.go('/');
        }
      });
      A.$('#p-logout').addEventListener('click', () => { A.auth.logout(); A.go('/'); });
    });

    return `<div class="container" style="padding-top:18px;max-width:760px">
      <div class="card card-p">
        <div class="row" style="gap:14px">
          ${A.avatar(u.name, 58)}
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:18px;letter-spacing:-.02em">${A.esc(u.name)}</div>
            <div class="small muted">${A.esc(u.email)}</div>
            <div class="row" style="gap:6px;margin-top:6px">
              <span class="badge badge-navy">${u.role === 'admin' ? 'Administración' : 'Cliente'}</span>
              <span class="badge badge-grey">${A.esc(u.province)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid g4" style="margin-top:12px">
        ${[[qs.length, 'Presupuestos', '#/presupuestos'], [vs.length, 'Avalúos', '#/avaluos'],
           [ap.length, 'Citas', '#/citas'], [A.eur(spent), 'Contratado', '#/presupuestos']]
          .map(([n, l, h]) => `<a class="card card-hover card-p center" href="${h}" style="padding:14px 8px">
            <div style="font-weight:800;font-size:18px;letter-spacing:-.02em">${A.esc(String(n))}</div>
            <div class="small muted">${l}</div></a>`).join('')}
      </div>

      <div class="sec-head"><div class="sec-title">Accesos</div></div>
      <div class="grid g2" style="gap:10px">
        ${[['file-text', 'Mis presupuestos', '#/presupuestos'], ['building', 'Mis avalúos', '#/avaluos'],
           ['sparkles', 'Mis renders', '#/renders'], ['calendar', 'Mis citas', '#/citas'],
           ['chat', 'Mensajes', '#/mensajes'], ['card', 'Pagos', '#/pagos'],
           ['cart', 'Cesta de materiales', '#/cesta'], ['briefcase', 'Trabaja con nosotros', '#/empleo'],
           ['lock', 'Privacidad y RGPD', '#/privacidad']]
          .map(([ic, l, h]) => `<a class="card card-hover card-p row" href="${h}" style="gap:11px;padding:14px">
            <span style="color:var(--primary)">${A.icon(ic, 19)}</span>
            <span style="font-weight:600;font-size:14px;flex:1">${l}</span>
            <span class="muted">${A.icon('chev', 16)}</span></a>`).join('')}
        ${A.auth.isAdmin() ? `<a class="card card-hover card-p row" href="#/admin" style="gap:11px;padding:14px;border-color:var(--accent)">
          <span style="color:var(--accent)">${A.icon('chart', 19)}</span>
          <span style="font-weight:600;font-size:14px;flex:1">Panel de administración</span>
          <span class="muted">${A.icon('chev', 16)}</span></a>` : ''}
      </div>

      <div class="sec-head"><div class="sec-title">Preferencias</div></div>
      <div class="card card-p">
        <div class="field"><label class="label">Tema</label>
          <select class="select" id="p-theme">
            <option value="auto" ${A.state.prefs.theme === 'auto' ? 'selected' : ''}>Automático (según el sistema)</option>
            <option value="light" ${A.state.prefs.theme === 'light' ? 'selected' : ''}>Claro</option>
            <option value="dark" ${A.state.prefs.theme === 'dark' ? 'selected' : ''}>Oscuro</option>
          </select></div>
        <div class="field"><label class="label">Idioma</label>
          <select class="select" id="p-lang">
            <option value="es" ${A.getLang() === 'es' ? 'selected' : ''}>Español</option>
            <option value="en" ${A.getLang() === 'en' ? 'selected' : ''}>English</option>
          </select></div>
        <div class="switchrow"><div><div style="font-weight:600;font-size:14px">Notificaciones push</div>
          <div class="small muted">Avisos de obra, citas y ofertas.</div></div>
          <button class="switch ${A.state.prefs.push ? 'on' : ''}" data-pref="push"></button></div>
        <div class="switchrow"><div><div style="font-weight:600;font-size:14px">Correo electrónico</div>
          <div class="small muted">Presupuestos y certificaciones.</div></div>
          <button class="switch ${A.state.prefs.email ? 'on' : ''}" data-pref="email"></button></div>
        <div class="switchrow"><div><div style="font-weight:600;font-size:14px">WhatsApp</div>
          <div class="small muted">Avisos rápidos del jefe de obra.</div></div>
          <button class="switch ${A.state.prefs.whatsapp ? 'on' : ''}" data-pref="whatsapp"></button></div>
      </div>

      <div class="sec-head"><div class="sec-title">Tus datos</div></div>
      <div class="card card-p">
        <div class="row wrap" style="gap:9px">
          <button class="btn btn-ghost btn-sm" id="p-export">${A.icon('download', 16)} Descargar mis datos</button>
          <button class="btn btn-ghost btn-sm" id="p-wipe" style="color:var(--red)">${A.icon('trash', 16)} Borrar mis datos</button>
          <button class="btn btn-ghost btn-sm" id="p-logout">${A.icon('logout', 16)} Cerrar sesión</button>
        </div>
        <p class="small muted" style="margin-top:10px">Almacenamiento actual: <strong>${A.db.mode === 'supabase' ? 'Supabase (nube, tiempo real)' : 'este dispositivo'}</strong>.
        Puedes ejercer tus derechos de acceso, rectificación y supresión escribiendo a ${A.esc(A.config.gdpr.dpoEmail || A.data.COMPANY.email || A.data.COMPANY.phone)}.</p>
      </div>
      <div style="height:24px"></div>
    </div>`;
  }, { title:'Perfil' });

  /* ---------------- CITAS ---------------- */
  A.route('/citas', async () => {
    const rows = await A.db.list('appointments', A.state.user ? { user_id:A.state.user.id } : null);
    A.onMount(() => {
      A.$('#a-new').addEventListener('click', () => openForm());
      A.$$('[data-cancel]').forEach((b) => b.addEventListener('click', async () => {
        if (await A.confirm('Cancelar cita', '¿Quieres cancelar esta visita?', 'Cancelar cita')) {
          await A.db.update('appointments', b.dataset.cancel, { status:'cancelada' }); A.render();
        }
      }));
    });
    const badge = { confirmada:'badge-green', pendiente:'badge-amber', cancelada:'badge-red', realizada:'badge-grey' };
    return `<div class="container" style="padding-top:18px;max-width:760px">
      <div class="between" style="margin-bottom:14px">
        <div><div class="sec-title">${A.esc(A.t('nav.appointments'))}</div>
          <div class="sec-sub">Visitas técnicas y seguimiento de obra</div></div>
        <button class="btn btn-sm" id="a-new">${A.icon('plus', 16)} Pedir cita</button>
      </div>
      ${rows.length ? `<div class="stack">${rows.map((r) => `<div class="card card-p">
        <div class="between" style="gap:10px">
          <div style="min-width:0">
            <div class="row" style="gap:7px;margin-bottom:4px">
              <span class="badge ${badge[r.status] || 'badge-grey'}">${A.esc(r.status)}</span>
              <span class="badge badge-grey">${r.type === 'visita' ? 'Visita técnica' : 'Obra'}</span>
            </div>
            <div style="font-weight:700;font-size:15px">${A.esc(r.title)}</div>
            <div class="small muted" style="margin-top:3px">${A.icon('calendar', 12)} ${A.dateFmt(r.date)} · ${A.esc(r.time)}</div>
            <div class="small muted">${A.icon('pin', 12)} ${A.esc(r.address)}</div>
            ${r.notes ? `<p class="small" style="margin-top:7px">${A.esc(r.notes)}</p>` : ''}
          </div>
          ${r.status !== 'cancelada' ? `<button class="btn btn-ghost btn-sm" data-cancel="${r.id}" style="flex:none">Cancelar</button>` : ''}
        </div></div>`).join('')}</div>`
        : `<div class="empty">${A.icon('calendar', 40)}<h3>No tienes citas</h3>
           <p class="small">La visita técnica es gratuita y sin compromiso.</p></div>`}
      <div style="height:24px"></div>
    </div>`;
  }, { title:'Citas' });

  function openForm() {
    const today = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
    const w = A.sheet(`
      <div class="field"><label class="label">Tipo de cita</label>
        <select class="select" id="f-type">
          <option value="visita">Visita técnica (gratuita)</option>
          <option value="obra">Seguimiento de obra</option>
          <option value="videollamada">Videollamada</option>
        </select></div>
      <div class="field"><label class="label">Motivo</label>
        <input class="input" id="f-title" placeholder="Ej.: medición de cocina"></div>
      <div class="gf">
        <div class="field"><label class="label">Fecha</label><input class="input" id="f-date" type="date" value="${today}"></div>
        <div class="field"><label class="label">Hora</label>
          <select class="select" id="f-time">
            ${['08:00','09:00','10:00','10:30','11:00','12:00','13:00','16:00','17:00','18:00'].map((h) => `<option>${h}</option>`).join('')}
          </select></div>
      </div>
      <div class="field"><label class="label">Dirección</label><input class="input" id="f-addr" placeholder="Calle, número, población"></div>
      <div class="field"><label class="label">Notas</label><textarea class="textarea" id="f-notes" placeholder="Accesos, horarios, detalles a tener en cuenta…"></textarea></div>
      <button class="btn btn-block" id="f-save">Reservar cita</button>`, { title:'Nueva cita' });
    w.querySelector('#f-save').addEventListener('click', async () => {
      const t = w.querySelector('#f-title').value.trim();
      if (!t) { A.toast('Indica el motivo de la cita', 'err'); return; }
      await A.db.insert('appointments', {
        user_id:A.state.user ? A.state.user.id : 'anon', type:w.querySelector('#f-type').value,
        title:t, date:w.querySelector('#f-date').value, time:w.querySelector('#f-time').value,
        address:w.querySelector('#f-addr').value, notes:w.querySelector('#f-notes').value, status:'pendiente'
      });
      await A.notify('Cita solicitada', `${t} · ${A.dateFmt(w.querySelector('#f-date').value)}`, 'calendar', '#/citas');
      A.closeSheet(); A.toast('Cita solicitada. Te confirmamos en menos de 24 h.', 'ok'); A.render(); A.refreshBadge();
    });
  }

  /* ---------------- MENSAJES ---------------- */
  A.route('/mensajes', async () => {
    const rows = (await A.db.list('messages', A.state.user ? { user_id:A.state.user.id } : null))
      .slice().reverse();
    A.onMount(() => {
      const send = async () => {
        const i = A.$('#m-text'); const t = i.value.trim();
        if (!t) return;
        await A.db.insert('messages', { user_id:A.state.user ? A.state.user.id : 'anon',
          thread:'soporte', sender:'cliente', text:t, read:true });
        i.value = '';
        await A.render();
        setTimeout(async () => {
          const reply = autoReply(t);
          await A.db.insert('messages', { user_id:A.state.user ? A.state.user.id : 'anon',
            thread:'soporte', sender:'empresa', text:reply, read:false });
          await A.notify('Nuevo mensaje de NOVA', reply.slice(0, 80) + '…', 'chat', '#/mensajes');
          A.render(); A.refreshBadge();
        }, 1400);
      };
      A.$('#m-send').addEventListener('click', send);
      A.$('#m-text').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
      const c = A.$('#chatbox'); if (c) c.scrollTop = c.scrollHeight;
    });
    return `<div class="container" style="padding-top:16px;max-width:720px">
      <div class="row" style="gap:11px;margin-bottom:6px">
        <img src="${A.brand.mark96}" alt="" style="width:40px;height:40px;object-fit:contain">
        <div><div style="font-weight:700">Vivas CR · Atención al cliente</div>
          <div class="small" style="color:var(--green)">● En línea · responde en pocos minutos</div></div>
      </div>
      <div class="chat" id="chatbox" style="max-height:56vh;overflow:auto">
        ${rows.map((m) => `<div class="msg ${m.sender === 'cliente' ? 'me' : 'them'}">
          ${A.esc(m.text)}<div class="t">${A.timeAgo(m.created_at)}</div></div>`).join('')}
      </div>
      <div class="composer">
        <input class="input" id="m-text" placeholder="Escribe tu mensaje…">
        <button class="btn" id="m-send" style="width:52px;padding:0">${A.icon('send', 19)}</button>
      </div>
      <div class="row wrap" style="gap:7px;margin-top:10px">
        <a class="btn btn-ghost btn-sm" href="tel:${A.data.COMPANY.phone.replace(/\s/g,'')}">${A.icon('phone', 15)} Llamar</a>
        <a class="btn btn-wa btn-sm" href="https://wa.me/${A.data.COMPANY.whatsapp.replace(/[^\d]/g,'')}" target="_blank" rel="noopener">${A.icon('whatsapp', 15)} WhatsApp</a>
        <a class="btn btn-ghost btn-sm" href="#/citas">${A.icon('calendar', 15)} Pedir visita</a>
      </div>
    </div>`;
  }, { title:'Mensajes' });

  function autoReply(t) {
    const s = t.toLowerCase();
    if (/presupuest|precio|cuánto|cuanto|coste/.test(s))
      return 'Puedo ayudarte con eso. Si calculas el presupuesto desde la app tendrás el importe al momento; luego lo confirmamos con una visita técnica gratuita. ¿Te reservo la visita?';
    if (/cita|visita|vernos|agenda/.test(s))
      return 'Perfecto. Dime dos franjas horarias que te vengan bien y te confirmo la visita técnica en menos de 24 h.';
    if (/garant|reclam|problema|avería|averia/.test(s))
      return 'Lo revisamos enseguida. Los acabados tienen 3 años de garantía y la estructura 10. Cuéntame qué ha pasado y te asigno un técnico.';
    if (/factura|pago|anticipo|financia/.test(s))
      return 'Aceptamos transferencia y tarjeta. El anticipo es del 40 % a la firma y puedes pagarlo desde la sección de Pagos.';
    if (/plazo|cuándo|cuando|tarda/.test(s))
      return 'El plazo depende del trabajo: un baño suele estar en 12 días laborables y una reforma integral de 90 m² en unas 7 semanas. ¿Qué tienes en mente?';
    return 'Gracias por escribir. Lo revisamos y te respondemos con detalle dentro del horario de atención.';
  }

  /* ---------------- NOTIFICACIONES ---------------- */
  A.route('/notificaciones', async () => {
    const rows = await A.db.list('notifications', A.state.user ? { user_id:A.state.user.id } : null);
    A.onMount(() => {
      const r = A.$('#n-read');
      if (r) r.addEventListener('click', async () => {
        for (const n of rows) if (!n.read) await A.db.update('notifications', n.id, { read:true });
        A.render(); A.refreshBadge();
      });
      const ask = A.$('#n-ask'); if (ask) ask.addEventListener('click', A.askPush);
    });
    return `<div class="container" style="padding-top:18px;max-width:720px">
      <div class="between" style="margin-bottom:14px">
        <div class="sec-title">${A.esc(A.t('nav.notifications'))}</div>
        ${rows.some((n) => !n.read) ? '<button class="link" id="n-read">Marcar todo como leído</button>' : ''}
      </div>
      ${('Notification' in window && Notification.permission !== 'granted') ? `
        <div class="card card-p" style="margin-bottom:12px;background:var(--primary-soft);border-color:var(--primary)">
          <div class="between wrap" style="gap:10px">
            <div><strong style="font-size:14px">Activa los avisos push</strong>
              <p class="small muted" style="margin-top:3px">Te avisamos del avance de obra y de las citas.</p></div>
            <button class="btn btn-sm" id="n-ask">${A.icon('bell', 15)} Activar</button>
          </div></div>` : ''}
      ${rows.length ? `<div class="stack">${rows.map((n) => `
        <a class="card card-p row" href="${n.link || '#/notificaciones'}" style="gap:12px;align-items:flex-start;
          ${!n.read ? 'border-left:3px solid var(--primary)' : ''}">
          <span style="color:var(--primary);flex:none">${A.icon(n.icon || 'bell', 20)}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:14.5px">${A.esc(n.title)}</div>
            <p class="small muted" style="margin-top:2px">${A.esc(n.body)}</p>
            <div class="small muted" style="margin-top:5px">${A.timeAgo(n.created_at)}</div>
          </div>
          ${!n.read ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex:none;margin-top:6px"></span>' : ''}
        </a>`).join('')}</div>`
        : `<div class="empty">${A.icon('bell', 40)}<h3>Sin notificaciones</h3></div>`}
      <div style="height:24px"></div>
    </div>`;
  }, { title:'Notificaciones' });

  /* ---------------- PAGOS ---------------- */
  A.route('/pagos', async () => {
    const quotes = (await A.db.list('quotes', A.state.user ? { user_id:A.state.user.id } : null))
      .filter((q) => ['aceptado', 'en_obra', 'finalizado'].indexOf(q.status) !== -1);
    const pays = await A.db.list('payments', A.state.user ? { user_id:A.state.user.id } : null);
    A.onMount(() => {
      A.$$('[data-pay]').forEach((b) => b.addEventListener('click', () => payForm(b.dataset.pay, Number(b.dataset.amount))));
    });
    return `<div class="container" style="padding-top:18px;max-width:720px">
      <div class="sec-title" style="margin-bottom:6px">${A.esc(A.t('nav.payments'))}</div>
      <div class="sec-sub" style="margin-bottom:14px">Anticipos y certificaciones de obra</div>

      ${quotes.length ? `<div class="stack">${quotes.map((q) => {
        const paid = pays.filter((p) => p.quote_id === q.id).reduce((s, p) => s + p.amount, 0);
        const pend = Math.max(0, q.total - paid);
        return `<div class="card card-p">
          <div class="between"><div>
            <div class="mono small muted">${A.esc(q.ref)}</div>
            <div style="font-weight:700;margin-top:2px">${A.esc(q.service_name)}</div></div>
            <div style="text-align:right"><div style="font-weight:800">${A.eur(q.total)}</div>
              <div class="small muted">Total del contrato</div></div></div>
          <div class="meter" style="margin:11px 0 7px"><i style="width:${q.total ? (paid / q.total * 100).toFixed(1) : 0}%"></i></div>
          <div class="between small"><span class="muted">Pagado ${A.eur(paid)}</span>
            <span style="font-weight:700">Pendiente ${A.eur(pend)}</span></div>
          ${pend > 0 ? `<button class="btn btn-block btn-sm" style="margin-top:12px"
            data-pay="${q.id}" data-amount="${Math.round(pend * 0.4)}">
            ${A.icon('card', 16)} Pagar anticipo ${A.eur(Math.round(pend * 0.4))}</button>` : ''}
        </div>`;
      }).join('')}</div>` : `<div class="empty">${A.icon('card', 40)}<h3>Sin contratos activos</h3>
        <p class="small">Acepta un presupuesto para gestionar los pagos aquí.</p></div>`}

      ${pays.length ? `<div class="sec-head"><div class="sec-title">Histórico de pagos</div></div>
      <div class="tablewrap"><table>
        <thead><tr><th>Fecha</th><th>Concepto</th><th>Método</th><th>Importe</th></tr></thead>
        <tbody>${pays.map((p) => `<tr><td>${A.dateFmt(p.created_at)}</td><td>${A.esc(p.concept)}</td>
          <td><span class="badge badge-grey">${A.esc(p.method)}</span></td>
          <td style="font-weight:700">${A.eur(p.amount)}</td></tr>`).join('')}</tbody></table></div>` : ''}

      <div class="card card-p" style="margin-top:14px">
        <div class="row" style="gap:10px;align-items:flex-start">
          <span style="color:var(--primary);flex:none">${A.icon('lock', 20)}</span>
          <p class="small muted">Los pagos se procesan mediante pasarela certificada PCI-DSS con autenticación reforzada (PSD2).
          NOVA no almacena datos de tarjeta.
          ${A.hasKey('integrations.payments.publicKey') ? '' : ' Modo demostración: no se realiza ningún cargo real.'}</p>
        </div>
      </div>
      <div style="height:24px"></div>
    </div>`;
  }, { title:'Pagos' });

  function payForm(quoteId, amount) {
    const w = A.sheet(`
      <div class="total-card" style="margin-bottom:14px">
        <div class="lbl">Importe a pagar</div><div class="big">${A.eur(amount)}</div></div>
      <label class="label">Método de pago</label>
      <div class="optgrid" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px">
        ${[['card', 'Tarjeta'], ['euro', 'Transferencia'], ['calc', 'Financiación']].map((m, i) => `
          <button class="opt ${i === 0 ? 'sel' : ''}" data-method="${m[1]}" style="padding:12px;text-align:center">
            <div style="color:var(--primary);display:grid;place-items:center;margin-bottom:5px">${A.icon(m[0], 20)}</div>
            <div class="opt-t" style="font-size:12.5px">${m[1]}</div></button>`).join('')}
      </div>
      <div id="pay-card">
        <div class="field"><label class="label">Número de tarjeta</label>
          <input class="input mono" id="pc-num" placeholder="4242 4242 4242 4242" inputmode="numeric"></div>
        <div class="gf">
          <div class="field"><label class="label">Caducidad</label><input class="input mono" id="pc-exp" placeholder="MM/AA"></div>
          <div class="field"><label class="label">CVC</label><input class="input mono" id="pc-cvc" placeholder="123" inputmode="numeric"></div>
        </div>
      </div>
      <button class="btn btn-block btn-lg" id="pay-go">${A.icon('lock', 17)} Pagar ${A.eur(amount)}</button>
      <p class="small muted center" style="margin-top:10px">Conexión cifrada · verificación 3-D Secure</p>`,
      { title:'Pago seguro' });

    let method = 'Tarjeta';
    w.querySelectorAll('[data-method]').forEach((b) => b.addEventListener('click', () => {
      method = b.dataset.method;
      w.querySelectorAll('[data-method]').forEach((x) => x.classList.toggle('sel', x === b));
      w.querySelector('#pay-card').style.display = method === 'Tarjeta' ? 'block' : 'none';
    }));
    w.querySelector('#pay-go').addEventListener('click', async () => {
      const btn = w.querySelector('#pay-go');
      btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Procesando…';
      await A.sleep(1500);
      await A.db.insert('payments', { user_id:A.state.user ? A.state.user.id : 'anon',
        quote_id:quoteId, amount, method, concept:'Anticipo de obra', status:'completado' });
      await A.notify('Pago recibido', `Hemos registrado tu pago de ${A.eur(amount)}.`, 'check-circle', '#/pagos');
      A.closeSheet(); A.toast('Pago completado', 'ok'); A.render(); A.refreshBadge();
    });
  }

  /* ---------------- PRIVACIDAD ---------------- */
  A.route('/privacidad', async () => `<div class="container" style="padding-top:18px;max-width:760px">
    <div class="sec-title" style="margin-bottom:4px">Privacidad y protección de datos</div>
    <div class="sec-sub" style="margin-bottom:16px">Reglamento (UE) 2016/679 · LOPDGDD 3/2018 · versión ${A.esc(A.config.gdpr.consentVersion)}</div>
    ${[
      ['Responsable del tratamiento', `${A.data.COMPANY.legalName}, NIF ${A.data.COMPANY.nif}, ${A.data.COMPANY.address}${A.config.gdpr.dpoEmail ? '. Contacto para protección de datos: ' + A.config.gdpr.dpoEmail : '. Contacto: ' + A.data.COMPANY.phone}.`],
      ['Datos que tratamos', 'Identificativos (nombre, correo, teléfono), dirección de la obra, datos técnicos del inmueble facilitados para presupuestos y avalúos, imágenes que subas al generador de renders y datos de uso de la aplicación.'],
      ['Finalidad', 'Elaborar y enviar presupuestos e informes de valoración, gestionar visitas técnicas y la ejecución de obra, atender consultas y, si lo autorizas, enviarte comunicaciones comerciales.'],
      ['Base jurídica', 'Ejecución de contrato o medidas precontractuales (art. 6.1.b), consentimiento para comunicaciones comerciales (art. 6.1.a) e interés legítimo en la mejora del servicio (art. 6.1.f).'],
      ['Conservación', `Los datos se conservan mientras dure la relación y, después, ${Math.round(A.config.gdpr.retentionMonths / 12)} años por obligaciones fiscales y de garantía de la edificación.`],
      ['Destinatarios', 'Industriales colaboradores estrictamente necesarios para ejecutar la obra, proveedor de alojamiento en la UE, pasarela de pago certificada, asesoría fiscal y administraciones públicas cuando la ley lo exija. No se realizan transferencias internacionales fuera del EEE.'],
      ['Tus derechos', 'Acceso, rectificación, supresión, limitación, portabilidad y oposición. Puedes ejercerlos desde tu perfil (descargar o borrar tus datos) o escribiendo al DPO. También puedes reclamar ante la AEPD (www.aepd.es).'],
      ['Seguridad', 'Cifrado en tránsito (TLS 1.3) y en reposo, control de acceso por roles, registro de accesos y copias de seguridad diarias. Las contraseñas se almacenan con funciones de derivación seguras, nunca en claro.'],
      ['Candidaturas de empleo', 'Si nos envías tu currículum tratamos tus datos identificativos, de contacto y de trayectoria profesional con la única finalidad de valorar tu candidatura, sobre la base de tu consentimiento y de medidas precontractuales. Conservamos el currículum 12 meses y después lo eliminamos, salvo que nos pidas retirarlo antes escribiendo al DPO. No lo cedemos a terceros ni lo usamos para ninguna otra finalidad.'],
      ['Cookies y almacenamiento local', 'La aplicación usa almacenamiento local del dispositivo para recordar tu sesión, tus preferencias y los borradores de presupuesto. No se emplean cookies publicitarias ni de seguimiento de terceros.']
    ].map(([t, c]) => `<div class="card card-p" style="margin-bottom:10px">
      <strong style="font-size:14.5px">${t}</strong>
      <p class="small muted" style="margin-top:6px">${A.esc(c)}</p></div>`).join('')}
    <div class="row wrap" style="gap:9px;margin:14px 0 24px">
      <a class="btn btn-ghost btn-sm" href="#/perfil">${A.icon('user', 15)} Gestionar mis datos</a>
      ${A.config.gdpr.dpoEmail ? `<a class="btn btn-ghost btn-sm" href="mailto:${A.config.gdpr.dpoEmail}">${A.icon('mail', 15)} Escribir sobre mis datos</a>` : ''}
      <a class="btn btn-ghost btn-sm" href="tel:${A.data.COMPANY.phone.replace(/\s/g,'')}">${A.icon('phone', 15)} ${A.esc(A.data.COMPANY.phone)}</a>
    </div>
  </div>`, { title:'Privacidad' });
})(window.App);

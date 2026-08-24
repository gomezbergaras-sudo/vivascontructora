/* ============================================================
   views/quote.js — Cotizador paso a paso, historial y detalle
   ============================================================ */
(function (A) {
  'use strict';

  const STEPS = ['Servicio', 'Alcance', 'Calidad', 'Extras', 'Tus datos', 'Presupuesto'];

  /* Estado del asistente (persistido como borrador) */
  let W = null;
  function initWizard(serviceId) {
    const saved = A.state.draft;
    W = (saved && (!serviceId || saved.serviceId === serviceId)) ? saved : {
      step: serviceId ? 1 : 0,
      serviceId: serviceId || null,
      qty: null, quality:'estandar', province: (A.state.user && A.state.user.province) || 'Madrid',
      urgency:'normal', extras:[], vivienda2anios:true, obraNueva:false,
      client:{ name:(A.state.user && A.state.user.name) || '', email:(A.state.user && A.state.user.email) || '',
               phone:(A.state.user && A.state.user.phone) || '', address:'', notes:'' },
      materials: A.state.cart.slice()
    };
    if (serviceId) { W.serviceId = serviceId; if (W.step < 1) W.step = 1; }
    const svc = A.data.service(W.serviceId);
    if (svc && (W.qty == null)) W.qty = svc.qty.def;
    return W;
  }
  const save = () => A.draft.save(W);

  function stepper(step) {
    return `<div class="stepper">${STEPS.map((s, i) => `
      <div class="step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}" style="flex:${i === STEPS.length - 1 ? 0 : 1}">
        <div style="display:flex;flex-direction:column;align-items:center">
          <div class="step-dot">${i < step ? '✓' : i + 1}</div>
        </div>
        ${i < STEPS.length - 1 ? '<div class="step-line"></div>' : ''}
      </div>`).join('')}</div>
      <div class="between" style="margin:-10px 0 16px">
        <span class="small muted">Paso ${step + 1} de ${STEPS.length}</span>
        <span class="small" style="font-weight:700;color:var(--primary)">${A.esc(STEPS[step])}</span>
      </div>`;
  }

  /* ---------------- Rutas ---------------- */
  A.route('/presupuesto', async () => wizard(null), { title:'Presupuesto' });
  A.route('/presupuesto/:id', async (p) => wizard(p.id), { title:'Presupuesto' });

  async function wizard(serviceId) {
    initWizard(serviceId);
    const svc = A.data.service(W.serviceId);
    A.onMount(bind);

    let body = '';
    if (W.step === 0 || !svc) body = stepService();
    else if (W.step === 1) body = stepScope(svc);
    else if (W.step === 2) body = stepQuality(svc);
    else if (W.step === 3) body = stepExtras(svc);
    else if (W.step === 4) body = stepClient(svc);
    else body = stepResult(svc);

    return `<div class="container" style="padding-top:16px;max-width:840px">
      <div class="between" style="margin-bottom:14px">
        <div>
          <div class="sec-title">${A.esc(A.t('quote.title'))}</div>
          <div class="sec-sub">${svc ? A.esc(svc.name) : 'Elige el trabajo que necesitas'}</div>
        </div>
        ${W.step > 0 ? `<button class="btn btn-ghost btn-sm" id="w-reset">${A.icon('refresh', 15)} Reiniciar</button>` : ''}
      </div>
      ${stepper(Math.min(W.step, 5))}
      ${body}
    </div>`;
  }

  /* ---- Paso 0: servicio ---- */
  function stepService() {
    return `<div class="stack">
      ${A.data.CATEGORIES.map((c) => `
        <div>
          <div class="row" style="gap:8px;margin:6px 0 8px">
            <span style="color:${c.color}">${A.icon(c.icon, 18)}</span>
            <strong style="font-size:14.5px">${A.esc(c.name)}</strong>
          </div>
          <div class="grid g3">
            ${A.data.servicesOf(c.id).map((s) => `
              <button class="opt" data-svc="${s.id}">
                <div class="opt-t">${A.esc(s.name)}</div>
                <div class="opt-d">${A.esc(s.desc)}</div>
                <div class="opt-p">${A.t('common.from')} ${A.eur(s.minTotal)}</div>
              </button>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
  }

  /* ---- Paso 1: alcance ---- */
  function stepScope(s) {
    return `<div class="card card-p">
      <label class="label">¿Cuánto necesitas? (${A.esc(s.unitName)})</label>
      <div class="row" style="gap:10px">
        <button class="btn btn-ghost" id="q-minus" style="width:46px;padding:0">${A.icon('minus', 18)}</button>
        <input class="input mono" id="q-val" type="number" inputmode="decimal" value="${W.qty}"
          min="${s.qty.min}" max="${s.qty.max}" step="${s.qty.step}" style="text-align:center;font-weight:700;font-size:17px">
        <button class="btn btn-ghost" id="q-plus" style="width:46px;padding:0">${A.icon('plus', 18)}</button>
      </div>
      <input class="range" id="q-range" type="range" min="${s.qty.min}" max="${s.qty.max}" step="${s.qty.step}" value="${W.qty}">
      <div class="between small muted"><span>${A.num(s.qty.min)}</span><span>${A.num(s.qty.max)}</span></div>

      <hr class="divider">
      <label class="label">Provincia de la obra</label>
      <select class="select" id="q-prov">
        ${A.data.PROVINCES.map((p) => `<option ${W.province === p ? 'selected' : ''}>${p}</option>`).join('')}
      </select>
      <div class="hint">Ajustamos el precio al coste real de mano de obra de cada zona.</div>

      <hr class="divider">
      <label class="label">¿Cuándo quieres empezar?</label>
      <div class="optgrid">
        ${A.data.URGENCY.map((u) => `<button class="opt ${W.urgency === u.id ? 'sel' : ''}" data-urg="${u.id}">
          <span class="check">${A.icon('check-circle', 17)}</span>
          <div class="opt-t">${A.esc(u.name)}</div>
          ${u.factor > 1 ? `<div class="opt-p">+${Math.round((u.factor - 1) * 100)} %</div>` : '<div class="opt-p" style="color:var(--green)">Sin recargo</div>'}
        </button>`).join('')}
      </div>

      <hr class="divider">
      <div class="switchrow">
        <div><div style="font-weight:600;font-size:14px">Vivienda con más de 2 años</div>
          <div class="small muted">Permite aplicar el IVA reducido del 10 % en obras de reforma.</div></div>
        <button class="switch ${W.vivienda2anios ? 'on' : ''}" id="q-iva"></button>
      </div>

      <div class="row" style="gap:10px;margin-top:18px">
        <button class="btn btn-ghost" data-step="0">${A.icon('back', 17)} ${A.t('common.back')}</button>
        <button class="btn" style="flex:1" data-step="2">${A.t('common.continue')} ${A.icon('chev', 17)}</button>
      </div>
    </div>`;
  }

  /* ---- Paso 2: calidad ---- */
  function stepQuality(s) {
    return `<div class="card card-p">
      <label class="label">Nivel de acabados y materiales</label>
      <div class="stack" style="gap:9px">
        ${A.data.QUALITIES.map((q) => {
          const est = A.engine.quote({ serviceId:s.id, qty:W.qty, quality:q.id, province:W.province, urgency:W.urgency, extras:[], vivienda2anios:W.vivienda2anios });
          return `<button class="opt ${W.quality === q.id ? 'sel' : ''}" data-qual="${q.id}" style="display:block">
            <span class="check">${A.icon('check-circle', 17)}</span>
            <div class="between" style="gap:10px">
              <div><div class="opt-t">${A.esc(q.name)}</div><div class="opt-d">${A.esc(q.desc)}</div></div>
              <div style="text-align:right;flex:none">
                <div style="font-weight:800;font-size:16px">${A.eur(est.total)}</div>
                <div class="small muted">IVA incl.</div>
              </div>
            </div></button>`;
        }).join('')}
      </div>
      <div class="hint" style="margin-top:12px">${A.icon('info', 13)} Los importes incluyen materiales, mano de obra y limpieza final.</div>
      <div class="row" style="gap:10px;margin-top:18px">
        <button class="btn btn-ghost" data-step="1">${A.icon('back', 17)} ${A.t('common.back')}</button>
        <button class="btn" style="flex:1" data-step="3">${A.t('common.continue')} ${A.icon('chev', 17)}</button>
      </div>
    </div>`;
  }

  /* ---- Paso 3: extras ---- */
  function stepExtras(s) {
    const cart = W.materials || [];
    return `<div class="card card-p">
      <label class="label">Añade lo que necesites (opcional)</label>
      <div class="stack" style="gap:9px">
        ${(s.extras || []).map((e) => `
          <button class="opt ${W.extras.indexOf(e.id) !== -1 ? 'sel' : ''}" data-extra="${e.id}" style="display:block">
            <span class="check">${A.icon('check-circle', 17)}</span>
            <div class="between" style="gap:10px">
              <div><div class="opt-t">${A.esc(e.name)}</div>
                <div class="opt-d">${e.type === 'unit' ? 'Por ' + A.esc(s.unitName) : 'Partida alzada'}</div></div>
              <div style="font-weight:700;flex:none">+${A.eur(e.price)}</div>
            </div></button>`).join('')}
      </div>

      ${cart.length ? `<hr class="divider">
        <div class="between" style="margin-bottom:8px">
          <label class="label" style="margin:0">Materiales del comparador</label>
          <button class="link" id="q-clearmat">Quitar todos</button>
        </div>
        ${cart.map((m, i) => `<div class="line">
          <span>${A.esc(m.name)} <span class="muted small">×${m.qty}</span></span>
          <span>${A.eur(m.price * m.qty, 2)}</span></div>`).join('')}` : ''}

      <hr class="divider">
      <label class="label">Notas para el equipo técnico</label>
      <textarea class="textarea" id="q-notes" placeholder="Ej.: la finca no tiene ascensor, el cuadro está en el rellano…">${A.esc(W.client.notes || '')}</textarea>

      <div class="row" style="gap:10px;margin-top:18px">
        <button class="btn btn-ghost" data-step="2">${A.icon('back', 17)} ${A.t('common.back')}</button>
        <button class="btn" style="flex:1" data-step="4">${A.t('common.continue')} ${A.icon('chev', 17)}</button>
      </div>
    </div>`;
  }

  /* ---- Paso 4: datos del cliente ---- */
  function stepClient(s) {
    const c = W.client;
    return `<div class="card card-p">
      <div class="gf">
        <div class="field"><label class="label">Nombre y apellidos *</label>
          <input class="input" id="c-name" value="${A.esc(c.name)}" placeholder="Nombre completo"></div>
        <div class="field"><label class="label">Teléfono *</label>
          <input class="input" id="c-phone" value="${A.esc(c.phone)}" placeholder="600 000 000" inputmode="tel"></div>
      </div>
      <div class="field"><label class="label">Correo electrónico *</label>
        <input class="input" id="c-email" type="email" value="${A.esc(c.email)}" placeholder="tu@correo.es"></div>
      <div class="field"><label class="label">Dirección de la obra</label>
        <input class="input" id="c-address" value="${A.esc(c.address)}" placeholder="Calle, número, población"></div>

      <div class="switchrow">
        <div><div style="font-weight:600;font-size:14px">Acepto la política de privacidad</div>
          <div class="small muted">Tratamos tus datos para elaborar y enviarte el presupuesto (RGPD).
            <a class="link" href="#/privacidad">Leer</a></div></div>
        <button class="switch ${W.consent ? 'on' : ''}" id="c-consent"></button>
      </div>

      <div id="c-error" class="small" style="color:var(--red);margin-top:10px;display:none"></div>

      <div class="row" style="gap:10px;margin-top:18px">
        <button class="btn btn-ghost" data-step="3">${A.icon('back', 17)} ${A.t('common.back')}</button>
        <button class="btn btn-accent" style="flex:1" id="c-calc">${A.icon('calc', 18)} Calcular presupuesto</button>
      </div>
    </div>`;
  }

  /* ---- Paso 5: resultado ---- */
  function stepResult(s) {
    const q = A.engine.quote(W);
    W.result = q;
    const groups = { principal:'Trabajos', extras:'Complementos', materiales:'Materiales', ajustes:'Ajustes' };
    return `
    <div class="total-card">
      <div class="lbl">${A.esc(A.t('quote.total'))}</div>
      <div class="big">${A.eur(q.total)}</div>
      <div class="small" style="color:rgba(255,255,255,.7);margin-top:2px">
        IVA incluido · horquilla ${A.eur(q.rangeLow)} – ${A.eur(q.rangeHigh)}</div>
      <div class="row wrap" style="gap:18px;margin-top:16px">
        <div><div class="lbl">${A.esc(A.t('quote.duration'))}</div>
          <div style="font-size:17px;font-weight:700">${q.days} ${A.esc(A.t('quote.days'))}</div></div>
        <div><div class="lbl">Precio por ${A.esc(s.unitName)}</div>
          <div style="font-size:17px;font-weight:700">${A.eur(q.pricePerUnit, 2)}</div></div>
        <div><div class="lbl">Calidad</div>
          <div style="font-size:17px;font-weight:700">${A.esc(q.quality.name)}</div></div>
      </div>
    </div>

    <div class="row wrap" style="gap:9px;margin-top:14px">
      <button class="btn" id="r-pdf">${A.icon('download', 18)} Descargar PDF</button>
      <button class="btn btn-wa" id="r-wa">${A.icon('whatsapp', 18)} WhatsApp</button>
      <button class="btn btn-ghost" id="r-mail">${A.icon('mail', 18)} Email</button>
      <button class="btn btn-soft" id="r-save">${A.icon('check', 18)} Guardar</button>
    </div>

    <div class="card card-p" style="margin-top:14px">
      <div class="between" style="margin-bottom:8px">
        <strong style="font-size:15px">Desglose de partidas</strong>
        ${q.minApplied ? '<span class="badge badge-amber">Mínimo facturable aplicado</span>' : ''}
      </div>
      ${Object.keys(groups).map((g) => {
        const rows = q.lines.filter((l) => l.group === g);
        if (!rows.length) return '';
        return `<div class="small muted" style="margin:12px 0 4px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">${groups[g]}</div>
          ${rows.map((l) => `<div class="line">
            <span style="flex:1">${A.esc(l.concept)}<br><span class="small muted">${A.esc(l.detail || '')}</span></span>
            <span>${A.eur(l.amount, 2)}</span></div>`).join('')}`;
      }).join('')}
      <hr class="divider">
      <div class="line"><span>${A.esc(A.t('quote.subtotal'))}</span><span>${A.eur(q.base, 2)}</span></div>
      <div class="line"><span>${A.esc(A.t('quote.vat'))} (${Math.round(q.vatRate * 100)} %)</span><span>${A.eur(q.vat, 2)}</span></div>
      <div class="line" style="font-size:17px"><span style="font-weight:800">TOTAL</span>
        <span style="font-weight:800">${A.eur(q.total)}</span></div>
    </div>

    <div class="grid g2" style="gap:12px;margin-top:12px">
      <div class="card card-p">
        <strong style="font-size:14.5px">El precio incluye</strong>
        <div class="stack" style="gap:7px;margin-top:9px">
          ${q.includes.map((i) => `<div class="row" style="gap:8px;align-items:flex-start">
            <span style="color:var(--green);flex:none">${A.icon('check', 15)}</span>
            <span class="small">${A.esc(i)}</span></div>`).join('')}
        </div>
      </div>
      <div class="card card-p">
        <strong style="font-size:14.5px">Plan de pagos</strong>
        <div style="margin-top:9px">
          ${q.payments.map((p) => `<div class="line">
            <span class="small">${Math.round(p.pct * 100)} % · ${A.esc(p.label)}</span>
            <span>${A.eur(p.amount)}</span></div>`).join('')}
        </div>
        <a class="btn btn-soft btn-sm btn-block" style="margin-top:12px" href="#/pagos">${A.icon('card', 16)} Pagar anticipo</a>
      </div>
    </div>

    <div class="card card-p" style="margin-top:12px">
      <div class="between wrap" style="gap:12px">
        <div><strong style="font-size:14.5px">¿Lo confirmamos con una visita técnica?</strong>
          <p class="small muted" style="margin-top:3px">Gratuita y sin compromiso. Convierte esta estimación en precio cerrado.</p></div>
        <a class="btn" href="#/citas">${A.icon('calendar', 17)} Reservar visita</a>
      </div>
    </div>

    <p class="small muted center" style="margin:14px 0 24px">${A.esc(A.t('quote.validity'))} ·
      Estimación calculada con tarifas de ${A.esc(q.province)} (coef. ${q.regionFactor.toFixed(2)}).</p>

    <div class="row" style="gap:10px;margin-bottom:24px">
      <button class="btn btn-ghost" data-step="3">${A.icon('back', 17)} Cambiar opciones</button>
      <a class="btn btn-ghost" style="flex:1" href="#/presupuestos">Ver mis presupuestos</a>
    </div>`;
  }

  /* ---------------- Eventos ---------------- */
  function bind() {
    const root = A.$('#outlet');
    const svc = A.data.service(W.serviceId);

    A.$$('[data-svc]').forEach((b) => b.addEventListener('click', () => {
      W.serviceId = b.dataset.svc;
      const s = A.data.service(W.serviceId);
      W.qty = s.qty.def; W.extras = []; W.step = 1; save(); A.render();
    }));
    A.$$('[data-step]').forEach((b) => b.addEventListener('click', () => {
      W.step = Number(b.dataset.step); save(); A.render();
    }));
    const reset = A.$('#w-reset');
    if (reset) reset.addEventListener('click', async () => {
      if (await A.confirm('Reiniciar presupuesto', '¿Seguro que quieres empezar de cero?', 'Reiniciar')) {
        A.draft.clear(); W = null; A.go('/presupuesto'); A.render();
      }
    });

    /* Paso alcance */
    const qv = A.$('#q-val'), qr = A.$('#q-range');
    const setQty = (v) => {
      W.qty = A.clamp(Number(v) || svc.qty.min, svc.qty.min, svc.qty.max);
      if (qv) qv.value = W.qty; if (qr) qr.value = W.qty; save();
    };
    if (qv) qv.addEventListener('input', (e) => setQty(e.target.value));
    if (qr) qr.addEventListener('input', (e) => setQty(e.target.value));
    const minus = A.$('#q-minus'), plus = A.$('#q-plus');
    if (minus) minus.addEventListener('click', () => setQty(W.qty - svc.qty.step));
    if (plus) plus.addEventListener('click', () => setQty(W.qty + svc.qty.step));
    const prov = A.$('#q-prov');
    if (prov) prov.addEventListener('change', (e) => { W.province = e.target.value; save(); });
    A.$$('[data-urg]').forEach((b) => b.addEventListener('click', () => {
      W.urgency = b.dataset.urg; save();
      A.$$('[data-urg]').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    const iva = A.$('#q-iva');
    if (iva) iva.addEventListener('click', () => { W.vivienda2anios = !W.vivienda2anios; iva.classList.toggle('on', W.vivienda2anios); save(); });

    /* Calidad */
    A.$$('[data-qual]').forEach((b) => b.addEventListener('click', () => {
      W.quality = b.dataset.qual; save(); W.step = 3; A.render();
    }));

    /* Extras */
    A.$$('[data-extra]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.extra, i = W.extras.indexOf(id);
      if (i === -1) W.extras.push(id); else W.extras.splice(i, 1);
      b.classList.toggle('sel'); save();
    }));
    const notes = A.$('#q-notes');
    if (notes) notes.addEventListener('input', (e) => { W.client.notes = e.target.value; save(); });
    const cm = A.$('#q-clearmat');
    if (cm) cm.addEventListener('click', () => { W.materials = []; A.cart.clear(); save(); A.render(); });

    /* Cliente */
    ['name', 'email', 'phone', 'address'].forEach((f) => {
      const el = A.$('#c-' + f);
      if (el) el.addEventListener('input', (e) => { W.client[f] = e.target.value; save(); });
    });
    const cons = A.$('#c-consent');
    if (cons) cons.addEventListener('click', () => { W.consent = !W.consent; cons.classList.toggle('on', W.consent); save(); });
    const calc = A.$('#c-calc');
    if (calc) calc.addEventListener('click', () => {
      const err = [];
      if (!A.v.required(W.client.name)) err.push('Indica tu nombre.');
      if (!A.v.email(W.client.email)) err.push('El correo no parece válido.');
      if (!A.v.phone(W.client.phone)) err.push('El teléfono no parece válido (9 dígitos).');
      if (!W.consent) err.push('Debes aceptar la política de privacidad.');
      const box = A.$('#c-error');
      if (err.length) { box.style.display = 'block'; box.innerHTML = err.map(A.esc).join('<br>'); return; }
      W.step = 5; save(); A.render();
    });

    /* Resultado */
    const q = W.result;
    const pdfBtn = A.$('#r-pdf');
    if (pdfBtn) pdfBtn.addEventListener('click', async () => {
      let rec; try { rec = await persist(q, 'borrador'); } catch (e) { return; }
      const blob = A.docs.quotePDF(q, W.client, rec.ref);
      A.download(`Presupuesto-${rec.ref}.pdf`, blob);
      A.toast('PDF descargado', 'ok');
    });
    const wa = A.$('#r-wa');
    if (wa) wa.addEventListener('click', async () => {
      let rec; try { rec = await persist(q, 'enviado'); } catch (e) { return; }
      const txt = encodeURIComponent(
        `*${A.data.COMPANY.legalName}* — Presupuesto ${rec.ref}\n\n` +
        `Trabajo: ${q.service.name}\nMedición: ${A.num(q.qty)} ${q.service.unitName}\n` +
        `Calidad: ${q.quality.name}\nProvincia: ${q.province}\n\n` +
        `*TOTAL: ${A.eur(q.total)}* (IVA incl.)\nPlazo: ${q.days} días laborables\n\n` +
        `Validez 30 días. ${A.data.COMPANY.phone}`);
      window.open(`https://wa.me/${A.data.COMPANY.whatsapp.replace(/[^\d]/g, '')}?text=${txt}`, '_blank');
      A.toast('Abriendo WhatsApp…');
    });
    const mail = A.$('#r-mail');
    if (mail) mail.addEventListener('click', async () => {
      let rec; try { rec = await persist(q, 'enviado'); } catch (e) { return; }
      const body = encodeURIComponent(
        `Hola ${W.client.name},\n\nAdjuntamos el resumen de tu presupuesto ${rec.ref}.\n\n` +
        `Trabajo: ${q.service.name}\nMedición: ${A.num(q.qty)} ${q.service.unitName}\n` +
        `Calidad: ${q.quality.name}\nBase imponible: ${A.eur(q.base, 2)}\nIVA: ${A.eur(q.vat, 2)}\n` +
        `TOTAL: ${A.eur(q.total)}\nPlazo estimado: ${q.days} días laborables\n\n` +
        `Puedes descargar el PDF desde tu área de cliente.\n\n${A.data.COMPANY.legalName}\n${A.data.COMPANY.phone}`);
      window.location.href = `mailto:${W.client.email}?subject=${encodeURIComponent('Presupuesto ' + rec.ref + ' · ' + A.data.COMPANY.name)}&body=${body}`;
    });
    const sv = A.$('#r-save');
    if (sv) sv.addEventListener('click', async () => {
      let rec; try { rec = await persist(q, 'borrador'); } catch (e) { return; }
      await A.notify('Presupuesto guardado', `${rec.ref} · ${q.service.name} · ${A.eur(q.total)}`, 'file-text', '#/presupuestos');
      A.toast('Guardado en tus presupuestos', 'ok');
      A.refreshBadge();
    });
  }

  /* Guarda (una sola vez por sesión de asistente) */
  async function persist(q, status) {
    if (!A.requireAuth('Entra en tu cuenta para guardar el presupuesto')) throw new Error('sesión requerida');
    if (W.savedRef) {
      const ex = await A.db.get('quotes', W.savedId);
      if (ex) { await A.db.update('quotes', W.savedId, { status }); return ex; }
    }
    const n = (await A.db.list('quotes')).length + 1;
    const rec = await A.db.insert('quotes', {
      user_id: A.state.user ? A.state.user.id : 'anon',
      ref: A.ref('PRES', n), service_id:q.service.id, service_name:q.service.name, category:q.service.cat,
      qty:q.qty, quality:q.quality.id, province:q.province, urgency:q.urgency.id,
      extras:W.extras, materials:W.materials, base:q.base, vat:q.vat, total:q.total, days:q.days,
      status: status || 'borrador',
      client_name:W.client.name, client_email:W.client.email, client_phone:W.client.phone,
      client_address:W.client.address, notes:W.client.notes || '', vivienda2anios:W.vivienda2anios
    });
    W.savedRef = rec.ref; W.savedId = rec.id; save();
    return rec;
  }

  /* ---------------- HISTORIAL ---------------- */
  const STATUS = {
    borrador:{ l:'Borrador', c:'badge-grey' }, enviado:{ l:'Enviado', c:'badge-navy' },
    aceptado:{ l:'Aceptado', c:'badge-green' }, en_obra:{ l:'En obra', c:'badge-amber' },
    finalizado:{ l:'Finalizado', c:'badge-green' }, rechazado:{ l:'Rechazado', c:'badge-red' }
  };
  A.ui.statusBadge = (s) => {
    const x = STATUS[s] || STATUS.borrador;
    return `<span class="badge ${x.c}">${x.l}</span>`;
  };

  A.route('/presupuestos', async () => {
    const rows = await A.db.list('quotes', A.state.user ? { user_id: A.state.user.id } : null);
    A.onMount(() => {
      A.$$('[data-del]').forEach((b) => b.addEventListener('click', async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (await A.confirm('Eliminar presupuesto', 'Esta acción no se puede deshacer.', 'Eliminar')) {
          await A.db.remove('quotes', b.dataset.del); A.render(); A.toast('Presupuesto eliminado');
        }
      }));
    });
    if (!rows.length) {
      return `<div class="container"><div class="empty" style="padding-top:60px">${A.icon('file-text', 44)}
        <h3>Todavía no tienes presupuestos</h3><p class="small">Calcula uno en menos de dos minutos.</p>
        <a class="btn" style="margin-top:16px" href="#/presupuesto">${A.icon('calc', 18)} Crear presupuesto</a></div></div>`;
    }
    const total = rows.reduce((s, r) => s + (r.total || 0), 0);
    return `<div class="container" style="padding-top:18px">
      <div class="between" style="margin-bottom:14px">
        <div><div class="sec-title">${A.esc(A.t('nav.quotes'))}</div>
          <div class="sec-sub">${rows.length} presupuestos · ${A.eur(total)} en total</div></div>
        <a class="btn btn-sm" href="#/presupuesto">${A.icon('plus', 16)} ${A.t('common.new')}</a>
      </div>
      <div class="stack">
        ${rows.map((r) => `<a class="card card-hover card-p" href="#/presupuesto-detalle/${r.id}">
          <div class="between" style="gap:10px">
            <div style="min-width:0">
              <div class="row" style="gap:7px;margin-bottom:4px">
                <span class="mono small muted">${A.esc(r.ref)}</span>${A.ui.statusBadge(r.status)}
              </div>
              <div style="font-weight:700;font-size:15px">${A.esc(r.service_name)}</div>
              <div class="small muted" style="margin-top:3px">
                ${A.num(r.qty)} ud · ${A.esc(r.province)} · ${A.dateFmt(r.created_at)}</div>
            </div>
            <div style="text-align:right;flex:none">
              <div style="font-weight:800;font-size:17px">${A.eur(r.total)}</div>
              <button class="link small" data-del="${r.id}" style="color:var(--red);margin-top:4px">Eliminar</button>
            </div>
          </div></a>`).join('')}
      </div><div style="height:20px"></div></div>`;
  }, { title:'Mis presupuestos' });

  /* ---------------- DETALLE ---------------- */
  A.route('/presupuesto-detalle/:id', async (p) => {
    const r = await A.db.get('quotes', p.id);
    if (!r) return `<div class="container"><div class="empty">${A.icon('alert', 40)}<h3>Presupuesto no encontrado</h3></div></div>`;
    const q = A.engine.quote({ serviceId:r.service_id, qty:r.qty, quality:r.quality, province:r.province,
      urgency:r.urgency, extras:r.extras || [], materials:r.materials || [], vivienda2anios:r.vivienda2anios });
    const client = { name:r.client_name, email:r.client_email, phone:r.client_phone, address:r.client_address };

    A.onMount(() => {
      A.$('#d-pdf').addEventListener('click', () => {
        A.download(`Presupuesto-${r.ref}.pdf`, A.docs.quotePDF(q, client, r.ref));
        A.toast('PDF descargado', 'ok');
      });
      A.$('#d-status').addEventListener('change', async (e) => {
        await A.db.update('quotes', r.id, { status:e.target.value });
        A.toast('Estado actualizado', 'ok');
      });
      A.$('#d-wa').addEventListener('click', () => {
        const txt = encodeURIComponent(`Presupuesto ${r.ref} — ${r.service_name}: ${A.eur(r.total)} (IVA incl.)`);
        window.open(`https://wa.me/${A.data.COMPANY.whatsapp.replace(/[^\d]/g, '')}?text=${txt}`, '_blank');
      });
    });

    return `<div class="container" style="padding-top:16px;max-width:840px">
      <a class="link" href="#/presupuestos">${A.icon('back', 15)} Volver</a>
      <div class="total-card" style="margin-top:12px">
        <div class="between"><div>
          <div class="lbl">${A.esc(r.ref)}</div>
          <div class="big">${A.eur(r.total)}</div>
          <div class="small" style="color:rgba(255,255,255,.7)">${A.esc(r.service_name)} · ${A.esc(r.province)}</div>
        </div>${A.ui.statusBadge(r.status)}</div>
      </div>
      <div class="row wrap" style="gap:9px;margin-top:14px">
        <button class="btn" id="d-pdf">${A.icon('download', 18)} PDF</button>
        <button class="btn btn-wa" id="d-wa">${A.icon('whatsapp', 18)} Compartir</button>
        <select class="select" id="d-status" style="width:auto;flex:1;min-width:150px">
          ${Object.keys(STATUS).map((k) => `<option value="${k}" ${r.status === k ? 'selected' : ''}>${STATUS[k].l}</option>`).join('')}
        </select>
      </div>
      <div class="card card-p" style="margin-top:14px">
        <strong style="font-size:15px">Partidas</strong>
        ${q.lines.map((l) => `<div class="line"><span style="flex:1">${A.esc(l.concept)}</span>
          <span>${A.eur(l.amount, 2)}</span></div>`).join('')}
        <hr class="divider">
        <div class="line"><span>Base imponible</span><span>${A.eur(q.base, 2)}</span></div>
        <div class="line"><span>IVA ${Math.round(q.vatRate * 100)} %</span><span>${A.eur(q.vat, 2)}</span></div>
        <div class="line" style="font-size:16px"><span style="font-weight:800">TOTAL</span>
          <span style="font-weight:800">${A.eur(q.total)}</span></div>
      </div>
      <div class="card card-p" style="margin-top:12px">
        <strong style="font-size:15px">Cliente</strong>
        <div class="line"><span class="muted">Nombre</span><span>${A.esc(r.client_name || '—')}</span></div>
        <div class="line"><span class="muted">Correo</span><span>${A.esc(r.client_email || '—')}</span></div>
        <div class="line"><span class="muted">Teléfono</span><span>${A.esc(r.client_phone || '—')}</span></div>
        <div class="line"><span class="muted">Dirección</span><span>${A.esc(r.client_address || '—')}</span></div>
        ${r.notes ? `<div class="line"><span class="muted">Notas</span><span>${A.esc(r.notes)}</span></div>` : ''}
        <div class="line"><span class="muted">Emitido</span><span>${A.dateFmt(r.created_at, true)}</span></div>
      </div>
      <div style="height:24px"></div>
    </div>`;
  }, { title:'Presupuesto' });
})(window.App);

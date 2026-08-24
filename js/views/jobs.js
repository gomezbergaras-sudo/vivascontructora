/* ============================================================
   views/jobs.js — Trabaja con nosotros: ofertas y candidaturas
   ============================================================ */
(function (A) {
  'use strict';

  const MAX_MB = 5;
  const MAX_LOCAL_MB = 1;   // sin Supabase el archivo se guarda en el dispositivo
  const TYPES = {
    'application/pdf':'PDF',
    'application/msword':'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'DOCX',
    'image/jpeg':'JPG', 'image/png':'PNG'
  };

  let F = null;
  function init(vacancyId) {
    F = F || { trade:'', vacancy:'', name:'', email:'', phone:'', city:'', experience:'',
      contract:'', availability:'', licence:false, ownVehicle:false, message:'',
      file:null, consent:false, sent:null };
    if (vacancyId) {
      const v = A.data.vacancy(vacancyId);
      if (v) { F.vacancy = v.id; F.trade = v.trade || F.trade; }
    }
    return F;
  }

  /* ---------------- Vista principal ---------------- */
  A.route('/empleo', async (p, qs) => {
    init(qs.oferta);
    A.onMount(bind);
    const C = A.data.COMPANY;
    const open = A.data.VACANCIES.filter((v) => v.open !== false);

    if (F.sent) return confirmacion();

    return `<div class="container" style="padding-top:16px;max-width:840px">

      <div class="card" style="overflow:hidden;margin-bottom:16px">
        <div style="background:linear-gradient(150deg,var(--navy-800),var(--navy-600));padding:22px 20px;color:#fff">
          <div class="row" style="gap:12px;margin-bottom:12px">
            <img src="${A.brand.mark256}" alt="" style="width:48px;height:48px;object-fit:contain;flex:none">
            <div>
              <div class="brand-name" style="color:#fff;font-size:21px">Trabaja con nosotros</div>
              <div class="small" style="color:rgba(255,255,255,.6);letter-spacing:.13em;text-transform:uppercase;font-weight:600;font-size:10px">${A.esc(C.name)} · Bolsa de empleo</div>
            </div>
          </div>
          <p style="color:rgba(255,255,255,.82);font-size:14.5px;max-width:56ch">${A.esc(A.data.JOB_PITCH)}</p>
        </div>
        <div class="grid g4" style="padding:14px;gap:10px">
          ${A.data.JOB_PERKS.map((k) => `<div class="center" style="padding:8px 4px">
              <div style="color:var(--accent);display:grid;place-items:center;margin-bottom:5px">${A.icon(k.icon, 19)}</div>
              <div style="font-weight:700;font-size:13px">${A.esc(k.t)}</div>
              <div class="small muted">${A.esc(k.d)}</div></div>`).join('')}
        </div>
      </div>

      ${open.length ? `
        <div class="sec-head" style="margin-top:0"><div>
          <div class="sec-title">Ofertas abiertas</div>
          <div class="sec-sub">${open.length} ${open.length === 1 ? 'puesto' : 'puestos'} ahora mismo</div></div></div>
        <div class="stack" style="margin-bottom:8px">
          ${open.map((v) => `<div class="card card-p">
            <div class="between wrap" style="gap:10px">
              <div style="min-width:0">
                <div style="font-weight:700;font-size:15.5px">${A.esc(v.title)}</div>
                <div class="row wrap small muted" style="gap:12px;margin-top:5px">
                  <span>${A.icon('pin', 13)} ${A.esc(v.place || 'Cataluña')}</span>
                  <span>${A.icon('briefcase', 13)} ${A.esc(v.contract || 'A convenir')}</span>
                  ${v.schedule ? `<span>${A.icon('clock', 13)} ${A.esc(v.schedule)}</span>` : ''}
                  ${v.salary ? `<span>${A.icon('euro', 13)} ${A.esc(v.salary)}</span>` : ''}
                </div>
              </div>
              <button class="btn btn-sm" data-apply="${v.id}">Me interesa</button>
            </div>
            ${(v.requirements || []).length ? `<hr class="divider">
              <div class="small" style="font-weight:700;margin-bottom:6px">Qué pedimos</div>
              ${v.requirements.map((r) => `<div class="row" style="gap:8px;align-items:flex-start;margin-bottom:4px">
                <span style="color:var(--green);flex:none">${A.icon('check', 14)}</span>
                <span class="small">${A.esc(r)}</span></div>`).join('')}` : ''}
          </div>`).join('')}
        </div>` : `
        <div class="card card-p" style="margin-bottom:14px;background:var(--primary-soft);border-color:var(--primary)">
          <div class="row" style="gap:11px;align-items:flex-start">
            <span style="color:var(--primary);flex:none">${A.icon('info', 20)}</span>
            <div><strong style="font-size:14.5px">Ahora mismo no hay ninguna oferta publicada</strong>
              <p class="small muted" style="margin-top:4px">Aun así, déjanos tu currículum. Trabajamos por obras y
              cuando entra uno nuevo tiramos primero de la gente que ya tenemos en la bolsa.</p></div>
          </div>
        </div>`}

      <div class="sec-head"><div>
        <div class="sec-title">Envíanos tu candidatura</div>
        <div class="sec-sub">Dos minutos. Te contestamos siempre, aunque sea para decirte que no.</div></div></div>

      <div class="card card-p" id="form-empleo">
        ${F.vacancy ? `<div class="row between" style="background:var(--primary-soft);border-radius:12px;padding:10px 13px;margin-bottom:14px">
          <span class="small"><strong>Te presentas a:</strong> ${A.esc((A.data.vacancy(F.vacancy) || {}).title || '')}</span>
          <button class="link small" id="j-clearvac">Quitar</button></div>` : ''}

        <label class="label">¿A qué te dedicas? *</label>
        <select class="select" id="j-trade">
          <option value="">Elige tu oficio…</option>
          ${A.data.TRADES.map((t) => `<option value="${t.id}" ${F.trade === t.id ? 'selected' : ''}>${A.esc(t.name)}</option>`).join('')}
        </select>

        <div class="gf" style="margin-top:14px">
          <div class="field"><label class="label">Nombre y apellidos *</label>
            <input class="input" id="j-name" value="${A.esc(F.name)}" autocomplete="name"></div>
          <div class="field"><label class="label">Teléfono *</label>
            <input class="input" id="j-phone" value="${A.esc(F.phone)}" inputmode="tel" placeholder="600 000 000"></div>
        </div>
        <div class="gf">
          <div class="field"><label class="label">Correo electrónico *</label>
            <input class="input" id="j-email" type="email" value="${A.esc(F.email)}" autocomplete="email"></div>
          <div class="field"><label class="label">Población donde vives *</label>
            <input class="input" id="j-city" value="${A.esc(F.city)}" placeholder="Amposta, Tortosa…"></div>
        </div>

        <div class="gf">
          <div class="field"><label class="label">Experiencia en el oficio *</label>
            <select class="select" id="j-exp"><option value="">Elige…</option>
              ${A.data.EXPERIENCE.map((e) => `<option value="${e.id}" ${F.experience === e.id ? 'selected' : ''}>${A.esc(e.name)}</option>`).join('')}
            </select></div>
          <div class="field"><label class="label">Cómo prefieres trabajar</label>
            <select class="select" id="j-contract"><option value="">Elige…</option>
              ${A.data.CONTRACT.map((c) => `<option value="${c.id}" ${F.contract === c.id ? 'selected' : ''}>${A.esc(c.name)}</option>`).join('')}
            </select></div>
        </div>

        <div class="field"><label class="label">Cuándo podrías empezar</label>
          <div class="chips">${A.data.AVAILABILITY.map((a) => `
            <button class="chip ${F.availability === a.id ? 'sel' : ''}" data-avail="${a.id}">${A.esc(a.name)}</button>`).join('')}</div></div>

        <div class="switchrow">
          <div><div style="font-weight:600;font-size:14px">Carnet de conducir B</div>
            <div class="small muted">Nos movemos entre obras a diario.</div></div>
          <button class="switch ${F.licence ? 'on' : ''}" id="j-licence"></button>
        </div>
        <div class="switchrow">
          <div><div style="font-weight:600;font-size:14px">Vehículo propio</div>
            <div class="small muted">No es imprescindible, pero suma.</div></div>
          <button class="switch ${F.ownVehicle ? 'on' : ''}" id="j-vehicle"></button>
        </div>

        <hr class="divider">
        <label class="label">Tu currículum</label>
        <div id="j-drop" class="card-p" style="border:2px dashed var(--border-strong);border-radius:13px;text-align:center;cursor:pointer;padding:22px">
          ${F.file ? `<div class="row" style="gap:11px;justify-content:center">
              <span style="color:var(--green)">${A.icon('check-circle', 22)}</span>
              <div style="text-align:left">
                <div style="font-weight:700;font-size:14px">${A.esc(F.file.name)}</div>
                <div class="small muted">${A.esc(F.file.kind)} · ${A.num(F.file.size / 1024, 0)} KB</div>
              </div></div>
            <button class="link small" id="j-clearfile" style="margin-top:9px">Cambiar archivo</button>`
            : `<div class="muted">${A.icon('upload', 30)}</div>
               <div style="font-weight:700;font-size:14px;margin-top:8px">Toca para adjuntar tu CV</div>
               <div class="small muted" style="margin-top:3px">PDF, Word, JPG o PNG · hasta ${MAX_MB} MB</div>`}
        </div>
        <input type="file" id="j-file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="display:none">
        <div class="hint">Si no tienes el CV a mano, no pasa nada: cuéntanoslo abajo y ya nos lo mandas después.</div>

        <div class="field" style="margin-top:14px"><label class="label">Cuéntanos algo de ti</label>
          <textarea class="textarea" id="j-message" placeholder="Qué sabes hacer, en qué obras has trabajado, qué buscas…">${A.esc(F.message)}</textarea></div>

        <div class="switchrow">
          <div><div style="font-weight:600;font-size:14px">Autorizo el tratamiento de mis datos *</div>
            <div class="small muted">Usaremos tu CV solo para procesos de selección de ${A.esc(C.name)} y lo
              conservaremos 12 meses. <a class="link" href="#/privacidad">Más información</a></div></div>
          <button class="switch ${F.consent ? 'on' : ''}" id="j-consent"></button>
        </div>

        <div id="j-error" class="small" style="color:var(--red);display:none;margin-top:10px"></div>

        <button class="btn btn-accent btn-block btn-lg" id="j-send" style="margin-top:16px">
          ${A.icon('send', 18)} Enviar candidatura</button>

        <div class="row wrap" style="gap:8px;margin-top:12px;justify-content:center">
          <a class="btn btn-wa btn-sm" target="_blank" rel="noopener"
             href="https://wa.me/${C.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hola, os escribo por la bolsa de empleo de ' + C.name + '.')}">
            ${A.icon('whatsapp', 15)} Prefiero escribir por WhatsApp</a>
        </div>
      </div>
      <div style="height:26px"></div>
    </div>`;
  }, { title:'Trabaja con nosotros' });

  /* ---------------- Confirmación ---------------- */
  function confirmacion() {
    const s = F.sent;
    return `<div class="container" style="padding-top:40px;max-width:560px">
      <div class="card card-p center" style="padding:34px 22px">
        <div style="color:var(--green)">${A.icon('check-circle', 52)}</div>
        <h1 style="font-size:21px;margin-top:14px">Candidatura recibida</h1>
        <p class="muted" style="margin-top:8px">Gracias, ${A.esc(s.name.split(' ')[0])}. La revisamos y te
          contestamos en los próximos días, tanto si encaja como si no.</p>
        <div class="card card-p" style="margin-top:18px;text-align:left;background:var(--surface-2)">
          <div class="line"><span class="muted">Referencia</span><span class="mono">${A.esc(s.ref)}</span></div>
          <div class="line"><span class="muted">Oficio</span><span>${A.esc(s.tradeName)}</span></div>
          <div class="line"><span class="muted">Currículum</span>
            <span>${s.cv ? A.esc(s.cv) : 'No adjuntado'}</span></div>
          <div class="line"><span class="muted">Fecha</span><span>${A.dateFmt(new Date().toISOString(), true)}</span></div>
        </div>
        ${s.warn ? `<p class="small" style="color:var(--amber-dark);margin-top:12px">${A.esc(s.warn)}</p>` : ''}
        <div class="row wrap" style="gap:9px;justify-content:center;margin-top:20px">
          <a class="btn btn-ghost btn-sm" href="#/">Volver al inicio</a>
          <button class="btn btn-ghost btn-sm" id="j-again">Enviar otra candidatura</button>
        </div>
      </div>
    </div>`;
  }

  /* ---------------- Eventos ---------------- */
  function bind() {
    const again = A.$('#j-again');
    if (again) return again.addEventListener('click', () => { F = null; init(); A.render(); });

    const set = (id, key) => {
      const el = A.$('#' + id);
      if (el) el.addEventListener('input', (e) => { F[key] = e.target.value; });
    };
    set('j-name', 'name'); set('j-email', 'email'); set('j-phone', 'phone');
    set('j-city', 'city'); set('j-message', 'message');
    const sel = (id, key) => {
      const el = A.$('#' + id);
      if (el) el.addEventListener('change', (e) => { F[key] = e.target.value; });
    };
    sel('j-trade', 'trade'); sel('j-exp', 'experience'); sel('j-contract', 'contract');

    A.$$('[data-avail]').forEach((b) => b.addEventListener('click', () => {
      F.availability = b.dataset.avail;
      A.$$('[data-avail]').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    const toggle = (id, key) => {
      const el = A.$('#' + id);
      if (el) el.addEventListener('click', () => { F[key] = !F[key]; el.classList.toggle('on', F[key]); });
    };
    toggle('j-licence', 'licence'); toggle('j-vehicle', 'ownVehicle'); toggle('j-consent', 'consent');

    A.$$('[data-apply]').forEach((b) => b.addEventListener('click', () => {
      const v = A.data.vacancy(b.dataset.apply);
      F.vacancy = v.id; if (v.trade) F.trade = v.trade;
      A.render();
      setTimeout(() => { const f = A.$('#form-empleo'); if (f) f.scrollIntoView({ behavior:'smooth', block:'start' }); }, 120);
    }));
    const cv = A.$('#j-clearvac');
    if (cv) cv.addEventListener('click', () => { F.vacancy = ''; A.render(); });

    /* Archivo */
    const input = A.$('#j-file'), drop = A.$('#j-drop');
    if (drop) drop.addEventListener('click', () => input.click());
    if (input) input.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (!TYPES[f.type]) { A.toast('Formato no admitido. Envía PDF, Word, JPG o PNG.', 'err'); return; }
      if (f.size > MAX_MB * 1024 * 1024) { A.toast(`El archivo supera los ${MAX_MB} MB`, 'err'); return; }
      const fr = new FileReader();
      fr.onload = () => {
        F.file = { name:f.name, size:f.size, type:f.type, kind:TYPES[f.type], data:fr.result, blob:f };
        A.render();
      };
      fr.readAsDataURL(f);
    });
    const clr = A.$('#j-clearfile');
    if (clr) clr.addEventListener('click', (e) => { e.stopPropagation(); F.file = null; A.render(); });

    /* Envío */
    const send = A.$('#j-send');
    if (send) send.addEventListener('click', () => enviar(send));
  }

  async function enviar(btn) {
    const err = [];
    if (!F.trade) err.push('Elige tu oficio.');
    if (!A.v.min(F.name, 3)) err.push('Escribe tu nombre y apellidos.');
    if (!A.v.phone(F.phone)) err.push('El teléfono no parece válido.');
    if (!A.v.email(F.email)) err.push('El correo no parece válido.');
    if (!A.v.required(F.city)) err.push('Indica dónde vives.');
    if (!F.experience) err.push('Indica tu experiencia.');
    if (!F.consent) err.push('Necesitamos tu autorización para tratar los datos.');
    const box = A.$('#j-error');
    if (err.length) { box.style.display = 'block'; box.innerHTML = err.map(A.esc).join('<br>'); return; }
    box.style.display = 'none';

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Enviando…';

    let cvPath = '', cvData = '', warn = '';
    try {
      if (F.file) {
        if (A.db.mode === 'supabase') {
          const safe = F.file.name.replace(/[^\w.\-]+/g, '_').slice(-60);
          const path = `${new Date().getFullYear()}/${A.uid('cv')}-${safe}`;
          const { error } = await A.db.client.storage.from('curriculums')
            .upload(path, F.file.blob, { contentType:F.file.type, upsert:false });
          if (error) throw new Error(error.message);
          cvPath = path;
        } else if (F.file.size <= MAX_LOCAL_MB * 1024 * 1024) {
          cvData = F.file.data;
        } else {
          warn = 'Tu currículum era demasiado grande para guardarlo sin conexión. Te lo pediremos al contestarte.';
        }
      }

      const n = (await A.db.list('applications')).length + 1;
      const rec = await A.db.insert('applications', {
        ref: A.ref('CV', n),
        name:F.name, email:F.email.toLowerCase(), phone:F.phone, city:F.city,
        trade:F.trade, trade_name:(A.data.trade(F.trade) || {}).name || F.trade,
        vacancy:F.vacancy || null, experience:F.experience, contract:F.contract,
        availability:F.availability, licence:F.licence, own_vehicle:F.ownVehicle,
        message:F.message, cv_path:cvPath, cv_data:cvData,
        cv_name:F.file ? F.file.name : '', cv_type:F.file ? F.file.type : '',
        status:'nueva', consent_version:A.config.gdpr.consentVersion
      });

      F.sent = { ref:rec.ref, name:F.name, tradeName:rec.trade_name,
        cv:F.file ? F.file.name : '', warn };
      A.render();
      window.scrollTo({ top:0 });
    } catch (e) {
      console.error(e);
      btn.disabled = false;
      btn.innerHTML = A.icon('send', 18) + ' Enviar candidatura';
      box.style.display = 'block';
      box.textContent = 'No hemos podido enviar la candidatura: ' + (e.message || 'error desconocido') +
        '. Prueba de nuevo o escríbenos por WhatsApp.';
    }
  }

  /* ---------------- Descarga del CV (administración) ---------------- */
  A.jobs = {
    async cvUrl(rec) {
      if (rec.cv_data) return rec.cv_data;
      if (rec.cv_path && A.db.mode === 'supabase') {
        const { data, error } = await A.db.client.storage.from('curriculums')
          .createSignedUrl(rec.cv_path, 300);
        if (error) throw new Error(error.message);
        return data.signedUrl;
      }
      return null;
    }
  };
})(window.App);

/* ============================================================
   views/render.js — Generador de renders con IA
   ============================================================ */
(function (A) {
  'use strict';

  let R = null;
  function init() {
    R = R || { room:'Cocina', style:'moderno', palette:'neutros', materials:['madera','porcelanico'],
      desc:'', photo:null, results:null, busy:false, sel:0, deg:0 };
    return R;
  }

  A.route('/render', async () => {
    init();
    A.onMount(bind);
    const api = A.api.render;
    return `<div class="container" style="padding-top:16px;max-width:900px">
      <div class="sec-head" style="margin-top:0">
        <div><div class="sec-title">${A.esc(A.t('render.title'))}</div>
          <div class="sec-sub">Visualiza tu reforma antes de empezar</div></div>
        <a class="btn btn-ghost btn-sm" href="#/renders">${A.icon('image', 15)} Guardados</a>
      </div>

      <div class="grid g2" style="gap:14px;align-items:start">
        <div class="card card-p">
          <label class="label">1 · Foto del espacio actual</label>
          <div id="r-drop" class="thumb" style="aspect-ratio:4/3;border:2px dashed var(--border-strong);cursor:pointer;display:grid;place-items:center">
            ${R.photo ? `<img src="${R.photo}" alt="Foto actual" style="width:100%;height:100%;object-fit:cover">`
              : `<div class="center muted" style="padding:20px">${A.icon('camera', 34)}
                  <div class="small" style="margin-top:8px">Toca para subir una foto<br>o hacerla con la cámara</div></div>`}
          </div>
          <input type="file" id="r-file" accept="image/*" capture="environment" style="display:none">
          ${R.photo ? '<button class="link small" id="r-clear" style="margin-top:8px">Quitar foto</button>' : ''}

          <hr class="divider">
          <label class="label">2 · Estancia</label>
          <div class="chips">${api.ROOMS.map((x) => `<button class="chip ${R.room === x ? 'sel' : ''}" data-room="${x}">${x}</button>`).join('')}</div>

          <hr class="divider">
          <label class="label">3 · Estilo</label>
          <div class="optgrid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">
            ${api.STYLES.map((s) => `<button class="opt ${R.style === s.id ? 'sel' : ''}" data-style="${s.id}" style="padding:10px">
              <span class="check">${A.icon('check-circle', 15)}</span>
              <div class="row" style="gap:3px;margin-bottom:5px">
                ${s.pal.map((c) => `<span style="width:13px;height:13px;border-radius:4px;background:${c};display:inline-block"></span>`).join('')}</div>
              <div class="opt-t" style="font-size:13px">${A.esc(s.name)}</div>
              <div class="opt-d">${A.esc(s.desc)}</div></button>`).join('')}
          </div>

          <hr class="divider">
          <label class="label">4 · Colores predominantes</label>
          <div class="optgrid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">
            ${api.PALETTES.map((p) => `<button class="opt ${R.palette === p.id ? 'sel' : ''}" data-pal="${p.id}" style="padding:10px">
              <span class="check">${A.icon('check-circle', 15)}</span>
              <div class="row" style="gap:3px;margin-bottom:5px">
                ${p.colors.map((c) => `<span style="width:18px;height:18px;border-radius:5px;background:${c};display:inline-block;border:1px solid rgba(0,0,0,.12)"></span>`).join('')}</div>
              <div class="opt-t" style="font-size:13px">${A.esc(p.name)}</div></button>`).join('')}
          </div>

          <hr class="divider">
          <label class="label">5 · Materiales a visualizar</label>
          <div class="chips" style="flex-wrap:wrap;overflow:visible">
            ${api.MATERIALS.map((m) => `<button class="chip ${R.materials.indexOf(m.id) !== -1 ? 'sel' : ''}" data-mat="${m.id}">${A.esc(m.name)}</button>`).join('')}
          </div>

          <hr class="divider">
          <label class="label">6 · Describe lo que quieres</label>
          <textarea class="textarea" id="r-desc" placeholder="Ej.: isla central con encimera clara, muebles hasta el techo, suelo de madera y mucha luz natural">${A.esc(R.desc)}</textarea>

          <button class="btn btn-accent btn-block btn-lg" id="r-go" style="margin-top:14px" ${R.busy ? 'disabled' : ''}>
            ${A.icon('sparkles', 19)} Generar 4 variaciones</button>
          <p class="small muted center" style="margin-top:8px">
            ${A.hasKey('integrations.aiRender.apiKey') ? 'Conectado al modelo de imagen configurado.'
              : 'Previsualización procedural integrada. Añade tu clave en config.js para renders fotorrealistas.'}</p>
        </div>

        <div id="r-out">${output()}</div>
      </div>
      <div style="height:24px"></div>
    </div>`;
  }, { title:'Render IA' });

  function output() {
    if (R.busy) {
      return `<div class="card card-p center" style="padding:40px 20px">
        <span class="spinner" style="width:34px;height:34px;color:var(--primary);margin:0 auto"></span>
        <div style="font-weight:700;margin-top:14px">Generando tu render…</div>
        <p class="small muted" style="margin-top:5px" id="r-prog">Preparando la escena</p>
        <div class="meter" style="margin-top:14px"><i id="r-bar" style="width:8%"></i></div></div>`;
    }
    if (!R.results) {
      return `<div class="card card-p center" style="padding:40px 20px">
        <div class="muted">${A.icon('sparkles', 40)}</div>
        <div style="font-weight:700;margin-top:10px">Tu render aparecerá aquí</div>
        <p class="small muted" style="margin-top:6px">Sube una foto, elige estilo y colores, y genera hasta cuatro variaciones en segundos.</p>
      </div>`;
    }
    const imgs = R.results.images;
    const sel = imgs[R.sel];
    return `<div class="card card-p">
      <div class="thumb" style="aspect-ratio:4/3;margin-bottom:10px">
        <img id="r-main" src="${sel}" alt="Render" style="width:100%;height:100%;object-fit:cover;transform:rotate(0deg)">
      </div>
      <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:7px">
        ${imgs.map((im, i) => `<button class="thumb" data-sel="${i}" style="aspect-ratio:1;border:2px solid ${i === R.sel ? 'var(--primary)' : 'transparent'};padding:0">
          <img src="${im}" alt="Variación ${i + 1}" style="width:100%;height:100%;object-fit:cover"></button>`).join('')}
      </div>

      <div class="row wrap" style="gap:8px;margin-top:12px">
        <button class="btn btn-sm" id="r-360">${A.icon('refresh', 15)} Vista 360°</button>
        <button class="btn btn-ghost btn-sm" id="r-dl">${A.icon('download', 15)} Descargar</button>
        <button class="btn btn-ghost btn-sm" id="r-share">${A.icon('share', 15)} Compartir</button>
        <button class="btn btn-soft btn-sm" id="r-save">${A.icon('check', 15)} Guardar</button>
      </div>

      ${R.photo ? `<hr class="divider"><label class="label">Antes y después</label>
        ${A.ui.beforeAfter('ba-render', R.photo, sel)}` : ''}

      <hr class="divider">
      <button class="btn btn-accent btn-block" id="r-quote">${A.icon('calc', 18)} Presupuestar esta reforma</button>

      <details style="margin-top:12px">
        <summary class="small muted" style="cursor:pointer">Ver instrucción enviada al modelo</summary>
        <p class="small mono" style="margin-top:8px;color:var(--text-3);word-break:break-word">${A.esc(R.results.prompt)}</p>
      </details>
    </div>`;
  }

  function bind() {
    const file = A.$('#r-file'), drop = A.$('#r-drop');
    if (drop) drop.addEventListener('click', () => file.click());
    if (file) file.addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 8 * 1024 * 1024) { A.toast('La imagen supera los 8 MB', 'err'); return; }
      const fr = new FileReader();
      fr.onload = () => { R.photo = fr.result; A.render(); };
      fr.readAsDataURL(f);
    });
    const cl = A.$('#r-clear'); if (cl) cl.addEventListener('click', () => { R.photo = null; A.render(); });

    A.$$('[data-room]').forEach((b) => b.addEventListener('click', () => {
      R.room = b.dataset.room; A.$$('[data-room]').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    A.$$('[data-style]').forEach((b) => b.addEventListener('click', () => {
      R.style = b.dataset.style; A.$$('[data-style]').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    A.$$('[data-pal]').forEach((b) => b.addEventListener('click', () => {
      R.palette = b.dataset.pal; A.$$('[data-pal]').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    A.$$('[data-mat]').forEach((b) => b.addEventListener('click', () => {
      const i = R.materials.indexOf(b.dataset.mat);
      if (i === -1) R.materials.push(b.dataset.mat); else R.materials.splice(i, 1);
      b.classList.toggle('sel');
    }));
    const d = A.$('#r-desc'); if (d) d.addEventListener('input', (e) => { R.desc = e.target.value; });

    const go = A.$('#r-go');
    if (go) go.addEventListener('click', async () => {
      R.busy = true; R.results = null; A.$('#r-out').innerHTML = output();
      const steps = ['Analizando la fotografía', 'Aplicando estilo y paleta', 'Colocando materiales', 'Ajustando iluminación'];
      try {
        const res = await A.api.render.generate({
          room:R.room, style:R.style, palette:R.palette, materials:R.materials, desc:R.desc, photo:R.photo,
          onProgress:(p, imgs) => {
            const bar = A.$('#r-bar'), pr = A.$('#r-prog');
            if (bar) bar.style.width = Math.round(p * 100) + '%';
            if (pr) pr.textContent = steps[Math.min(steps.length - 1, Math.floor(p * steps.length))];
          }
        }, 4);
        R.results = res; R.sel = 0;
      } catch (e) { A.toast(e.message, 'err'); }
      R.busy = false;
      A.$('#r-out').innerHTML = output();
      bindOut();
    });
    bindOut();
  }

  function bindOut() {
    A.$$('[data-sel]').forEach((b) => b.addEventListener('click', () => {
      R.sel = Number(b.dataset.sel); A.$('#r-out').innerHTML = output(); bindOut();
    }));
    const r360 = A.$('#r-360');
    if (r360) r360.addEventListener('click', () => {
      const img = A.$('#r-main');
      let a = 0; const t = setInterval(() => {
        a += 6; img.style.transition = 'transform .05s linear';
        img.style.transform = `perspective(900px) rotateY(${Math.sin(a / 180 * Math.PI) * 22}deg) scale(1.04)`;
        if (a >= 360) { clearInterval(t); img.style.transform = 'none'; }
      }, 22);
      A.toast('Simulación de vista 360°');
    });
    const dl = A.$('#r-dl');
    if (dl) dl.addEventListener('click', async () => {
      /* Se rasteriza a PNG para que la descarga funcione en cualquier visor */
      try {
        const src = R.results.images[R.sel];
        const img = new Image(); img.decoding = 'sync';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
        const c = document.createElement('canvas'); c.width = 1600; c.height = 1200;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
        const ok = await A.download(`render-${R.room}-${R.style}-${R.sel + 1}.png`, blob);
        if (ok) A.toast('Render descargado', 'ok');
      } catch (e) { A.toast('No se ha podido preparar la imagen', 'err'); }
    });
    const sh = A.$('#r-share');
    if (sh) sh.addEventListener('click', async () => {
      if (navigator.share) { try { await navigator.share({ title:'Mi render NOVA', text:`Render ${R.style} de mi ${R.room}` }); } catch (e) {} }
      else A.toast('Copia el enlace desde el navegador para compartir');
    });
    const sv = A.$('#r-save');
    if (sv) sv.addEventListener('click', async () => {
      await A.db.insert('renders', { user_id:A.state.user ? A.state.user.id : 'anon',
        room:R.room, style:R.style, palette:R.palette, materials:R.materials, desc:R.desc,
        image:R.results.images[R.sel], prompt:R.results.prompt });
      await A.notify('Render guardado', `${R.room} en estilo ${R.style}`, 'sparkles', '#/renders');
      A.toast('Render guardado', 'ok'); A.refreshBadge();
    });
    const qb = A.$('#r-quote');
    if (qb) qb.addEventListener('click', () => {
      const map = { Cocina:'ref-cocina', 'Baño':'ref-bano', Salón:'ref-suelos', Dormitorio:'ref-pintura',
        Terraza:'add-impermeabilizacion', Fachada:'add-aislamiento', Oficina:'ref-suelos', 'Local comercial':'con-tabiqueria' };
      A.go('/presupuesto/' + (map[R.room] || 'ref-cocina'));
    });
  }

  /* ---------------- Renders guardados ---------------- */
  A.route('/renders', async () => {
    const rows = await A.db.list('renders', A.state.user ? { user_id:A.state.user.id } : null);
    if (!rows.length) return `<div class="container"><div class="empty" style="padding-top:60px">${A.icon('sparkles', 44)}
      <h3>Aún no has guardado renders</h3><a class="btn" style="margin-top:16px" href="#/render">Crear render</a></div></div>`;
    return `<div class="container" style="padding-top:18px">
      <div class="sec-head" style="margin-top:0"><div class="sec-title">Mis renders</div>
        <a class="btn btn-sm" href="#/render">${A.icon('plus', 16)} Nuevo</a></div>
      <div class="grid g3">${rows.map((r) => `<div class="card" style="overflow:hidden">
        <div class="thumb"><img src="${r.image}" alt=""></div>
        <div class="card-p" style="padding:12px">
          <div style="font-weight:700;font-size:14px">${A.esc(r.room)} · ${A.esc(r.style)}</div>
          <div class="small muted">${A.dateFmt(r.created_at)}</div>
        </div></div>`).join('')}</div><div style="height:20px"></div></div>`;
  }, { title:'Mis renders' });
})(window.App);

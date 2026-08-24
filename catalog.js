/* ============================================================
   views/catalog.js — Catálogo de obras, detalle y antes/después
   ============================================================ */
(function (A) {
  'use strict';

  /* Slider comparativo antes/después */
  A.ui.beforeAfter = function (id, beforeSrc, afterSrc, labels) {
    A.onMount(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const move = (clientX) => {
        const r = el.getBoundingClientRect();
        const pct = A.clamp(((clientX - r.left) / r.width) * 100, 0, 100);
        el.style.setProperty('--pos', pct + '%');
      };
      /* Un único juego de escuchas globales por instancia montada */
      if (window.__baCleanup) window.__baCleanup();
      let dragging = false;
      const start = (e) => {
        dragging = true;
        if (e.preventDefault && !e.touches) e.preventDefault();   // evita el arrastre nativo de la imagen
        move(e.touches ? e.touches[0].clientX : e.clientX);
      };
      const mv = (e) => { if (dragging) { move(e.touches ? e.touches[0].clientX : e.clientX); e.preventDefault(); } };
      const end = () => { dragging = false; };
      el.addEventListener('dragstart', (e) => e.preventDefault());
      el.addEventListener('mousedown', start); el.addEventListener('touchstart', start, { passive:true });
      window.addEventListener('mousemove', mv); window.addEventListener('touchmove', mv, { passive:false });
      window.addEventListener('mouseup', end); window.addEventListener('touchend', end);
      el.addEventListener('click', (e) => move(e.clientX));
      window.__baCleanup = () => {
        window.removeEventListener('mousemove', mv); window.removeEventListener('touchmove', mv);
        window.removeEventListener('mouseup', end); window.removeEventListener('touchend', end);
        window.__baCleanup = null;
      };
    });
    return `<div class="ba" id="${id}" style="--pos:50%">
      <div class="before"><img src="${beforeSrc}" alt="Antes" draggable="false" style="width:100%;height:100%;object-fit:cover"></div>
      <div class="after"><img src="${afterSrc}" alt="Después" draggable="false" style="width:100%;height:100%;object-fit:cover"></div>
      <div class="handle"></div>
      <span class="tag" style="left:10px">${A.esc((labels && labels[0]) || 'ANTES')}</span>
      <span class="tag" style="right:10px">${A.esc((labels && labels[1]) || 'DESPUÉS')}</span>
    </div>`;
  };

  A.route('/catalogo', async (p, q) => {
    const tag = q.tag || '';
    const cat = q.cat || '';
    let list = A.data.PROJECTS.slice();
    if (tag) list = list.filter((x) => x.tags.indexOf(tag) !== -1);
    if (cat) list = list.filter((x) => x.cat === cat);

    return `<div class="container" style="padding-top:18px">
      <div class="sec-head" style="margin-top:0">
        <div><div class="sec-title">${A.esc(A.t('catalog.title'))}</div>
          <div class="sec-sub">${A.data.PROJECTS.length ? list.length + ' proyectos' : 'Aún no hay obras publicadas'}</div></div>
      </div>

      <div class="chips" style="margin-bottom:8px">
        <a class="chip ${!tag && !cat ? 'sel' : ''}" href="#/catalogo">${A.t('common.all')}</a>
        ${A.data.TAGS.map((t) => `<a class="chip ${tag === t.id ? 'sel' : ''}" href="#/catalogo?tag=${t.id}">${A.esc(t.name)}</a>`).join('')}
      </div>
      <div class="chips" style="margin-bottom:16px">
        ${A.data.CATEGORIES.map((c) => `<a class="chip ${cat === c.id ? 'sel' : ''}" href="#/catalogo?cat=${c.id}">${A.esc(c.name)}</a>`).join('')}
      </div>

      ${list.length ? `<div class="grid g3">${list.map(A.ui.projectCard).join('')}</div>`
        : (A.data.PROJECTS.length
          ? `<div class="empty">${A.icon('image', 40)}<h3>Sin proyectos con ese filtro</h3></div>`
          : `<div class="empty" style="padding:44px 20px">${A.icon('camera', 42)}
              <h3>El catálogo está listo, falta llenarlo</h3>
              <p class="small" style="max-width:44ch;margin:0 auto">Añade tus obras terminadas con una foto del antes y otra del después.
              Es lo que más convence a un cliente que duda.</p>
              <div class="row wrap" style="justify-content:center;gap:9px;margin-top:16px">
                <a class="btn" href="#/presupuesto">${A.icon('calc', 17)} Calcular un presupuesto</a>
                <a class="btn btn-ghost" href="#/empresa">${A.icon('building', 17)} Conocer Vivas CR</a>
              </div></div>`)}

      ${A.data.VIDEOS.length ? `<div class="sec-head"><div><div class="sec-title">Vídeos de obra</div>
        <div class="sec-sub">Procesos completos grabados en obra</div></div></div>
      <div class="grid g3">
        ${A.data.VIDEOS.map((v) => {
          const pr = A.data.project(v.project);
          return `<a class="card card-hover" href="#/proyecto/${v.project}" style="overflow:hidden">
            <div class="thumb"><img src="${A.artwork(v.id, v.title, 'vídeo')}" alt="">
              <div class="ph" style="background:rgba(6,21,41,.35)">
                <span style="color:#fff">${A.icon('play', 44)}</span></div>
              <span class="tag" style="position:absolute;bottom:8px;right:8px;background:rgba(6,21,41,.8);color:#fff;padding:3px 8px;border-radius:99px;font-size:11px">${v.dur}</span>
            </div>
            <div class="card-p" style="padding:12px">
              <div style="font-weight:700;font-size:14px">${A.esc(v.title)}</div>
              <div class="small muted">${A.esc(pr ? pr.city : '')}</div>
            </div></a>`;
        }).join('')}
      </div>` : ''}

      ${A.data.REVIEWS.length ? `<div class="sec-head"><div><div class="sec-title">Testimonios verificados</div>
        <div class="sec-sub">Solo de clientes con obra entregada</div></div></div>
      <div class="grid g3">
        ${A.data.REVIEWS.map((r) => `<div class="card card-p">
          <div class="row" style="gap:10px">${A.avatar(r.name, 38)}
            <div><div style="font-weight:700;font-size:14px">${A.esc(r.name)}</div>
              <div class="small muted">${A.esc(r.city)} · ${A.esc(r.service)}</div></div>
            <span class="badge badge-green" style="margin-left:auto">${A.icon('check', 12)} Verificado</span></div>
          <div style="margin:9px 0 6px">${A.stars(r.rating)}</div>
          <p class="small">${A.esc(r.text)}</p></div>`).join('')}
      </div>` : ''}
      <div style="height:20px"></div>
    </div>`;
  }, { title:'Catálogo' });

  A.route('/proyecto/:id', async (p) => {
    const pr = A.data.project(p.id);
    if (!pr) return `<div class="container"><div class="empty">${A.icon('alert', 40)}<h3>Proyecto no encontrado</h3></div></div>`;
    const cat = A.data.category(pr.cat);
    const rel = A.data.PROJECTS.filter((x) => x.id !== pr.id && x.cat === pr.cat).slice(0, 3);
    const ba = A.ui.beforeAfter('ba-' + pr.id,
      pr.beforeImg || A.artwork(pr.id + 'before', pr.before, 'antes'),
      pr.afterImg  || A.artwork(pr.id + 'after', pr.after, 'después'));

    return `<div class="container" style="padding-top:16px;max-width:900px">
      <a class="link" href="#/catalogo">${A.icon('back', 15)} Catálogo</a>
      <div class="row wrap" style="gap:7px;margin:12px 0 8px">
        <span class="badge badge-navy">${A.esc(cat.name)}</span>
        ${pr.tags.map((t) => `<span class="badge badge-grey">${A.esc(((A.data.TAGS.find((x) => x.id === t)) || {}).name || t)}</span>`).join('')}
      </div>
      <h1 style="font-size:24px;letter-spacing:-.03em">${A.esc(pr.title)}</h1>
      <p class="muted" style="margin-top:6px">${A.esc(pr.desc)}</p>

      <div style="margin:16px 0">${ba}</div>
      <p class="small muted center">Arrastra el control para comparar el antes y el después</p>

      <div class="grid g4" style="margin-top:16px">
        ${[['pin', pr.city, 'Ubicación'], ['ruler', A.num(pr.area) + ' m²', 'Superficie'],
           ['clock', pr.duration + ' días', 'Duración'], ['euro', A.eur(pr.budget), 'Inversión']]
          .map(([ic, val, lbl]) => `<div class="card card-p center" style="padding:14px 10px">
            <div style="color:var(--primary);display:grid;place-items:center;margin-bottom:5px">${A.icon(ic, 20)}</div>
            <div style="font-weight:800;font-size:15px">${A.esc(val)}</div>
            <div class="small muted">${lbl}</div></div>`).join('')}
      </div>

      <div class="card card-p" style="margin-top:14px">
        <strong style="font-size:15px">Trabajos ejecutados</strong>
        <div class="stack" style="gap:8px;margin-top:10px">
          ${pr.details.map((d) => `<div class="row" style="gap:9px;align-items:flex-start">
            <span style="color:var(--green);flex:none">${A.icon('check', 16)}</span>
            <span class="small">${A.esc(d)}</span></div>`).join('')}
        </div>
      </div>

      <div class="card card-p" style="margin-top:12px">
        <div class="row" style="gap:11px">${A.avatar(pr.client, 42)}
          <div style="flex:1"><div style="font-weight:700">${A.esc(pr.client)}</div>
            <div>${A.stars(pr.rating)}</div></div></div>
        <p style="margin-top:10px;font-style:italic">«${A.esc(pr.quote)}»</p>
      </div>

      <div class="row wrap" style="gap:9px;margin-top:14px">
        <a class="btn" href="#/presupuesto">${A.icon('calc', 18)} Quiero algo parecido</a>
        <a class="btn btn-ghost" href="#/render">${A.icon('sparkles', 18)} Ver mi espacio así</a>
      </div>

      ${rel.length ? `<div class="sec-head"><div class="sec-title">Proyectos parecidos</div></div>
        <div class="grid g3">${rel.map(A.ui.projectCard).join('')}</div>` : ''}
      <div style="height:24px"></div>
    </div>`;
  }, { title:'Proyecto' });
})(window.App);

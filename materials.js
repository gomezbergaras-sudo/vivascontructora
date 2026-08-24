/* ============================================================
   views/materials.js — Comparador de materiales
   ============================================================ */
(function (A) {
  'use strict';

  const F = { q:'', cat:'', sort:'relevancia', min:null, max:null, onlyStock:false, onlyPromo:false, store:'' };

  A.route('/materiales', async (p, qs) => {
    if (qs.q) F.q = qs.q;
    A.onMount(() => { bind(); doSearch(); });

    return `<div class="container" style="padding-top:16px">
      <div class="sec-head" style="margin-top:0">
        <div><div class="sec-title">${A.esc(A.t('materials.title'))}</div>
          <div class="sec-sub">${A.data.PRODUCTS.length} referencias en ${A.data.STORES.length} tiendas</div></div>
        <a class="btn btn-soft btn-sm" href="#/cesta">${A.icon('cart', 16)} Cesta
          <span class="badge badge-navy" id="cart-count">${A.state.cart.length}</span></a>
      </div>

      <div class="card card-p" style="margin-bottom:14px">
        <div class="input-group">
          <input class="input" id="m-q" value="${A.esc(F.q)}" placeholder="Buscar por producto, marca o referencia…">
          <button class="btn" id="m-go" style="width:52px;padding:0">${A.icon('search', 19)}</button>
        </div>
        ${A.state.searches.length ? `<div class="row wrap" style="gap:6px;margin-top:10px">
          <span class="small muted">Recientes:</span>
          ${A.state.searches.slice(0, 6).map((s) => `<button class="chip" data-hist="${A.esc(s)}" style="padding:4px 10px;font-size:12px">${A.esc(s)}</button>`).join('')}
          <button class="link small" id="m-clearhist">Borrar</button></div>` : ''}

        <div class="chips" style="margin-top:12px">
          <button class="chip ${!F.cat ? 'sel' : ''}" data-cat="">${A.t('common.all')}</button>
          ${A.data.MCATS.map((c) => `<button class="chip ${F.cat === c.id ? 'sel' : ''}" data-cat="${c.id}">${A.esc(c.name)}</button>`).join('')}
        </div>

        <div class="row wrap" style="gap:8px;margin-top:12px">
          <select class="select" id="m-sort" style="width:auto;flex:1;min-width:150px">
            <option value="relevancia">Relevancia</option>
            <option value="precio_asc">Precio: menor primero</option>
            <option value="precio_desc">Precio: mayor primero</option>
            <option value="ahorro">Mayor ahorro entre tiendas</option>
            <option value="marca">Marca (A-Z)</option>
          </select>
          <select class="select" id="m-store" style="width:auto;flex:1;min-width:150px">
            <option value="">Todas las tiendas</option>
            ${A.data.STORES.map((s) => `<option value="${s.id}">${A.esc(s.name)}</option>`).join('')}
          </select>
          <input class="input mono" id="m-min" type="number" placeholder="€ mín." style="width:110px">
          <input class="input mono" id="m-max" type="number" placeholder="€ máx." style="width:110px">
        </div>
        <div class="row wrap" style="gap:14px;margin-top:12px">
          <label class="row small" style="gap:7px;cursor:pointer">
            <input type="checkbox" id="m-stock"> Solo con stock</label>
          <label class="row small" style="gap:7px;cursor:pointer">
            <input type="checkbox" id="m-promo"> Solo ofertas</label>
        </div>
      </div>

      <div id="m-results"><div class="grid g3">
        ${[1,2,3,4,5,6].map(() => '<div class="card card-p"><div class="skel" style="height:120px;margin-bottom:10px"></div><div class="skel" style="height:14px;width:70%"></div></div>').join('')}
      </div></div>
      <div style="height:20px"></div>
    </div>`;
  }, { title:'Materiales' });

  function bind() {
    const q = A.$('#m-q');
    A.$('#m-go').addEventListener('click', () => { F.q = q.value; A.search.add(F.q); doSearch(); });
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { F.q = q.value; A.search.add(F.q); doSearch(); } });
    let tmr; q.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { F.q = q.value; doSearch(); }, 380); });
    A.$$('[data-cat]').forEach((b) => b.addEventListener('click', () => {
      F.cat = b.dataset.cat; A.$$('[data-cat]').forEach((x) => x.classList.toggle('sel', x === b)); doSearch();
    }));
    A.$$('[data-hist]').forEach((b) => b.addEventListener('click', () => { F.q = b.dataset.hist; q.value = F.q; doSearch(); }));
    const ch = A.$('#m-clearhist'); if (ch) ch.addEventListener('click', () => { A.search.clear(); A.render(); });
    A.$('#m-sort').addEventListener('change', (e) => { F.sort = e.target.value; doSearch(); });
    A.$('#m-store').addEventListener('change', (e) => { F.store = e.target.value; doSearch(); });
    A.$('#m-min').addEventListener('input', (e) => { F.min = e.target.value ? Number(e.target.value) : null; doSearch(); });
    A.$('#m-max').addEventListener('input', (e) => { F.max = e.target.value ? Number(e.target.value) : null; doSearch(); });
    A.$('#m-stock').addEventListener('change', (e) => { F.onlyStock = e.target.checked; doSearch(); });
    A.$('#m-promo').addEventListener('change', (e) => { F.onlyPromo = e.target.checked; doSearch(); });
    A.$('#m-sort').value = F.sort;
  }

  async function doSearch() {
    const box = A.$('#m-results');
    if (!box) return;
    box.innerHTML = `<div class="row center" style="justify-content:center;padding:34px;color:var(--text-3)">
      <span class="spinner"></span><span class="small" style="margin-left:10px">Consultando precios en 5 tiendas…</span></div>`;
    const rows = await A.api.materials.search(F);
    if (!rows.length) {
      box.innerHTML = `<div class="empty">${A.icon('search', 40)}<h3>Sin resultados</h3>
        <p class="small">Prueba con otra búsqueda o quita algún filtro.</p></div>`;
      return;
    }
    box.innerHTML = `<div class="small muted" style="margin-bottom:10px">${rows.length} productos ·
      precios actualizados ${A.dateFmt(new Date().toISOString(), true)}</div>
      <div class="grid g3">${rows.map(card).join('')}</div>`;
    A.$$('[data-add]').forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const p = rows.find((x) => x.id === b.dataset.add);
      A.cart.add({ id:p.id, name:p.name, price:p.best.price, store:p.best.storeName, unit:p.unit });
      const c = A.$('#cart-count'); if (c) c.textContent = A.state.cart.length;
      A.toast(`${p.brand} añadido a la cesta`, 'ok');
    }));
  }

  function card(p) {
    return `<a class="card card-hover" href="#/material/${p.id}" style="overflow:hidden;display:block">
      <div class="thumb" style="aspect-ratio:16/10"><img src="${p.img}" alt="">
        ${p.hasPromo ? '<span class="badge badge-red" style="position:absolute;top:8px;left:8px">Oferta</span>' : ''}
      </div>
      <div class="card-p" style="padding:13px">
        <div class="between" style="margin-bottom:3px">
          <span class="small muted">${A.esc(p.brand)}</span>
          <span class="mono small muted">${A.esc(p.ref)}</span>
        </div>
        <div style="font-weight:600;font-size:13.5px;line-height:1.35;min-height:36px">${A.esc(p.name)}</div>
        <div class="row" style="gap:6px;margin-top:9px">
          <span class="store-logo" style="background:${p.best.color}">${A.esc(p.best.short)}</span>
          <div style="flex:1;min-width:0">
            <div class="pricebar">
              <span class="price">${A.eur(p.best.price, 2)}</span>
              ${p.best.discount ? `<span class="price-old">${A.eur(p.best.listPrice, 2)}</span>` : ''}
            </div>
            <div class="small muted">${A.esc(p.best.storeName)} · ${A.esc(p.best.stock)}</div>
          </div>
        </div>
        <div class="between" style="margin-top:10px;gap:8px">
          <span class="badge ${p.spreadPct > 15 ? 'badge-green' : 'badge-grey'}">
            Ahorro ${A.eur(p.spread, 2)}</span>
          <button class="btn btn-soft btn-sm" data-add="${p.id}">${A.icon('plus', 15)} Añadir</button>
        </div>
      </div></a>`;
  }

  /* ---------------- Detalle de producto ---------------- */
  A.route('/material/:id', async (p) => {
    const prod = await A.api.materials.byId(p.id);
    if (!prod) return `<div class="container"><div class="empty">${A.icon('alert', 40)}<h3>Producto no encontrado</h3></div></div>`;
    A.onMount(() => {
      A.$$('[data-buy]').forEach((b) => b.addEventListener('click', () => {
        const o = prod.offers.find((x) => x.store === b.dataset.buy);
        A.cart.add({ id:prod.id, name:prod.name, price:o.price, store:o.storeName, unit:prod.unit });
        A.toast('Añadido a la cesta del presupuesto', 'ok');
      }));
      const al = A.$('#m-alert');
      if (al) al.addEventListener('click', async () => {
        await A.notify('Alerta de precio activada', `Te avisamos si ${prod.brand} baja de ${A.eur(prod.best.price, 2)}.`, 'tag', '#/material/' + prod.id);
        A.toast('Alerta creada', 'ok'); A.refreshBadge();
      });
    });
    const max = Math.max(...prod.offers.map((o) => o.price));
    return `<div class="container" style="padding-top:16px;max-width:820px">
      <a class="link" href="#/materiales">${A.icon('back', 15)} Comparador</a>
      <div class="grid g2" style="gap:16px;margin-top:12px">
        <div class="thumb" style="aspect-ratio:4/3"><img src="${prod.img}" alt=""></div>
        <div>
          <div class="small muted">${A.esc(prod.brand)} · ${A.esc(prod.ref)}</div>
          <h1 style="font-size:20px;margin-top:4px;letter-spacing:-.02em">${A.esc(prod.name)}</h1>
          <div class="row" style="gap:8px;margin-top:12px">
            <span class="price" style="font-size:27px">${A.eur(prod.best.price, 2)}</span>
            <span class="small muted">/ ${A.esc(prod.unit)}</span>
          </div>
          <div class="small muted">Mejor precio en ${A.esc(prod.best.storeName)}</div>
          <div class="row wrap" style="gap:8px;margin-top:14px">
            <button class="btn" data-buy="${prod.best.store}">${A.icon('cart', 18)} Añadir al presupuesto</button>
            <button class="btn btn-ghost" id="m-alert">${A.icon('bell', 17)} Avisarme si baja</button>
          </div>
        </div>
      </div>

      <div class="card card-p" style="margin-top:16px">
        <div class="between" style="margin-bottom:12px">
          <strong style="font-size:15px">Comparativa de precios</strong>
          <span class="badge badge-green">Ahorras ${A.eur(prod.spread, 2)} (${A.num(prod.spreadPct, 0)} %)</span>
        </div>
        ${prod.offers.map((o, i) => `<div style="padding:11px 0;border-bottom:1px solid var(--border)">
          <div class="between" style="gap:10px">
            <div class="row" style="gap:9px;min-width:0">
              <span class="store-logo" style="background:${o.color}">${A.esc(o.short)}</span>
              <div style="min-width:0">
                <div style="font-weight:700;font-size:14px">${A.esc(o.storeName)}
                  ${i === 0 ? '<span class="badge badge-green" style="margin-left:5px">Mejor precio</span>' : ''}</div>
                <div class="small muted">${A.esc(o.delivery)}</div>
              </div>
            </div>
            <div style="text-align:right;flex:none">
              <div class="pricebar" style="justify-content:flex-end">
                <span style="font-weight:800;font-size:16px">${A.eur(o.price, 2)}</span>
                ${o.discount ? `<span class="price-old">${A.eur(o.listPrice, 2)}</span>` : ''}
              </div>
              <div class="small ${o.stock === 'sin stock' ? '' : 'muted'}"
                style="${o.stock === 'sin stock' ? 'color:var(--red)' : ''}">
                ${A.esc(o.stock)}${o.units ? ` · ${o.units} ud.` : ''}</div>
            </div>
          </div>
          <div class="meter" style="margin-top:8px"><i style="width:${(o.price / max * 100).toFixed(1)}%;
            background:${i === 0 ? 'var(--green)' : 'var(--steel-400)'}"></i></div>
          <div class="between" style="margin-top:8px">
            <span class="small muted">${A.stars(o.rating, 12)} ${A.num(o.rating, 1)}</span>
            <button class="btn btn-ghost btn-sm" data-buy="${o.store}">Añadir desde aquí</button>
          </div>
        </div>`).join('')}
      </div>
      <p class="small muted center" style="margin:14px 0 24px">
        ${A.hasKey('integrations.materialsApi.apiKey') ? 'Precios en tiempo real del proveedor conectado.'
          : 'Precios de referencia del simulador integrado. Conecta tu proveedor de precios en config.js para datos en vivo.'}</p>
    </div>`;
  }, { title:'Material' });

  /* ---------------- Cesta ---------------- */
  A.route('/cesta', async () => {
    A.onMount(() => {
      A.$$('[data-rm]').forEach((b) => b.addEventListener('click', () => { A.cart.remove(Number(b.dataset.rm)); A.render(); }));
      A.$$('[data-q]').forEach((i) => i.addEventListener('change', (e) => { A.cart.qty(Number(i.dataset.q), Number(e.target.value)); A.render(); }));
      const cl = A.$('#c-clear'); if (cl) cl.addEventListener('click', () => { A.cart.clear(); A.render(); });
      const go = A.$('#c-quote'); if (go) go.addEventListener('click', () => {
        const d = A.state.draft || {};
        d.materials = A.state.cart.slice(); A.draft.save(d); A.go('/presupuesto');
      });
    });
    const c = A.state.cart;
    if (!c.length) return `<div class="container"><div class="empty" style="padding-top:60px">${A.icon('cart', 44)}
      <h3>Tu cesta está vacía</h3><p class="small">Añade materiales desde el comparador.</p>
      <a class="btn" style="margin-top:16px" href="#/materiales">Ir al comparador</a></div></div>`;
    return `<div class="container" style="padding-top:18px;max-width:720px">
      <div class="between" style="margin-bottom:14px">
        <div class="sec-title">Cesta de materiales</div>
        <button class="link" id="c-clear">Vaciar</button>
      </div>
      <div class="stack">
        ${c.map((x, i) => `<div class="card card-p">
          <div class="between" style="gap:10px">
            <div style="min-width:0"><div style="font-weight:600;font-size:14px">${A.esc(x.name)}</div>
              <div class="small muted">${A.esc(x.store)} · ${A.eur(x.price, 2)} / ${A.esc(x.unit)}</div></div>
            <div class="row" style="gap:8px;flex:none">
              <input class="input mono" data-q="${i}" type="number" min="1" value="${x.qty}" style="width:70px;height:38px;text-align:center">
              <button class="iconbtn" data-rm="${i}" style="color:var(--red)">${A.icon('trash', 18)}</button>
            </div>
          </div></div>`).join('')}
      </div>
      <div class="card card-p" style="margin-top:12px">
        <div class="line"><span>Total materiales (IVA incl.)</span><span style="font-size:17px">${A.eur(A.cart.total(), 2)}</span></div>
        <button class="btn btn-block" id="c-quote" style="margin-top:12px">${A.icon('calc', 18)} Incluir en un presupuesto</button>
      </div>
      <div style="height:24px"></div>
    </div>`;
  }, { title:'Cesta' });
})(window.App);

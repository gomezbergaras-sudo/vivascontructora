/* ============================================================
   api/materials-api.js — Búsqueda y comparación de materiales
   Si config.integrations.materialsApi tiene endpoint + apiKey, la
   función search() llama al servicio real. Sin claves, resuelve con
   el simulador local sobre el catálogo de data/materials.js.
   ============================================================ */
(function (A) {
  'use strict';

  /* Diferencial de precio por tienda (margen, promociones y logística) */
  const STORE_BIAS = { leroy:1.00, brico:0.88, bauhaus:1.04, amazon:0.96, ferre:1.09 };

  /** Genera la oferta de cada tienda para un producto, de forma estable. */
  function offersFor(p) {
    return A.data.STORES.map((st) => {
      const seed = p.id + st.id;
      const jitter = 0.92 + (A.hash(seed) % 17) / 100;          // ±8 %
      const price = Math.round(p.base * STORE_BIAS[st.id] * jitter * 100) / 100;
      const promo = (A.hash(seed + 'promo') % 100) < 22;          // ~22 % con oferta
      const discount = promo ? 5 + (A.hash(seed + 'd') % 21) : 0; // 5-25 %
      const final = Math.round(price * (1 - discount / 100) * 100) / 100;
      const stockN = A.hash(seed + 's') % 100;
      return {
        store: st.id, storeName: st.name, color: st.color, short: st.short,
        price: final, listPrice: price, discount,
        stock: stockN > 12 ? (stockN > 45 ? 'disponible' : 'pocas unidades') : 'sin stock',
        units: stockN > 12 ? 3 + (stockN % 90) : 0,
        delivery: st.ship,
        url: '#/materiales/' + p.id,
        rating: 3.6 + (A.hash(seed + 'r') % 14) / 10
      };
    }).sort((a, b) => a.price - b.price);
  }

  /** Enriquece un producto con sus ofertas y métricas. */
  function enrich(p) {
    const offers = offersFor(p);
    const inStock = offers.filter((o) => o.stock !== 'sin stock');
    const best = inStock[0] || offers[0];
    const worst = offers[offers.length - 1];
    return Object.assign({}, p, {
      offers, best, worst,
      spread: worst.price - best.price,
      spreadPct: worst.price ? ((worst.price - best.price) / worst.price) * 100 : 0,
      hasPromo: offers.some((o) => o.discount > 0),
      img: A.artwork(p.id, p.brand, p.unit)
    });
  }

  /** Búsqueda con filtros. */
  async function search(opts) {
    opts = opts || {};
    if (A.hasKey('integrations.materialsApi.apiKey') && A.hasKey('integrations.materialsApi.endpoint')) {
      /* --- Ruta real: sustituye por tu proveedor de precios --- */
      const url = new URL(A.config.integrations.materialsApi.endpoint);
      url.searchParams.set('q', opts.q || '');
      url.searchParams.set('cat', opts.cat || '');
      const res = await fetch(url, { headers:{ Authorization:'Bearer ' + A.config.integrations.materialsApi.apiKey } });
      if (!res.ok) throw new Error('Servicio de precios no disponible');
      return (await res.json()).items.map(enrich);
    }

    /* --- Simulador local --- */
    await A.sleep(260 + Math.random() * 320);   // latencia realista
    const q = (opts.q || '').toLowerCase().trim();
    let rows = A.data.PRODUCTS.filter((p) => {
      if (opts.cat && p.cat !== opts.cat) return false;
      if (!q) return true;
      return (p.name + ' ' + p.brand + ' ' + p.ref).toLowerCase().indexOf(q) !== -1;
    }).map(enrich);

    if (opts.min != null) rows = rows.filter((r) => r.best.price >= opts.min);
    if (opts.max != null) rows = rows.filter((r) => r.best.price <= opts.max);
    if (opts.onlyStock) rows = rows.filter((r) => r.best.stock !== 'sin stock');
    if (opts.onlyPromo) rows = rows.filter((r) => r.hasPromo);
    if (opts.store) rows = rows.filter((r) => r.offers.some((o) => o.store === opts.store && o.stock !== 'sin stock'));

    const sort = opts.sort || 'relevancia';
    if (sort === 'precio_asc') rows.sort((a, b) => a.best.price - b.best.price);
    else if (sort === 'precio_desc') rows.sort((a, b) => b.best.price - a.best.price);
    else if (sort === 'ahorro') rows.sort((a, b) => b.spreadPct - a.spreadPct);
    else if (sort === 'marca') rows.sort((a, b) => a.brand.localeCompare(b.brand));
    return rows;
  }

  async function byId(id) {
    const p = A.data.product(id);
    return p ? enrich(p) : null;
  }

  /** Ofertas destacadas de la semana. */
  async function deals(n) {
    const all = A.data.PRODUCTS.map(enrich).filter((p) => p.hasPromo);
    all.sort((a, b) => (b.best.discount || 0) - (a.best.discount || 0));
    return all.slice(0, n || 6);
  }

  A.api = A.api || {};
  A.api.materials = { search, byId, deals, enrich };
})(window.App);

/* ============================================================
   core.js — utilidades base, DOM, formato, toast, sheet
   Namespace global: App
   ============================================================ */
window.App = window.App || {};

(function (A) {
  'use strict';

  /* ---------- DOM helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Crea un nodo desde una cadena HTML. */
  function node(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /** Escapa texto para insertarlo en HTML. */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Delegación de eventos sobre el contenedor raíz. */
  function on(root, evt, sel, fn) {
    root.addEventListener(evt, (e) => {
      const el = e.target.closest(sel);
      if (el && root.contains(el)) fn(e, el);
    });
  }

  /* ---------- Formato ---------- */
  const eur = (n, dec) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: dec == null ? 0 : dec,
    maximumFractionDigits: dec == null ? 0 : dec
  }).format(Number.isFinite(n) ? n : 0);

  const num = (n, dec) => new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: dec || 0, maximumFractionDigits: dec == null ? 0 : dec
  }).format(Number.isFinite(n) ? n : 0);

  const dateFmt = (iso, withTime) => {
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    const opts = { day: '2-digit', month: 'short', year: 'numeric' };
    if (withTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
    return d.toLocaleDateString('es-ES', opts);
  };

  const timeAgo = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' h';
    if (diff < 604800) return Math.floor(diff / 86400) + ' d';
    return dateFmt(iso);
  };

  const uid = (p) => (p || 'id') + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  /** Referencia legible tipo PRES-2026-0042 */
  function ref(prefix, n) {
    return prefix + '-' + new Date().getFullYear() + '-' + String(n).padStart(4, '0');
  }

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const round = (v, step) => Math.round(v / (step || 1)) * (step || 1);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /** Hash determinista para generar datos "aleatorios" estables. */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }
  const seeded = (seed, min, max) => min + (hash(seed) % 10000) / 10000 * (max - min);

  /* ---------- Toast ---------- */
  function toast(msg, kind) {
    let host = $('.toasts');
    if (!host) { host = node('<div class="toasts"></div>'); document.body.appendChild(host); }
    const t = node(`<div class="toast ${kind || ''}">${A.icon(kind === 'err' ? 'alert' : kind === 'ok' ? 'check-circle' : 'info', 18)}<span>${esc(msg)}</span></div>`);
    host.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0'; t.style.transform = 'translateY(10px)';
      setTimeout(() => t.remove(), 320);
    }, 3200);
  }

  /* ---------- Sheet (modal inferior) ---------- */
  let sheetEl = null;
  function sheet(html, opts) {
    closeSheet();
    opts = opts || {};
    const wrap = node(`
      <div class="sheet-wrap">
        <div class="scrim" data-close></div>
        <div class="sheet" role="dialog" aria-modal="true">
          <div class="sheet-grip"></div>
          ${opts.title ? `<div class="between" style="margin-bottom:12px">
              <h3 style="font-size:17px">${esc(opts.title)}</h3>
              <button class="iconbtn" data-close aria-label="Cerrar">${A.icon('x', 20)}</button>
            </div>` : ''}
          <div class="sheet-content">${html}</div>
        </div>
      </div>`);
    document.body.appendChild(wrap);
    requestAnimationFrame(() => { wrap.classList.add('open'); $('.scrim', wrap).classList.add('open'); });
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });
    document.body.style.overflow = 'hidden';
    sheetEl = wrap;
    return wrap;
  }
  function closeSheet() {
    if (!sheetEl) return;
    const el = sheetEl; sheetEl = null;
    el.classList.remove('open'); $('.scrim', el) && $('.scrim', el).classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => el.remove(), 300);
  }

  /* ---------- Confirmación ---------- */
  function confirmDialog(title, text, okLabel) {
    return new Promise((resolve) => {
      const w = sheet(`
        <p class="muted" style="margin-bottom:18px">${esc(text)}</p>
        <div class="row" style="gap:10px">
          <button class="btn btn-ghost btn-block" data-no>Cancelar</button>
          <button class="btn btn-danger btn-block" data-yes>${esc(okLabel || 'Confirmar')}</button>
        </div>`, { title });
      w.addEventListener('click', (e) => {
        if (e.target.closest('[data-yes]')) { resolve(true); closeSheet(); }
        else if (e.target.closest('[data-no]') || e.target.closest('[data-close]')) { resolve(false); }
      });
    });
  }

  /* ---------- Almacenamiento seguro ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    del(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };

  /* ---------- Imágenes generativas (sin red) ----------
     Genera un SVG data-URI con textura/gradiente determinista para
     ilustrar proyectos, materiales y renders sin recursos externos.  */
  const PALETTES = [
    ['#0B2545', '#25599A'], ['#334155', '#94A3B8'], ['#7C5A38', '#C9A227'],
    ['#2E5E4E', '#7FB69B'], ['#5A3B4C', '#B98AA0'], ['#3A4A5E', '#8FA8C4'],
    ['#6B4B2A', '#D2A679'], ['#1F3A5F', '#4A7CBF']
  ];
  function artwork(seed, label, kind) {
    const h = hash(seed);
    const p = PALETTES[h % PALETTES.length];
    const a = 12 + (h % 40);
    const shapes = [];
    for (let i = 0; i < 6; i++) {
      const s = hash(seed + i);
      const x = s % 400, y = (s >> 3) % 300, w = 40 + (s >> 6) % 160, hh = 30 + (s >> 9) % 120;
      const op = 0.06 + ((s >> 12) % 14) / 100;
      shapes.push(`<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#fff" opacity="${op.toFixed(2)}" rx="6"/>`);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/>
      </linearGradient>
      <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})">
        <path d="M25 0H0V25" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="1"/>
      </pattern></defs>
      <rect width="400" height="300" fill="url(#g)"/>
      ${shapes.join('')}
      <rect width="400" height="300" fill="url(#grid)"/>
      ${label ? `<text x="200" y="158" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="19" font-weight="700" fill="#fff" fill-opacity=".92">${esc(label).slice(0, 26)}</text>` : ''}
      ${kind ? `<text x="200" y="182" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="11" letter-spacing="2.4" fill="#fff" fill-opacity=".55">${esc(kind).toUpperCase()}</text>` : ''}
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* ---------- Avatar con iniciales ---------- */
  function avatar(name, size) {
    const initials = String(name || '?').trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
    const h = hash(name || 'x');
    const p = PALETTES[h % PALETTES.length];
    const s = size || 40;
    return `<div style="width:${s}px;height:${s}px;border-radius:50%;flex:none;display:grid;place-items:center;
      background:linear-gradient(140deg,${p[0]},${p[1]});color:#fff;font-weight:800;font-size:${Math.round(s * 0.36)}px;letter-spacing:-.02em">${esc(initials)}</div>`;
  }

  /* ---------- Estrellas ---------- */
  function stars(v, size) {
    const s = size || 13; let out = '<span class="stars">';
    for (let i = 1; i <= 5; i++) out += A.icon(v >= i - 0.25 ? 'star-fill' : 'star', s);
    return out + '</span>';
  }

  /* ---------- Descarga de ficheros ----------
     En un navegador normal usa un enlace <a download>. Dentro del visor de
     artifacts de claude.ai, donde ese enlace está bloqueado, usa la API de
     descargas del propio visor. */
  function dataUrlToBlob(url) {
    const i = url.indexOf(',');
    const meta = url.slice(5, i);          // p. ej. "application/pdf;base64"
    const mime = meta.split(';')[0] || 'application/octet-stream';
    const payload = url.slice(i + 1);
    if (/;base64/i.test(meta)) {
      const bin = atob(payload);
      const arr = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
      return new Blob([arr], { type: mime });
    }
    return new Blob([decodeURIComponent(payload)], { type: mime });
  }

  async function download(filename, blobOrDataUrl) {
    const blob = (blobOrDataUrl instanceof Blob) ? blobOrDataUrl
      : (String(blobOrDataUrl).startsWith('data:') ? dataUrlToBlob(String(blobOrDataUrl)) : null);

    /* Visor de artifacts */
    if (window.claude && typeof window.claude.use === 'function' && blob) {
      let dl = null;
      try { dl = await window.claude.use('downloads'); } catch (e) { dl = null; }
      if (dl) {
        try { await dl.save({ filename, data: blob }); return true; }
        catch (err) {
          const code = err && err.code;
          if (code === 'declined') return false;
          if (code === 'rate_limited') { toast('Espera un momento e inténtalo de nuevo', 'err'); return false; }
          if (code === 'extension_not_enabled' || code === 'rejected_extension') {
            toast('Este visor no permite guardar archivos ' + filename.split('.').pop().toUpperCase() +
                  '. Abre la app fuera de claude.ai para descargarlo.', 'err');
            return false;
          }
          /* cualquier otro error: se intenta el método clásico */
        }
      }
    }

    /* Navegador estándar */
    const a = document.createElement('a');
    a.download = filename;
    a.href = blob ? URL.createObjectURL(blob) : blobOrDataUrl;
    document.body.appendChild(a); a.click();
    setTimeout(() => { if (a.href.startsWith('blob:')) URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return true;
  }

  /* ---------- Validación ---------- */
  const validators = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v || '').trim()),
    phone: (v) => /^(\+?\d{1,3}[\s-]?)?[6789]\d{2}[\s-]?\d{3}[\s-]?\d{3}$/.test(String(v || '').replace(/\s/g, '')),
    cp: (v) => /^\d{5}$/.test(String(v || '').trim()),
    nif: (v) => {
      const s = String(v || '').toUpperCase().replace(/[\s-]/g, '');
      if (!/^\d{8}[A-Z]$/.test(s)) return false;
      return 'TRWAGMYFPDXBNJZSQVHLCKE'[parseInt(s.slice(0, 8), 10) % 23] === s[8];
    },
    required: (v) => String(v || '').trim().length > 0,
    min: (v, n) => String(v || '').trim().length >= n
  };

  A.$ = $; A.$$ = $$; A.node = node; A.esc = esc; A.on = on;
  A.eur = eur; A.num = num; A.dateFmt = dateFmt; A.timeAgo = timeAgo;
  A.uid = uid; A.ref = ref; A.clamp = clamp; A.round = round; A.sleep = sleep;
  A.hash = hash; A.seeded = seeded;
  A.toast = toast; A.sheet = sheet; A.closeSheet = closeSheet; A.confirm = confirmDialog;
  A.store = store; A.artwork = artwork; A.avatar = avatar; A.stars = stars;
  A.download = download; A.v = validators;
})(window.App);

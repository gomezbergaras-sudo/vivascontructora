/* ============================================================
   icons.js — iconografía SVG en línea (sin dependencias)
   ============================================================ */
(function (A) {
  'use strict';

  const P = {
    /* navegación */
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    grid:'<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="2.4"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3 17 5-4.5 4 3.2 3.5-3 5.5 5"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-6.6 8-6.6s8 2.4 8 6.6"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    x:'<path d="m6 6 12 12M18 6 6 18"/>',
    back:'<path d="M15 5 8 12l7 7"/>',
    chev:'<path d="m9 5 7 7-7 7"/>',
    chevDown:'<path d="m6 9 6 6 6-6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    check:'<path d="m4 12.5 5.5 5.5L20 7"/>',
    'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.8 2.8L16 9.5"/>',
    alert:'<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4.5M12 17.4v.1"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/>',
    star:'<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8z"/>',
    'star-fill':'<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8z" fill="currentColor"/>',
    heart:'<path d="M12 20s-7.5-4.6-9.2-9C1.4 7.6 3.3 4.5 6.6 4.5c2 0 3.6 1.2 5.4 3.6 1.8-2.4 3.4-3.6 5.4-3.6 3.3 0 5.2 3.1 3.8 6.5C19.5 15.4 12 20 12 20z"/>',
    bell:'<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.2 7.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.1 1z"/>',
    logout:'<path d="M15 17l5-5-5-5"/><path d="M20 12H9"/><path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9"/>',
    /* oficios */
    droplet:'<path d="M12 3s6 6.2 6 10.2A6 6 0 0 1 6 13.2C6 9.2 12 3 12 3z"/>',
    bolt:'<path d="M13.5 2 4 13.5h6.5L10 22l9.5-11.5H13z"/>',
    crane:'<path d="M4 21h16"/><path d="M7 21V6l11-2v4"/><path d="M7 6h13"/><path d="M14 6v4.5"/><path d="M11.5 10.5h5V14h-5z"/>',
    paint:'<path d="M4 8V5.4A1.4 1.4 0 0 1 5.4 4h11.2A1.4 1.4 0 0 1 18 5.4V8"/><path d="M4 8h14v4.4a1.6 1.6 0 0 1-1.6 1.6H13v2.4"/><rect x="10.5" y="16.5" width="5" height="5" rx="1.4"/>',
    wind:'<path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 13h13a3 3 0 1 1-3 3"/><path d="M3 18h7"/>',
    tools:'<path d="M14.7 6.3a4 4 0 0 0 5.3 5.3L21 21l-3 0-6.5-9"/><path d="M7 3 3 7l3.5 3.5L10 7z"/><path d="m6.5 10.5-4 4a2.1 2.1 0 0 0 3 3l4-4"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
    moon:'<path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
    /* documentos */
    file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    'file-text':'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
    download:'<path d="M12 3v12"/><path d="m7.5 11 4.5 4.5 4.5-4.5"/><path d="M4 20h16"/>',
    upload:'<path d="M12 20V8"/><path d="m7.5 12 4.5-4.5L16.5 12"/><path d="M4 4h16"/>',
    share:'<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4"/>',
    print:'<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    calc:'<rect x="4" y="2.5" width="16" height="19" rx="2.4"/><path d="M8 7h8"/><path d="M8.5 12h.1M12 12h.1M15.5 12h.1M8.5 16h.1M12 16h.1M15.5 16h.1"/>',
    /* comercio */
    cart:'<circle cx="9.5" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.3 11.2h11.2l2-8H6.2"/>',
    tag:'<path d="M20.6 12.6 12 21.2 2.8 12V2.8H12z"/><circle cx="7.7" cy="7.7" r="1.4"/>',
    euro:'<path d="M18 6.5A6.8 6.8 0 0 0 13.5 5C10 5 7.5 8 7.5 12s2.5 7 6 7A6.8 6.8 0 0 0 18 17.5"/><path d="M4.5 10.5h8M4.5 14h8"/>',
    card:'<rect x="2.5" y="5" width="19" height="14" rx="2.4"/><path d="M2.5 10h19"/><path d="M6.5 15h3"/>',
    /* comunicación */
    chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.2A8 8 0 1 1 21 12z"/>',
    mail:'<rect x="2.5" y="5" width="19" height="14" rx="2.4"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    phone:'<path d="M6.5 3h3l1.5 4.5-2 1.5a12.5 12.5 0 0 0 6 6l1.5-2L21 14.5v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4 5.2 2 2 0 0 1 6.5 3z"/>',
    whatsapp:'<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.5-4.3A8.5 8.5 0 1 1 20.5 11.6z"/><path d="M8.8 8.4c.3-.1.7 0 .9.4l.7 1.3c.2.3.1.6-.1.8l-.5.5a6 6 0 0 0 2.8 2.8l.5-.5c.2-.2.5-.3.8-.1l1.3.7c.4.2.5.6.4.9-.3.9-1.3 1.4-2.2 1.2a8.6 8.6 0 0 1-5.8-5.8c-.2-.9.3-1.9 1.2-2.2z"/>',
    send:'<path d="M21 3 10.5 13.5"/><path d="M21 3 14.5 21l-4-7.5L3 9.5z"/>',
    /* varios */
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2.4"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/>',
    pin:'<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    ruler:'<path d="M15.5 2.5 21.5 8.5 8.5 21.5 2.5 15.5z"/><path d="m7 11 2 2M10 8l2 2M13 5l2 2"/>',
    shield:'<path d="M12 3 4.5 6v6c0 4.4 3.1 8.2 7.5 9 4.4-.8 7.5-4.6 7.5-9V6z"/><path d="m9 12 2 2 4-4"/>',
    award:'<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 8L12 19l4.5 2.5-1.5-8"/>',
    sparkles:'<path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="m18.5 15.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>',
    camera:'<path d="M4 8h3l1.5-2.5h7L17 8h3a1.6 1.6 0 0 1 1.6 1.6v8.8A1.6 1.6 0 0 1 20 20H4a1.6 1.6 0 0 1-1.6-1.6V9.6A1.6 1.6 0 0 1 4 8z"/><circle cx="12" cy="13.5" r="3.6"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    trending:'<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    trash:'<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6 7v13a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 20V7"/><path d="M10 11.5v6M14 11.5v6"/>',
    edit:'<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14.5 5.5 4 4"/>',
    eye:'<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    filter:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    refresh:'<path d="M20 11a8 8 0 1 0-.7 5"/><path d="M20 4.5V11h-6"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
    lock:'<rect x="4.5" y="10" width="15" height="11" rx="2.2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6"/><path d="M17 5.2a3.5 3.5 0 0 1 0 6.6"/><path d="M18.5 14.6c2 .7 3 2.4 3 5.4"/>',
    package:'<path d="m12 2.5 8.5 4.6v9.8L12 21.5 3.5 16.9V7.1z"/><path d="M3.5 7.1 12 11.7l8.5-4.6M12 11.7v9.8"/>',
    building:'<rect x="4" y="3" width="16" height="18" rx="1.6"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/><path d="M10.5 21v-3h3v3"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8 2 2-1.5 1.5L21 9.5 19 11.5l-1.5-1.5-1.5 1.5-2-2"/>',
    play:'<circle cx="12" cy="12" r="9"/><path d="m10 8.5 6 3.5-6 3.5z" fill="currentColor"/>',
    thermometer:'<path d="M13.5 14V4.5a2.5 2.5 0 0 0-5 0V14a4.5 4.5 0 1 0 5 0z"/>',
    leaf:'<path d="M4 20c0-9 6-14 16-14 0 10-5 15-13 15-1 0-3 0-3-1z"/><path d="M9 15c2-3 5-5 8-6"/>'
  };

  /** icon(name, size, extraAttrs) → cadena SVG */
  A.icon = function (name, size, cls) {
    const d = P[name] || P.info;
    const s = size || 20;
    return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor"
      stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="${cls || ''}" aria-hidden="true">${d}</svg>`;
  };
  A.iconNames = Object.keys(P);
})(window.App);

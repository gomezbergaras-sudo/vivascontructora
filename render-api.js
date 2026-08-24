/* ============================================================
   api/render-api.js — Generador de renders con IA
   Con clave en config.integrations.aiRender llama al modelo real
   (Stability / Replicate / OpenAI images). Sin clave, produce una
   previsualización procedural con la paleta y el estilo elegidos.
   ============================================================ */
(function (A) {
  'use strict';

  const STYLES = [
    { id:'moderno',      name:'Moderno',      en:'Modern',        pal:['#2B3A48','#8FA8C4','#E8EEF6'], desc:'Líneas rectas, materiales mixtos y mucha luz.' },
    { id:'clasico',      name:'Clásico',      en:'Classic',       pal:['#5A4634','#C2A878','#F2E9DC'], desc:'Molduras, maderas nobles y simetría.' },
    { id:'minimalista',  name:'Minimalista',  en:'Minimalist',    pal:['#3A3A3A','#BFBFBF','#FAFAFA'], desc:'Todo oculto, paleta neutra, cero ruido visual.' },
    { id:'rustico',      name:'Rústico',      en:'Rustic',        pal:['#6B4B2A','#B98A5E','#EFE2CE'], desc:'Piedra, viga vista y cerámica artesanal.' },
    { id:'industrial',   name:'Industrial',   en:'Industrial',    pal:['#2E2E30','#7A7A7E','#C9C2B8'], desc:'Ladrillo visto, acero negro y hormigón.' },
    { id:'nordico',      name:'Nórdico',      en:'Scandinavian',  pal:['#4A5A66','#C7D3DA','#F7F5F1'], desc:'Madera clara, blancos cálidos y textiles.' },
    { id:'mediterraneo', name:'Mediterráneo', en:'Mediterranean', pal:['#1F5E7A','#7FB6C4','#F4EDE2'], desc:'Cal, azules marinos y fibras naturales.' }
  ];

  const PALETTES = [
    { id:'neutros',   name:'Neutros cálidos', colors:['#EDE6DC','#C9BBA8','#8A7A66'] },
    { id:'frios',     name:'Grises fríos',    colors:['#E7ECF1','#A9B7C4','#5F707F'] },
    { id:'tierra',    name:'Tonos tierra',    colors:['#E8D9C5','#C08B5C','#6E4B2A'] },
    { id:'verdes',    name:'Verdes salvia',   colors:['#E2EAE2','#9DB5A2','#4F6B57'] },
    { id:'azules',    name:'Azules profundos',colors:['#DCE6F0','#7FA3C8','#26476E'] },
    { id:'contraste', name:'Blanco y negro',  colors:['#FFFFFF','#9A9A9A','#1A1A1A'] }
  ];

  const MATERIALS = [
    { id:'madera',      name:'Madera natural' },
    { id:'porcelanico', name:'Porcelánico gran formato' },
    { id:'microcemento',name:'Microcemento' },
    { id:'piedra',      name:'Piedra natural' },
    { id:'lacado',      name:'Lacado mate' },
    { id:'metal',       name:'Metal negro' },
    { id:'terrazo',     name:'Terrazo' },
    { id:'vidrio',      name:'Vidrio y transparencias' }
  ];

  const ROOMS = ['Cocina','Salón','Baño','Dormitorio','Terraza','Fachada','Oficina','Local comercial'];

  /** Construye el prompt que se enviaría al modelo. */
  function buildPrompt(o) {
    const st = STYLES.find((s) => s.id === o.style) || STYLES[0];
    const pal = PALETTES.find((p) => p.id === o.palette);
    const mats = (o.materials || []).map((m) => (MATERIALS.find((x) => x.id === m) || {}).name).filter(Boolean);
    return [
      `Fotografía de interiorismo arquitectónico de ${o.room || 'estancia'} reformada`,
      `estilo ${st.name.toLowerCase()}`,
      pal ? `paleta ${pal.name.toLowerCase()}` : '',
      mats.length ? `materiales: ${mats.join(', ')}` : '',
      o.desc ? `detalles: ${o.desc}` : '',
      'luz natural suave, lente 24 mm, render fotorrealista, alta resolución, sin personas'
    ].filter(Boolean).join(', ');
  }

  /** Previsualización procedural (sin red) — SVG determinista. */
  function preview(seed, o, variant) {
    const st = STYLES.find((s) => s.id === o.style) || STYLES[0];
    const pal = PALETTES.find((p) => p.id === o.palette);
    const cols = pal ? pal.colors : st.pal;
    const h = A.hash(seed + variant);
    const wallY = 150 + (h % 30);
    const rects = [];
    for (let i = 0; i < 9; i++) {
      const s = A.hash(seed + variant + i);
      const x = 20 + (s % 340), y = 60 + ((s >> 4) % 190);
      const w = 30 + ((s >> 8) % 130), hh = 20 + ((s >> 11) % 90);
      const c = cols[(s >> 14) % cols.length];
      const r = 2 + ((s >> 17) % 10);
      rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${r}" fill="${c}" opacity="${(0.35 + ((s >> 20) % 50) / 100).toFixed(2)}"/>`);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${cols[0]}"/><stop offset="1" stop-color="${cols[1]}"/>
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${cols[2]}"/><stop offset="1" stop-color="${cols[1]}"/>
        </linearGradient>
        <radialGradient id="light" cx="0.72" cy="0.12" r="0.85">
          <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="${wallY}" fill="url(#wall)"/>
      <rect y="${wallY}" width="400" height="${300 - wallY}" fill="url(#floor)"/>
      ${rects.join('')}
      <rect width="400" height="300" fill="url(#light)"/>
      <rect x="0" y="${wallY - 1}" width="400" height="2" fill="#000" opacity=".12"/>
      <text x="14" y="286" font-family="Segoe UI,system-ui,sans-serif" font-size="10.5" fill="${cols[2]}" opacity=".85">
        ${A.esc(st.name)} · variación ${variant + 1}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /** Genera N variaciones. */
  async function generate(o, variations) {
    const n = variations || 4;
    const prompt = buildPrompt(o);

    if (A.hasKey('integrations.aiRender.apiKey')) {
      /* --- Ruta real --- */
      const cfg = A.config.integrations.aiRender;
      const body = { prompt, image: o.photo || null, model: cfg.model, samples: n, strength: 0.62 };
      const res = await fetch(cfg.endpoint, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + cfg.apiKey },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('El generador de renders no está disponible ahora mismo.');
      const data = await res.json();
      return { prompt, images: data.images };
    }

    /* --- Simulación con progreso --- */
    const seed = (o.room || '') + (o.style || '') + (o.palette || '') + (o.desc || '') + (o.materials || []).join('');
    const images = [];
    for (let i = 0; i < n; i++) {
      await A.sleep(500 + Math.random() * 450);
      images.push(preview(seed, o, i));
      if (o.onProgress) o.onProgress((i + 1) / n, images.slice());
    }
    return { prompt, images, simulated:true };
  }

  A.api = A.api || {};
  A.api.render = { STYLES, PALETTES, MATERIALS, ROOMS, generate, buildPrompt, preview };
})(window.App);

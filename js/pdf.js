/* ============================================================
   pdf.js — Generador de PDF propio (sin dependencias)
   Escribe PDF 1.4 con fuentes base Helvetica y codificación
   WinAnsi, suficiente para presupuestos e informes en español.
   ============================================================ */
(function (A) {
  'use strict';

  const PT = { A4:[595.28, 841.89] };

  /* Mapa Unicode → WinAnsi para los caracteres fuera de Latin-1 */
  const WIN = { 0x20AC:0x80, 0x201A:0x82, 0x0192:0x83, 0x201E:0x84, 0x2026:0x85, 0x2020:0x86,
    0x2021:0x87, 0x02C6:0x88, 0x2030:0x89, 0x0160:0x8A, 0x2039:0x8B, 0x0152:0x8C, 0x017D:0x8E,
    0x2018:0x91, 0x2019:0x92, 0x201C:0x93, 0x201D:0x94, 0x2022:0x95, 0x2013:0x96, 0x2014:0x97,
    0x02DC:0x98, 0x2122:0x99, 0x0161:0x9A, 0x203A:0x9B, 0x0153:0x9C, 0x017E:0x9E, 0x0178:0x9F };

  function toWin(str) {
    const out = [];
    for (const ch of String(str)) {
      const c = ch.codePointAt(0);
      if (c < 256) out.push(c);
      else if (WIN[c]) out.push(WIN[c]);
      else out.push(0x3F); // ?
    }
    return out;
  }
  function pdfString(str) {
    const bytes = toWin(str);
    let s = '';
    for (const b of bytes) {
      if (b === 0x28 || b === 0x29 || b === 0x5C) s += '\\' + String.fromCharCode(b);
      else if (b < 32 || b > 126) s += '\\' + b.toString(8).padStart(3, '0');
      else s += String.fromCharCode(b);
    }
    return s;
  }

  /* Anchos aproximados de Helvetica (por 1000 unidades) para medir texto */
  const W_REG = { ' ':278,'!':278,'"':355,'#':556,'$':556,'%':889,'&':667,"'":191,'(':333,')':333,'*':389,'+':584,',':278,'-':333,'.':278,'/':278,'0':556,'1':556,'2':556,'3':556,'4':556,'5':556,'6':556,'7':556,'8':556,'9':556,':':278,';':278,'<':584,'=':584,'>':584,'?':556,'@':1015,'[':278,'\\':278,']':278,'^':469,'_':556,'`':333,'{':334,'|':260,'}':334,'~':584 };
  const UPPER = 722, LOWER = 556;
  function charW(ch, bold) {
    const w = W_REG[ch];
    let v;
    if (w != null) v = w;
    else if (ch >= 'A' && ch <= 'Z') v = { I:278, J:500, L:556, M:833, W:944 }[ch] || UPPER;
    else if (ch >= 'a' && ch <= 'z') v = { f:278, i:222, j:222, l:222, m:833, r:333, t:278, w:722 }[ch] || LOWER;
    else v = 556;
    return bold ? v * 1.055 : v;
  }
  function textWidth(str, size, bold) {
    let t = 0; for (const ch of String(str)) t += charW(ch, bold);
    return (t / 1000) * size;
  }
  function wrap(str, size, bold, maxW) {
    const words = String(str).split(/\s+/); const lines = []; let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (textWidth(test, size, bold) > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  /* ---------------- Documento ---------------- */
  function Doc(opts) {
    opts = opts || {};
    this.size = PT.A4;
    this.margin = opts.margin || 42;
    this.pages = [];
    this.ops = [];
    this.images = [];
    this.y = 0;
    this.pageNo = 0;
    this.onNewPage = opts.onNewPage || null;
    const brandName = (A.data && A.data.COMPANY && A.data.COMPANY.legalName) || 'Vivas CR';
    this.meta = { title: opts.title || 'Documento', author: opts.author || brandName, subject: opts.subject || '' };
    this.addPage();
  }

  Doc.prototype.addPage = function () {
    if (this.ops.length) this.pages.push(this.ops.join('\n'));
    this.ops = [];
    this.pageNo++;
    this.y = this.margin;
    if (this.onNewPage) this.onNewPage(this);
  };
  Doc.prototype.W = function () { return this.size[0] - this.margin * 2; };
  Doc.prototype.space = function (n) { this.y += n; };
  Doc.prototype.need = function (h) {
    if (this.y + h > this.size[1] - this.margin - 26) { this.addPage(); return true; }
    return false;
  };
  Doc.prototype.rgb = function (hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]
      .map((v) => v.toFixed(3)).join(' ');
  };
  Doc.prototype.rect = function (x, y, w, h, color, op) {
    this.ops.push(`q ${op != null ? '/GS' + Math.round(op * 100) + ' gs ' : ''}${this.rgb(color)} rg ${x.toFixed(2)} ${(this.size[1] - y - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f Q`);
  };
  Doc.prototype.line = function (x1, y1, x2, y2, color, width) {
    this.ops.push(`q ${this.rgb(color || '#CBD5E1')} RG ${(width || 0.7).toFixed(2)} w ${x1.toFixed(2)} ${(this.size[1] - y1).toFixed(2)} m ${x2.toFixed(2)} ${(this.size[1] - y2).toFixed(2)} l S Q`);
  };
  /** Inserta una imagen JPEG (base64) en el punto y tamaño indicados. */
  Doc.prototype.image = function (b64, x, y, w, h, natW, natH) {
    let idx = this.images.findIndex((i) => i.b64 === b64);
    if (idx === -1) { this.images.push({ b64, w: natW || 300, h: natH || 300 }); idx = this.images.length - 1; }
    const yy = this.size[1] - y - h;
    this.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${yy.toFixed(2)} cm /Im${idx} Do Q`);
    return idx;
  };

  /** text(str, x, y, {size, bold, color, align, width}) */
  Doc.prototype.text = function (str, x, y, o) {
    o = o || {};
    const size = o.size || 10;
    const font = o.bold ? '/F2' : '/F1';
    let tx = x;
    if (o.align === 'right') tx = x - textWidth(str, size, o.bold);
    else if (o.align === 'center') tx = x - textWidth(str, size, o.bold) / 2;
    this.ops.push(`BT ${font} ${size} Tf ${this.rgb(o.color || '#0F1D31')} rg ${tx.toFixed(2)} ${(this.size[1] - y - size).toFixed(2)} Td (${pdfString(str)}) Tj ET`);
    return textWidth(str, size, o.bold);
  };
  /** Párrafo con salto de línea automático. Devuelve la altura consumida. */
  Doc.prototype.para = function (str, x, y, w, o) {
    o = o || {};
    const size = o.size || 10, lh = o.lh || size * 1.42;
    const lines = wrap(str, size, o.bold, w);
    lines.forEach((ln, i) => this.text(ln, x, y + i * lh, o));
    return lines.length * lh;
  };
  Doc.prototype.textWidth = textWidth;

  /* Serializa el PDF a Blob */
  Doc.prototype.blob = function () {
    if (this.ops.length) { this.pages.push(this.ops.join('\n')); this.ops = []; }
    const objs = [];
    const push = (s) => { objs.push(s); return objs.length; };

    const nPages = this.pages.length;
    const kidsIds = [];
    /* 1: Catalog · 2: Pages · 3: F1 · 4: F2 · 5: ExtGState set */
    push('<< /Type /Catalog /Pages 2 0 R >>');
    push('PAGES_PLACEHOLDER');
    push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const gsParts = [];
    for (let a = 5; a <= 100; a += 5) gsParts.push(`/GS${a} << /Type /ExtGState /ca ${(a / 100).toFixed(2)} >>`);
    push(`<< ${gsParts.join(' ')} >>`);

    /* Imágenes JPEG como XObjects compartidos por todas las páginas */
    const imgIds = [];
    this.images.forEach((im) => {
      const bin = atob(im.b64);
      imgIds.push(push(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bin.length} >>\nstream\n${bin}\nendstream`));
    });
    const xobjId = imgIds.length
      ? push(`<< ${imgIds.map((id, i) => `/Im${i} ${id} 0 R`).join(' ')} >>`)
      : 0;

    for (let i = 0; i < nPages; i++) {
      const content = this.pages[i];
      const cid = push(`<< /Length ${toWin(content).length} >>\nstream\n${content}\nendstream`);
      const pid = push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.size[0]} ${this.size[1]}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> /ExtGState 5 0 R` +
        `${xobjId ? ` /XObject ${xobjId} 0 R` : ''} >> /Contents ${cid} 0 R >>`);
      kidsIds.push(pid);
    }
    objs[1] = `<< /Type /Pages /Count ${nPages} /Kids [${kidsIds.map((k) => k + ' 0 R').join(' ')}] >>`;
    const infoId = push(`<< /Title (${pdfString(this.meta.title)}) /Author (${pdfString(this.meta.author)}) ` +
      `/Subject (${pdfString(this.meta.subject)}) /Producer (${pdfString(this.meta.author)}) ` +
      `/Creator (${pdfString(this.meta.author)}) >>`);

    /* Ensamblado con tabla xref */
    let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const offsets = [0];
    objs.forEach((body, i) => {
      offsets.push(out.length);
      out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objs.length; i++) out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF`;

    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xFF;
    return new Blob([bytes], { type:'application/pdf' });
  };

  A.PDF = { Doc, textWidth, wrap, PT };
})(window.App);

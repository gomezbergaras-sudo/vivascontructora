/* ============================================================
   docs.js — Documentos PDF: presupuesto y avalúo
   ============================================================ */
(function (A) {
  'use strict';

  const NAVY = '#063C6B', STEEL = '#5C7A93', LIGHT = '#EAF3FB', LINE = '#C2D4E4',
        DARK = '#08243D', GREEN = '#12A06B', AMBER = '#0092C9', CYAN = '#01C3FD', BLUE = '#0076D9';

  function header(d, title, subtitle) {
    const C = A.data.COMPANY;
    /* Banda blanca con el logotipo real */
    d.rect(0, 0, d.size[0], 96, '#FFFFFF');
    if (A.brand && A.brand.pdf) {
      d.image(A.brand.pdf.b64, d.margin, 16, 62, 62, A.brand.pdf.w, A.brand.pdf.h);
    }
    const x = d.margin + 74;
    d.text(C.name, x, 22, { size:17, bold:true, color:BLUE });
    d.text(C.tagline.toUpperCase(), x, 42, { size:7, bold:true, color:STEEL });
    d.text(`NIF ${C.nif}  ·  ${C.address}`, x, 56, { size:7.6, color:STEEL });
    d.text([C.phone, C.email, C.web].filter(Boolean).join('  ·  '), x, 68, { size:7.6, color:STEEL });

    d.text(title, d.size[0] - d.margin, 24, { size:13, bold:true, color:NAVY, align:'right' });
    if (subtitle) d.text(subtitle, d.size[0] - d.margin, 42, { size:8.5, color:STEEL, align:'right' });
    d.text(A.dateFmt(new Date().toISOString()), d.size[0] - d.margin, 56, { size:7.6, color:STEEL, align:'right' });

    /* Filete corporativo: cian del logo + azul */
    d.rect(0, 93, d.size[0] * 0.32, 3, CYAN);
    d.rect(d.size[0] * 0.32, 93, d.size[0] * 0.68, 3, BLUE);
    d.y = 122;
  }

  function footer(d) {
    const y = d.size[1] - 44;
    d.line(d.margin, y, d.size[0] - d.margin, y, LINE, 0.6);
    d.text(`${A.data.COMPANY.legalName} · NIF ${A.data.COMPANY.nif} · ${A.data.COMPANY.phone}`,
      d.margin, y + 8, { size:7.5, color:STEEL });
    d.text('Página ' + d.pageNo, d.size[0] - d.margin, y + 8, { size:7.5, color:STEEL, align:'right' });
  }

  function sectionTitle(d, txt) {
    d.need(40);
    d.rect(d.margin, d.y, 3, 13, AMBER);
    d.text(txt.toUpperCase(), d.margin + 9, d.y, { size:9.5, bold:true, color:NAVY });
    d.y += 22;
  }

  function kv(d, label, value, opts) {
    d.need(18);
    d.text(label, d.margin, d.y, { size:9, color:STEEL });
    d.text(value, d.size[0] - d.margin, d.y, { size:9, bold:(opts && opts.bold) || false, color:(opts && opts.color) || DARK, align:'right' });
    d.y += 15;
  }

  /* ---------------------------------------------------------
     PRESUPUESTO
     --------------------------------------------------------- */
  function quotePDF(q, client, refCode) {
    const d = new A.PDF.Doc({ title:'Presupuesto ' + (refCode || ''), subject:q.service.name });
    d.onNewPage = (doc) => { if (doc.pageNo > 1) { header(doc, 'PRESUPUESTO', refCode); } };
    header(d, 'PRESUPUESTO', refCode || '');

    /* Datos del cliente y de la obra */
    const boxY = d.y;
    d.rect(d.margin, boxY, d.W(), 78, LIGHT);
    d.text('CLIENTE', d.margin + 12, boxY + 11, { size:7.5, bold:true, color:STEEL });
    d.text(client.name || '—', d.margin + 12, boxY + 24, { size:10.5, bold:true });
    d.text(client.email || '', d.margin + 12, boxY + 39, { size:8.5, color:STEEL });
    d.text(client.phone || '', d.margin + 12, boxY + 51, { size:8.5, color:STEEL });
    d.text(client.address || '', d.margin + 12, boxY + 63, { size:8.5, color:STEEL });

    const cx = d.margin + d.W() / 2 + 10;
    d.text('DATOS DE LA OBRA', cx, boxY + 11, { size:7.5, bold:true, color:STEEL });
    d.text(q.service.name, cx, boxY + 24, { size:10.5, bold:true });
    d.text(`Provincia: ${q.province}  ·  Calidad: ${q.quality.name}`, cx, boxY + 39, { size:8.5, color:STEEL });
    d.text(`Medición: ${A.num(q.qty)} ${q.service.unitName}`, cx, boxY + 51, { size:8.5, color:STEEL });
    d.text(`Plazo estimado: ${q.days} días laborables`, cx, boxY + 63, { size:8.5, color:STEEL });
    d.y = boxY + 96;

    /* Descripción */
    sectionTitle(d, 'Descripción de los trabajos');
    d.y += d.para(q.service.desc, d.margin, d.y, d.W(), { size:9.5, color:DARK }) + 8;

    /* Partidas */
    sectionTitle(d, 'Desglose de partidas');
    const R = d.size[0] - d.margin;
    const colX = [d.margin, d.margin + 26, R - 150, R - 78, R];   /* nº · concepto · cant. · precio · importe */
    d.rect(d.margin, d.y - 4, d.W(), 18, LIGHT);
    d.text('Nº', colX[0] + 4, d.y, { size:7.5, bold:true, color:STEEL });
    d.text('CONCEPTO', colX[1], d.y, { size:7.5, bold:true, color:STEEL });
    d.text('CANT.', colX[2], d.y, { size:7.5, bold:true, color:STEEL, align:'right' });
    d.text('PRECIO', colX[3], d.y, { size:7.5, bold:true, color:STEEL, align:'right' });
    d.text('IMPORTE', colX[4], d.y, { size:7.5, bold:true, color:STEEL, align:'right' });
    d.y += 20;

    q.lines.forEach((l) => {
      const conceptW = colX[2] - colX[1] - 60;
      const lines = A.PDF.wrap(l.concept, 9, true, conceptW);
      const detailLines = l.detail ? A.PDF.wrap(l.detail, 7.8, false, conceptW) : [];
      const h = lines.length * 12 + detailLines.length * 10 + 10;
      if (d.need(h + 6)) {
        d.rect(d.margin, d.y - 4, d.W(), 18, LIGHT);
        d.text('CONCEPTO', colX[1], d.y, { size:7.5, bold:true, color:STEEL });
        d.text('IMPORTE', colX[4], d.y, { size:7.5, bold:true, color:STEEL, align:'right' });
        d.y += 20;
      }
      const y0 = d.y;
      d.text(l.code, colX[0] + 4, y0, { size:8, color:STEEL });
      lines.forEach((t, i) => d.text(t, colX[1], y0 + i * 12, { size:9, bold:true }));
      detailLines.forEach((t, i) => d.text(t, colX[1], y0 + lines.length * 12 + i * 10, { size:7.8, color:STEEL }));
      d.text(A.num(l.qty, l.qty % 1 ? 1 : 0) + ' ' + l.unit, colX[2], y0, { size:8.5, align:'right', color:STEEL });
      d.text(A.eur(l.unitPrice, 2), colX[3], y0, { size:8.5, align:'right', color:STEEL });
      d.text(A.eur(l.amount, 2), colX[4], y0, { size:9.5, bold:true, align:'right' });
      d.y = y0 + h;
      d.line(d.margin, d.y - 5, d.size[0] - d.margin, d.y - 5, '#E8EDF3', 0.5);
    });

    /* Totales */
    d.need(140);
    d.y += 8;
    const tx = d.size[0] - d.margin;
    const tW = 250, tX = tx - tW;
    d.rect(tX, d.y, tW, 4, NAVY);
    d.y += 14;
    const row = (l, v, bold, color) => {
      d.text(l, tX + 8, d.y, { size:9, color: color || STEEL, bold:!!bold });
      d.text(v, tx - 8, d.y, { size: bold ? 10.5 : 9, bold: !!bold, align:'right', color: color || DARK });
      d.y += 16;
    };
    row('Suma de partidas', A.eur(q.subtotal + q.discount, 2));
    if (q.discount > 0) row(`Descuento comercial (${q.discountPct} %)`, '− ' + A.eur(q.discount, 2), false, GREEN);
    row('Base imponible', A.eur(q.base, 2), true);
    row(`IVA (${Math.round(q.vatRate * 100)} %)`, A.eur(q.vat, 2));
    d.rect(tX, d.y - 4, tW, 30, NAVY);
    d.text('TOTAL', tX + 8, d.y + 5, { size:10, bold:true, color:'#FFFFFF' });
    d.text(A.eur(q.total, 2), tx - 8, d.y + 3, { size:14, bold:true, color:'#FFFFFF', align:'right' });
    d.y += 42;

    /* Incluye */
    if (q.includes && q.includes.length) {
      sectionTitle(d, 'El precio incluye');
      q.includes.forEach((it) => {
        d.need(16);
        d.rect(d.margin + 2, d.y + 3, 4, 4, GREEN);
        d.text(it, d.margin + 14, d.y, { size:9 });
        d.y += 14;
      });
      d.y += 6;
    }

    /* Plan de pagos */
    sectionTitle(d, 'Plan de pagos');
    q.payments.forEach((p) => {
      d.need(16);
      d.text(`${Math.round(p.pct * 100)} %  ·  ${p.label}`, d.margin, d.y, { size:9 });
      d.text(A.eur(p.amount, 2), d.size[0] - d.margin, d.y, { size:9, bold:true, align:'right' });
      d.y += 15;
    });
    d.y += 8;

    /* Condiciones */
    sectionTitle(d, 'Condiciones');
    const cond = [
      `Validez de la oferta: ${A.config.business.quoteValidityDays} días desde la fecha de emisión.`,
      'Los precios se han calculado con las mediciones facilitadas por el cliente. La visita técnica gratuita confirma el presupuesto y lo convierte en precio cerrado.',
      'Cualquier trabajo no descrito en este documento se valorará aparte y requerirá aprobación escrita antes de ejecutarse.',
      'Garantía: 3 años en acabados e instalaciones y 10 años en estructura e impermeabilización (Ley 38/1999 de Ordenación de la Edificación).',
      'Incluye gestión de residuos a gestor autorizado y limpieza final de la obra.',
      'Tratamiento de datos conforme al RGPD (UE) 2016/679. Responsable: ' + A.data.COMPANY.legalName +
        (A.config.gdpr.dpoEmail ? '. Ejercicio de derechos: ' + A.config.gdpr.dpoEmail : '') + '.'
    ];
    cond.forEach((c) => { d.need(30); d.y += d.para('· ' + c, d.margin, d.y, d.W(), { size:8, color:STEEL, lh:11 }) + 5; });

    /* Firmas */
    d.need(80);
    d.y += 20;
    const half = d.W() / 2 - 20;
    d.line(d.margin, d.y + 34, d.margin + half, d.y + 34, LINE);
    d.line(d.margin + half + 40, d.y + 34, d.size[0] - d.margin, d.y + 34, LINE);
    d.text('Por ' + A.data.COMPANY.name, d.margin, d.y + 40, { size:8, color:STEEL });
    d.text('Conforme el cliente', d.margin + half + 40, d.y + 40, { size:8, color:STEEL });

    footer(d);
    return d.blob();
  }

  /* ---------------------------------------------------------
     INFORME DE AVALÚO
     --------------------------------------------------------- */
  function valuationPDF(v, input, refCode) {
    const d = new A.PDF.Doc({ title:'Informe de avalúo ' + (refCode || ''), subject:'Valoración de inmueble' });
    d.onNewPage = (doc) => { if (doc.pageNo > 1) header(doc, 'INFORME DE AVALÚO', refCode); };
    header(d, 'INFORME DE AVALÚO', refCode || '');

    /* Valor destacado */
    d.rect(d.margin, d.y, d.W(), 92, NAVY);
    d.text('VALOR DE MERCADO ESTIMADO', d.margin + 16, d.y + 14, { size:8, bold:true, color:'#A9C0DC' });
    d.text(A.eur(v.value), d.margin + 16, d.y + 30, { size:26, bold:true, color:'#FFFFFF' });
    d.text(`Horquilla ${A.eur(v.low)} – ${A.eur(v.high)}`, d.margin + 16, d.y + 66, { size:9, color:'#A9C0DC' });
    d.text(A.eur(v.unit, 0) + ' /m²', d.size[0] - d.margin - 16, d.y + 30, { size:16, bold:true, color:'#FFFFFF', align:'right' });
    d.text(`${A.num(v.m2)} m² construidos`, d.size[0] - d.margin - 16, d.y + 56, { size:9, color:'#A9C0DC', align:'right' });
    d.y += 112;

    sectionTitle(d, 'Identificación del inmueble');
    kv(d, 'Dirección', input.address || '—');
    kv(d, 'Provincia / zona', `${input.province} · ${v.area.name}`);
    kv(d, 'Tipología', v.type.name);
    kv(d, 'Superficie construida', A.num(v.m2) + ' m²');
    kv(d, 'Distribución', `${input.rooms || '—'} hab. · ${input.baths || '—'} baños`);
    kv(d, 'Año de construcción', (input.year || '—') + `  (${v.age} años)`);
    kv(d, 'Estado de conservación', v.cond.name);
    kv(d, 'Certificación energética', input.energy || 'No disponible');
    kv(d, 'Referencia catastral', input.cadastral || 'No facilitada');
    d.y += 8;

    sectionTitle(d, 'Método de valoración por comparación');
    d.y += d.para('Se aplica el método de comparación del mercado (Orden ECO/805/2003), homogeneizando el valor unitario de la zona con coeficientes de tipología, estado, antigüedad, eficiencia energética y distribución.',
      d.margin, d.y, d.W(), { size:8.5, color:STEEL, lh:11 }) + 10;

    const coef = [
      ['Valor unitario de referencia en ' + input.province, A.eur(v.unitBase, 0) + ' /m²'],
      ['Coeficiente de zona (' + v.area.name + ')', '× ' + v.area.factor.toFixed(2)],
      ['Coeficiente de tipología (' + v.type.name + ')', '× ' + v.type.factor.toFixed(2)],
      ['Coeficiente de conservación (' + v.cond.name + ')', '× ' + v.cond.factor.toFixed(2)],
      ['Coeficiente de antigüedad (' + v.age + ' años)', '× ' + v.ageFactor.toFixed(2)],
      ['Coeficiente energético', '× ' + v.energyFactor.toFixed(3)],
      ['Coeficiente de distribución', '× ' + v.distFactor.toFixed(3)]
    ];
    coef.forEach((c) => kv(d, c[0], c[1]));
    d.line(d.margin, d.y + 2, d.size[0] - d.margin, d.y + 2, LINE); d.y += 10;
    kv(d, 'Valor unitario homogeneizado', A.eur(v.unit, 0) + ' /m²', { bold:true });
    kv(d, 'Valor bruto (' + A.num(v.m2) + ' m²)', A.eur(v.gross), { bold:true });
    d.y += 10;

    if (v.improvements.length || v.drawbacks.length) {
      sectionTitle(d, 'Mejoras y plusvalías / minusvalías');
      v.improvements.forEach((i) => kv(d, '+ ' + i.name, '+ ' + A.eur(i.amount), { color:GREEN }));
      v.drawbacks.forEach((i) => kv(d, '− ' + i.name, A.eur(i.amount), { color:'#D14343' }));
      d.line(d.margin, d.y + 2, d.size[0] - d.margin, d.y + 2, LINE); d.y += 10;
      kv(d, 'VALOR DE MERCADO', A.eur(v.value), { bold:true, color:NAVY });
      d.y += 10;
    }

    sectionTitle(d, 'Testigos comparables de la zona');
    d.rect(d.margin, d.y - 4, d.W(), 18, '#E2E8F0');
    d.text('REF.', d.margin + 6, d.y, { size:7.5, bold:true, color:STEEL });
    d.text('SUPERFICIE', d.margin + 90, d.y, { size:7.5, bold:true, color:STEEL });
    d.text('HAB.', d.margin + 175, d.y, { size:7.5, bold:true, color:STEEL });
    d.text('ESTADO', d.margin + 215, d.y, { size:7.5, bold:true, color:STEEL });
    d.text('€/m²', d.size[0] - d.margin - 80, d.y, { size:7.5, bold:true, color:STEEL, align:'right' });
    d.text('PRECIO', d.size[0] - d.margin, d.y, { size:7.5, bold:true, color:STEEL, align:'right' });
    d.y += 20;
    v.comparables.forEach((c) => {
      d.need(16);
      d.text(c.ref, d.margin + 6, d.y, { size:8.5 });
      d.text(A.num(c.m2) + ' m²', d.margin + 90, d.y, { size:8.5 });
      d.text(String(c.rooms), d.margin + 175, d.y, { size:8.5 });
      d.text(c.cond, d.margin + 215, d.y, { size:8.5, color:STEEL });
      d.text(A.eur(c.unit, 0), d.size[0] - d.margin - 80, d.y, { size:8.5, align:'right' });
      d.text(A.eur(c.price), d.size[0] - d.margin, d.y, { size:8.5, bold:true, align:'right' });
      d.y += 15;
    });
    d.y += 6;
    kv(d, 'Media de mercado en la zona', A.eur(v.marketAvgUnit, 0) + ' /m²', { bold:true });
    kv(d, 'Diferencia respecto al inmueble valorado',
      (v.unit >= v.marketAvgUnit ? '+' : '') + A.num(((v.unit / v.marketAvgUnit) - 1) * 100, 1) + ' %',
      { bold:true, color: v.unit >= v.marketAvgUnit ? GREEN : '#D14343' });
    d.y += 12;

    sectionTitle(d, 'Rentabilidad y potencial');
    kv(d, 'Alquiler mensual estimado', A.eur(v.monthlyRent));
    kv(d, 'Rentabilidad bruta anual de la zona', A.num(v.grossYield, 1) + ' %');
    kv(d, 'Variación interanual de precios', '+' + A.num(v.trend, 1) + ' %');
    kv(d, 'Tiempo medio de venta estimado', v.liquidity + ' días');
    d.y += 6;
    kv(d, 'Valor potencial tras reforma integral', A.eur(v.potential), { bold:true });
    kv(d, 'Coste estimado de la reforma', '− ' + A.eur(v.reformCost));
    kv(d, 'Plusvalía neta esperada', (v.upside >= 0 ? '+ ' : '− ') + A.eur(Math.abs(v.upside)),
      { bold:true, color: v.upside >= 0 ? GREEN : '#D14343' });
    d.y += 12;

    sectionTitle(d, 'Gastos estimados de compraventa');
    kv(d, 'ITP / IVA (7 % orientativo)', A.eur(v.costs.itp));
    kv(d, 'Notaría', A.eur(v.costs.notary));
    kv(d, 'Registro de la propiedad', A.eur(v.costs.registry));
    kv(d, 'Gestoría', A.eur(v.costs.agency));
    kv(d, 'Total de gastos', A.eur(v.costs.total), { bold:true });
    d.y += 14;

    sectionTitle(d, 'Alcance y limitaciones');
    [
      'Informe de valoración orientativo elaborado por el método de comparación con datos de mercado de la zona en la fecha de emisión.',
      'No sustituye a una tasación oficial ECO para finalidad hipotecaria, que debe emitir una sociedad de tasación homologada por el Banco de España.',
      'La valoración se basa en los datos facilitados por el solicitante. Una inspección presencial puede modificar el resultado.',
      'No se han verificado cargas, servidumbres ni la situación urbanística del inmueble.',
      'Datos tratados conforme al RGPD (UE) 2016/679. Responsable: ' + A.data.COMPANY.legalName + '.'
    ].forEach((t) => { d.need(28); d.y += d.para('· ' + t, d.margin, d.y, d.W(), { size:8, color:STEEL, lh:11 }) + 5; });

    d.need(90);
    d.y += 18;
    d.rect(d.margin, d.y, d.W(), 62, LIGHT);
    d.text('EMITIDO POR', d.margin + 14, d.y + 12, { size:8, bold:true, color:NAVY });
    d.text(A.data.COMPANY.legalName + ' · NIF ' + A.data.COMPANY.nif,
      d.margin + 14, d.y + 28, { size:9 });
    d.text('Emitido el ' + A.dateFmt(new Date().toISOString()) + '  ·  Ref. ' + (refCode || '—'),
      d.margin + 14, d.y + 44, { size:8, color:STEEL });

    footer(d);
    return d.blob();
  }

  A.docs = { quotePDF, valuationPDF };
})(window.App);

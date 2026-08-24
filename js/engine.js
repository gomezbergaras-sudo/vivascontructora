/* ============================================================
   engine.js — Motores de cálculo
   · quoteEngine  : presupuestos de obra y servicios
   · valuationEngine : avalúo de inmuebles
   Todos los importes en euros, base imponible salvo indicación.
   ============================================================ */
(function (A) {
  'use strict';

  const IVA_GENERAL = 0.21;
  const IVA_REFORMA = 0.10;   // Reforma de vivienda con > 2 años de antigüedad
  const IVA_OBRA_NUEVA = 0.10;

  /* Servicios que pueden acogerse al IVA reducido del 10 % */
  const REDUCED_VAT_CATS = ['fontaneria', 'electricidad', 'reformas', 'climatizacion', 'adicionales'];

  /**
   * Calcula un presupuesto completo.
   * @param {object} input
   *  { serviceId, qty, quality, province, urgency, extras:[ids], vivienda2anios:boolean,
   *    materialsFromCart:[{name,price,qty}] , discountPct }
   */
  function quote(input) {
    const svc = A.data.service(input.serviceId);
    if (!svc) return null;

    const qual = A.data.QUALITIES.find((q) => q.id === input.quality) || A.data.QUALITIES[1];
    const urg = A.data.URGENCY.find((u) => u.id === input.urgency) || A.data.URGENCY[0];
    const regionF = A.data.REGION_FACTOR[input.province] != null ? A.data.REGION_FACTOR[input.province] : 1;

    const qty = A.clamp(Number(input.qty) || svc.qty.def, svc.qty.min, svc.qty.max);

    /* --- Partidas --- */
    const lines = [];

    // 1. Trabajo principal
    const unitPrice = svc.base * qual.factor * regionF;
    const mainAmount = unitPrice * qty;
    lines.push({
      code:'01', concept:`${svc.name} — ${qual.name}`,
      detail:`${A.num(qty, qty % 1 ? 1 : 0)} ${svc.unitName} × ${A.eur(unitPrice, 2)}`,
      qty, unit:svc.unit, unitPrice, amount:mainAmount, group:'principal'
    });

    // 2. Puesta en obra / desplazamiento
    const setup = svc.fixed * regionF;
    if (setup > 0) {
      lines.push({
        code:'02', concept:'Puesta en obra, medios auxiliares y protección',
        detail:'Desplazamiento, protecciones, andamiaje ligero y retirada de residuos a gestor autorizado',
        qty:1, unit:'partida', unitPrice:setup, amount:setup, group:'principal'
      });
    }

    // 3. Extras seleccionados
    const chosen = (input.extras || []);
    let n = 3;
    (svc.extras || []).forEach((ex) => {
      if (chosen.indexOf(ex.id) === -1) return;
      const q = ex.type === 'unit' ? qty : 1;
      const p = ex.price * regionF * (ex.type === 'unit' ? 1 : 1);
      lines.push({
        code:String(n++).padStart(2, '0'), concept:ex.name,
        detail: ex.type === 'unit' ? `${A.num(q)} × ${A.eur(p, 2)}` : 'Partida alzada',
        qty:q, unit: ex.type === 'unit' ? svc.unit : 'partida',
        unitPrice:p, amount:p * q, group:'extras'
      });
    });

    // 4. Materiales añadidos desde el comparador
    (input.materials || []).forEach((m) => {
      const amt = (m.price / 1.21) * (m.qty || 1); // los PVP del comparador incluyen IVA
      lines.push({
        code:String(n++).padStart(2, '0'), concept:`Material: ${m.name}`,
        detail:`${m.qty || 1} × ${A.eur(m.price / 1.21, 2)} (${m.store || 'proveedor'})`,
        qty:m.qty || 1, unit:'ud', unitPrice:m.price / 1.21, amount:amt, group:'materiales'
      });
    });

    /* --- Totales --- */
    let subtotal = lines.reduce((s, l) => s + l.amount, 0);

    // Urgencia
    const urgencyAmount = subtotal * (urg.factor - 1);
    if (urgencyAmount > 0) {
      lines.push({
        code:'99A', concept:`Recargo por ${urg.name.toLowerCase()}`, detail:`+${Math.round((urg.factor - 1) * 100)} % sobre base`,
        qty:1, unit:'partida', unitPrice:urgencyAmount, amount:urgencyAmount, group:'ajustes'
      });
      subtotal += urgencyAmount;
    }

    // Mínimo facturable
    let minApplied = false;
    if (subtotal < svc.minTotal) { subtotal = svc.minTotal; minApplied = true; }

    // Descuento comercial
    const discPct = A.clamp(Number(input.discountPct) || 0, 0, 30);
    const discount = subtotal * (discPct / 100);
    const base = subtotal - discount;

    // IVA
    const reduced = input.vivienda2anios !== false && REDUCED_VAT_CATS.indexOf(svc.cat) !== -1;
    const vatRate = svc.cat === 'construccion'
      ? (input.obraNueva ? IVA_OBRA_NUEVA : IVA_GENERAL)
      : (reduced ? IVA_REFORMA : IVA_GENERAL);
    const vat = base * vatRate;
    const total = base + vat;

    /* --- Plazo --- */
    const rawDays = svc.days[0] + svc.days[1] * qty;
    const days = Math.max(1, Math.round(rawDays / (urg.id === 'urgente' ? 1.4 : urg.id === 'preferente' ? 1.15 : 1)));

    /* --- Plan de pagos --- */
    const payments = [
      { label:'Firma del contrato (acopio de material)', pct:0.40, amount:total * 0.40 },
      { label:'Certificación de avance al 50 %', pct:0.35, amount:total * 0.35 },
      { label:'Certificación al 90 %', pct:0.15, amount:total * 0.15 },
      { label:'Entrega y revisión final', pct:0.10, amount:total * 0.10 }
    ];

    /* --- Rango de confianza --- */
    const spread = svc.cat === 'construccion' ? 0.12 : 0.08;

    return {
      service:svc, quality:qual, urgency:urg, province:input.province, regionFactor:regionF,
      qty, lines, subtotal, discount, discountPct:discPct, base, vatRate, vat, total,
      minApplied, days, payments,
      rangeLow: total * (1 - spread), rangeHigh: total * (1 + spread),
      includes: svc.includes || [],
      pricePerUnit: qty ? total / qty : total
    };
  }

  /**
   * Avalúo de inmueble.
   * @param {object} i
   *  { province, areaType, propertyType, m2, rooms, baths, year, condition,
   *    energy, improvements:[ids], drawbacks:[ids], floor, hasLift }
   */
  function valuation(i) {
    const z = A.data.zone(i.province);
    const area = A.data.AREA_TYPE.find((a) => a.id === i.areaType) || A.data.AREA_TYPE[2];
    const type = A.data.PROPERTY_TYPE.find((p) => p.id === i.propertyType) || A.data.PROPERTY_TYPE[0];
    const cond = A.data.CONDITION.find((c) => c.id === i.condition) || A.data.CONDITION[2];
    const m2 = Math.max(15, Number(i.m2) || 80);
    const age = Math.max(0, new Date().getFullYear() - (Number(i.year) || 1990));
    const ageF = A.data.ageFactor(age);

    /* Valor unitario */
    const unitBase = z.base;
    let unit = unitBase * area.factor * type.factor * cond.factor * ageF;

    /* Certificación energética */
    const eIdx = A.data.ENERGY.indexOf(i.energy || 'D');
    const energyF = 1 + (3 - eIdx) * 0.012;   // A ≈ +3,6 % · G ≈ −4,8 %
    unit *= energyF;

    /* Distribución: penaliza viviendas con pocas piezas para su superficie */
    const rooms = Number(i.rooms) || 3;
    const idealRooms = A.clamp(Math.round(m2 / 28), 1, 6);
    const distF = 1 - Math.min(0.05, Math.abs(rooms - idealRooms) * 0.015);
    unit *= distF;

    let gross = unit * m2;

    /* Mejoras */
    const impDetail = [];
    (i.improvements || []).forEach((id) => {
      const im = A.data.IMPROVEMENTS.find((x) => x.id === id);
      if (!im) return;
      const amount = im.type === 'pct' ? gross * im.value : im.value;
      impDetail.push({ name:im.name, amount });
    });
    const impTotal = impDetail.reduce((s, x) => s + x.amount, 0);

    /* Penalizaciones */
    const drwDetail = [];
    (i.drawbacks || []).forEach((id) => {
      const d = A.data.DRAWBACKS.find((x) => x.id === id);
      if (!d) return;
      drwDetail.push({ name:d.name, amount: gross * d.value });
    });
    const drwTotal = drwDetail.reduce((s, x) => s + x.amount, 0);

    const value = Math.max(gross * 0.35, gross + impTotal + drwTotal);

    /* Mercado comparable (misma zona) */
    const comparables = [];
    for (let k = 0; k < 5; k++) {
      const seed = (i.province || '') + i.areaType + k + m2;
      const dm = Math.round(m2 * (0.82 + (A.hash(seed) % 40) / 100));
      const du = unit * (0.88 + (A.hash(seed + 'u') % 26) / 100);
      comparables.push({
        ref:'C-' + String(A.hash(seed) % 9000 + 1000),
        m2:dm, unit:du, price:du * dm,
        rooms: A.clamp(Math.round(dm / 28), 1, 6),
        cond: A.data.CONDITION[A.hash(seed + 'c') % A.data.CONDITION.length].name,
        days: 20 + (A.hash(seed + 'd') % 160)
      });
    }
    const marketAvgUnit = comparables.reduce((s, c) => s + c.unit, 0) / comparables.length;

    /* Alquiler estimado y rentabilidad */
    const monthlyRent = (value * (z.rentYield / 100)) / 12;

    /* Potencial tras reforma */
    const reformUnit = unitBase * area.factor * type.factor * 1.10 * A.data.ageFactor(Math.min(age, 15)) * energyF * distF;
    const potential = reformUnit * m2 + impTotal;
    const reformCost = m2 * (cond.id === 'ruina' ? 980 : cond.id === 'reformar' ? 760 : cond.id === 'aceptable' ? 420 : 180);
    const upside = potential - value - reformCost;

    /* Impuestos y gastos de compraventa (orientativo) */
    const itp = value * 0.07;
    const notary = A.clamp(value * 0.004, 600, 1800);
    const registry = A.clamp(value * 0.002, 400, 900);
    const agency = 400;

    return {
      zone:z, area, type, cond, m2, age, ageFactor:ageF, energyFactor:energyF, distFactor:distF,
      unitBase, unit, gross,
      improvements:impDetail, improvementsTotal:impTotal,
      drawbacks:drwDetail, drawbacksTotal:drwTotal,
      value, low: value * 0.93, high: value * 1.07,
      comparables, marketAvgUnit,
      monthlyRent, grossYield:z.rentYield, trend:z.trend,
      potential, reformCost, upside,
      costs:{ itp, notary, registry, agency, total: itp + notary + registry + agency },
      liquidity: Math.round(35 + (A.hash((i.province||'')+i.condition) % 120))
    };
  }

  A.engine = { quote, valuation, IVA_GENERAL, IVA_REFORMA };
})(window.App);

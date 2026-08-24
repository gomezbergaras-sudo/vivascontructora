/* ============================================================
   views/valuation.js — Avalúo de inmuebles
   ============================================================ */
(function (A) {
  'use strict';

  let V = null;
  function init() {
    V = A.store.get('nova.valdraft', null) || {
      step:0, address:'', province:(A.state.user && A.state.user.province) || 'Madrid',
      areaType:'ensanche', propertyType:'piso', m2:85, rooms:3, baths:1,
      year:1995, condition:'bueno', energy:'D', floor:2, cadastral:'',
      improvements:[], drawbacks:[]
    };
    return V;
  }
  const save = () => A.store.set('nova.valdraft', V);

  A.route('/avaluo', async () => {
    init();
    A.onMount(bind);
    return `<div class="container" style="padding-top:16px;max-width:840px">
      <div class="between" style="margin-bottom:6px">
        <div><div class="sec-title">${A.esc(A.t('valuation.title'))}</div>
          <div class="sec-sub">Valoración por comparación de mercado · España</div></div>
        <a class="btn btn-ghost btn-sm" href="#/avaluos">${A.icon('file-text', 15)} Historial</a>
      </div>
      ${V.step === 0 ? form() : result()}
    </div>`;
  }, { title:'Avalúo' });

  function form() {
    const D = A.data;
    return `<div class="card card-p">
      <div class="field"><label class="label">Dirección del inmueble</label>
        <input class="input" id="v-address" value="${A.esc(V.address)}" placeholder="Calle, número, población"></div>

      <div class="gf">
        <div class="field"><label class="label">Provincia</label>
          <select class="select" id="v-prov">${D.PROVINCES.map((p) => `<option ${V.province === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
        <div class="field"><label class="label">Tipo de zona</label>
          <select class="select" id="v-area">${D.AREA_TYPE.map((a) => `<option value="${a.id}" ${V.areaType === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}</select></div>
      </div>

      <label class="label">Tipología</label>
      <div class="optgrid" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr));margin-bottom:14px">
        ${D.PROPERTY_TYPE.map((t) => `<button class="opt ${V.propertyType === t.id ? 'sel' : ''}" data-ptype="${t.id}" style="padding:10px">
          <span class="check">${A.icon('check-circle', 15)}</span>
          <div class="opt-t" style="font-size:13px">${A.esc(t.name)}</div></button>`).join('')}
      </div>

      <div class="gf">
        <div class="field"><label class="label">Superficie construida (m²)</label>
          <input class="input mono" id="v-m2" type="number" value="${V.m2}" min="15" max="2000"></div>
        <div class="field"><label class="label">Año de construcción</label>
          <input class="input mono" id="v-year" type="number" value="${V.year}" min="1850" max="${new Date().getFullYear()}"></div>
        <div class="field"><label class="label">Habitaciones</label>
          <input class="input mono" id="v-rooms" type="number" value="${V.rooms}" min="0" max="12"></div>
        <div class="field"><label class="label">Baños</label>
          <input class="input mono" id="v-baths" type="number" value="${V.baths}" min="0" max="8"></div>
      </div>

      <label class="label">Estado de conservación</label>
      <div class="stack" style="gap:8px;margin-bottom:14px">
        ${D.CONDITION.map((c) => `<button class="opt ${V.condition === c.id ? 'sel' : ''}" data-cond="${c.id}" style="display:block;padding:11px">
          <span class="check">${A.icon('check-circle', 15)}</span>
          <div class="opt-t" style="font-size:13.5px">${A.esc(c.name)}</div>
          <div class="opt-d">${A.esc(c.note)}</div></button>`).join('')}
      </div>

      <div class="field"><label class="label">Certificación energética</label>
        <div class="chips">${D.ENERGY.map((e) => `<button class="chip ${V.energy === e ? 'sel' : ''}" data-energy="${e}">${e}</button>`).join('')}</div></div>

      <hr class="divider">
      <label class="label">Mejoras y elementos que suman valor</label>
      <div class="optgrid" style="grid-template-columns:repeat(auto-fill,minmax(165px,1fr));margin-bottom:14px">
        ${D.IMPROVEMENTS.map((i) => `<button class="opt ${V.improvements.indexOf(i.id) !== -1 ? 'sel' : ''}" data-imp="${i.id}" style="padding:10px">
          <span class="check">${A.icon('check-circle', 15)}</span>
          <div class="opt-t" style="font-size:13px">${A.esc(i.name)}</div>
          <div class="opt-p" style="color:var(--green)">+${i.type === 'pct' ? A.num(i.value * 100, 1) + ' %' : A.eur(i.value)}</div></button>`).join('')}
      </div>

      <label class="label">Aspectos que restan valor</label>
      <div class="optgrid" style="grid-template-columns:repeat(auto-fill,minmax(165px,1fr))">
        ${D.DRAWBACKS.map((i) => `<button class="opt ${V.drawbacks.indexOf(i.id) !== -1 ? 'sel' : ''}" data-drw="${i.id}" style="padding:10px">
          <span class="check">${A.icon('check-circle', 15)}</span>
          <div class="opt-t" style="font-size:13px">${A.esc(i.name)}</div>
          <div class="opt-p" style="color:var(--red)">${A.num(i.value * 100, 1)} %</div></button>`).join('')}
      </div>

      <div class="field" style="margin-top:14px"><label class="label">Referencia catastral (opcional)</label>
        <input class="input mono" id="v-cad" value="${A.esc(V.cadastral)}" placeholder="20 caracteres"></div>

      <button class="btn btn-accent btn-block btn-lg" id="v-calc" style="margin-top:8px">
        ${A.icon('building', 19)} Calcular valoración</button>
      <p class="small muted center" style="margin-top:10px">Informe orientativo. No sustituye a una tasación oficial ECO.</p>
    </div>`;
  }

  function result() {
    const v = A.engine.valuation(V);
    V.result = v;
    const maxUnit = Math.max(v.unit, v.marketAvgUnit, ...v.comparables.map((c) => c.unit));
    return `
    <div class="total-card">
      <div class="lbl">Valor de mercado estimado</div>
      <div class="big">${A.eur(v.value)}</div>
      <div class="small" style="color:rgba(255,255,255,.7);margin-top:2px">
        Horquilla ${A.eur(v.low)} – ${A.eur(v.high)} · ${A.eur(v.unit, 0)}/m²</div>
      <div class="row wrap" style="gap:18px;margin-top:16px">
        <div><div class="lbl">Superficie</div><div style="font-size:17px;font-weight:700">${A.num(v.m2)} m²</div></div>
        <div><div class="lbl">Alquiler estimado</div><div style="font-size:17px;font-weight:700">${A.eur(v.monthlyRent)}/mes</div></div>
        <div><div class="lbl">Rentabilidad</div><div style="font-size:17px;font-weight:700">${A.num(v.grossYield, 1)} %</div></div>
        <div><div class="lbl">Venta media</div><div style="font-size:17px;font-weight:700">${v.liquidity} días</div></div>
      </div>
    </div>

    <div class="row wrap" style="gap:9px;margin-top:14px">
      <button class="btn" id="v-pdf">${A.icon('download', 18)} Informe PDF</button>
      <button class="btn btn-soft" id="v-save">${A.icon('check', 18)} Guardar</button>
      <button class="btn btn-ghost" id="v-edit">${A.icon('edit', 17)} Modificar datos</button>
    </div>

    <div class="card card-p" style="margin-top:14px">
      <strong style="font-size:15px">Cómo se ha calculado</strong>
      <div class="line"><span class="muted">Valor de referencia en ${A.esc(V.province)}</span><span>${A.eur(v.unitBase, 0)}/m²</span></div>
      <div class="line"><span class="muted">Zona · ${A.esc(v.area.name)}</span><span>× ${v.area.factor.toFixed(2)}</span></div>
      <div class="line"><span class="muted">Tipología · ${A.esc(v.type.name)}</span><span>× ${v.type.factor.toFixed(2)}</span></div>
      <div class="line"><span class="muted">Conservación · ${A.esc(v.cond.name)}</span><span>× ${v.cond.factor.toFixed(2)}</span></div>
      <div class="line"><span class="muted">Antigüedad · ${v.age} años</span><span>× ${v.ageFactor.toFixed(2)}</span></div>
      <div class="line"><span class="muted">Eficiencia energética · ${A.esc(V.energy)}</span><span>× ${v.energyFactor.toFixed(3)}</span></div>
      <div class="line"><span class="muted">Distribución</span><span>× ${v.distFactor.toFixed(3)}</span></div>
      <hr class="divider">
      <div class="line"><span style="font-weight:700">Valor bruto</span><span style="font-weight:700">${A.eur(v.gross)}</span></div>
      ${v.improvements.map((i) => `<div class="line"><span class="muted">+ ${A.esc(i.name)}</span>
        <span style="color:var(--green)">+${A.eur(i.amount)}</span></div>`).join('')}
      ${v.drawbacks.map((i) => `<div class="line"><span class="muted">− ${A.esc(i.name)}</span>
        <span style="color:var(--red)">${A.eur(i.amount)}</span></div>`).join('')}
      <div class="line" style="font-size:16px"><span style="font-weight:800">VALOR FINAL</span>
        <span style="font-weight:800">${A.eur(v.value)}</span></div>
    </div>

    <div class="card card-p" style="margin-top:12px">
      <div class="between" style="margin-bottom:10px">
        <strong style="font-size:15px">Comparativa de mercado</strong>
        <span class="badge ${v.unit >= v.marketAvgUnit ? 'badge-green' : 'badge-amber'}">
          ${v.unit >= v.marketAvgUnit ? '+' : ''}${A.num(((v.unit / v.marketAvgUnit) - 1) * 100, 1)} % vs. media</span>
      </div>
      ${[{ label:'Este inmueble', unit:v.unit, me:true }, { label:'Media de la zona', unit:v.marketAvgUnit }]
        .concat(v.comparables.map((c) => ({ label:`${c.ref} · ${c.m2} m² · ${c.cond}`, unit:c.unit })))
        .map((r) => `<div style="margin-bottom:9px">
          <div class="between small" style="margin-bottom:3px">
            <span class="${r.me ? '' : 'muted'}" style="${r.me ? 'font-weight:700' : ''}">${A.esc(r.label)}</span>
            <span style="font-weight:700">${A.eur(r.unit, 0)}/m²</span></div>
          <div class="meter"><i style="width:${(r.unit / maxUnit * 100).toFixed(1)}%;background:${r.me ? 'var(--accent)' : 'var(--primary)'}"></i></div>
        </div>`).join('')}
    </div>

    <div class="grid g2" style="gap:12px;margin-top:12px">
      <div class="card card-p">
        <strong style="font-size:14.5px">Potencial tras reforma</strong>
        <div class="line"><span class="muted">Valor actual</span><span>${A.eur(v.value)}</span></div>
        <div class="line"><span class="muted">Valor tras reforma</span><span>${A.eur(v.potential)}</span></div>
        <div class="line"><span class="muted">Coste de la reforma</span><span>− ${A.eur(v.reformCost)}</span></div>
        <div class="line"><span style="font-weight:700">Plusvalía neta</span>
          <span style="font-weight:800;color:${v.upside >= 0 ? 'var(--green)' : 'var(--red)'}">
            ${v.upside >= 0 ? '+' : '−'}${A.eur(Math.abs(v.upside))}</span></div>
        <a class="btn btn-soft btn-sm btn-block" style="margin-top:12px" href="#/presupuesto/ref-cocina">
          ${A.icon('calc', 16)} Presupuestar la reforma</a>
      </div>
      <div class="card card-p">
        <strong style="font-size:14.5px">Gastos de compraventa</strong>
        <div class="line"><span class="muted">ITP / IVA (7 %)</span><span>${A.eur(v.costs.itp)}</span></div>
        <div class="line"><span class="muted">Notaría</span><span>${A.eur(v.costs.notary)}</span></div>
        <div class="line"><span class="muted">Registro</span><span>${A.eur(v.costs.registry)}</span></div>
        <div class="line"><span class="muted">Gestoría</span><span>${A.eur(v.costs.agency)}</span></div>
        <div class="line"><span style="font-weight:700">Total</span><span style="font-weight:800">${A.eur(v.costs.total)}</span></div>
      </div>
    </div>

    <div class="card card-p" style="margin-top:12px;background:var(--amber-soft);border-color:var(--accent)">
      <div class="row" style="gap:10px;align-items:flex-start">
        <span style="color:var(--accent);flex:none">${A.icon('award', 20)}</span>
        <div><strong style="font-size:14px">Certificación profesional</strong>
          <p class="small" style="margin-top:4px">El informe PDF va firmado por nuestra dirección técnica (arquitecta técnica colegiada).
          Para finalidad hipotecaria necesitas una tasación ECO emitida por sociedad homologada; te indicamos cuál contratar si la necesitas.</p></div>
      </div>
    </div>
    <div style="height:24px"></div>`;
  }

  function bind() {
    const set = (id, key, num) => {
      const el = A.$('#' + id);
      if (el) el.addEventListener('input', (e) => { V[key] = num ? Number(e.target.value) : e.target.value; save(); });
    };
    set('v-address', 'address'); set('v-cad', 'cadastral');
    set('v-m2', 'm2', true); set('v-year', 'year', true); set('v-rooms', 'rooms', true); set('v-baths', 'baths', true);
    const pv = A.$('#v-prov'); if (pv) pv.addEventListener('change', (e) => { V.province = e.target.value; save(); });
    const ar = A.$('#v-area'); if (ar) ar.addEventListener('change', (e) => { V.areaType = e.target.value; save(); });
    A.$$('[data-ptype]').forEach((b) => b.addEventListener('click', () => {
      V.propertyType = b.dataset.ptype; save(); A.$$('[data-ptype]').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    A.$$('[data-cond]').forEach((b) => b.addEventListener('click', () => {
      V.condition = b.dataset.cond; save(); A.$$('[data-cond]').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    A.$$('[data-energy]').forEach((b) => b.addEventListener('click', () => {
      V.energy = b.dataset.energy; save(); A.$$('[data-energy]').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    A.$$('[data-imp]').forEach((b) => b.addEventListener('click', () => {
      const i = V.improvements.indexOf(b.dataset.imp);
      if (i === -1) V.improvements.push(b.dataset.imp); else V.improvements.splice(i, 1);
      b.classList.toggle('sel'); save();
    }));
    A.$$('[data-drw]').forEach((b) => b.addEventListener('click', () => {
      const i = V.drawbacks.indexOf(b.dataset.drw);
      if (i === -1) V.drawbacks.push(b.dataset.drw); else V.drawbacks.splice(i, 1);
      b.classList.toggle('sel'); save();
    }));
    const calc = A.$('#v-calc');
    if (calc) calc.addEventListener('click', () => { V.step = 1; save(); A.render(); });
    const edit = A.$('#v-edit');
    if (edit) edit.addEventListener('click', () => { V.step = 0; save(); A.render(); });

    const pdf = A.$('#v-pdf');
    if (pdf) pdf.addEventListener('click', async () => {
      let rec; try { rec = await persist(); } catch (e) { return; }
      A.download(`Avaluo-${rec.ref}.pdf`, A.docs.valuationPDF(V.result, V, rec.ref));
      A.toast('Informe descargado', 'ok');
    });
    const sv = A.$('#v-save');
    if (sv) sv.addEventListener('click', async () => {
      let rec; try { rec = await persist(); } catch (e) { return; }
      await A.notify('Avalúo guardado', `${rec.ref} · ${A.eur(V.result.value)}`, 'building', '#/avaluos');
      A.toast('Guardado en tu historial', 'ok'); A.refreshBadge();
    });
  }

  async function persist() {
    if (!A.requireAuth('Entra en tu cuenta para guardar el avalúo')) throw new Error('sesión requerida');
    if (V.savedId) {
      const ex = await A.db.get('valuations', V.savedId);
      if (ex) return ex;
    }
    const n = (await A.db.list('valuations')).length + 1;
    const rec = await A.db.insert('valuations', {
      user_id: A.state.user ? A.state.user.id : 'anon', ref: A.ref('AVAL', n),
      address:V.address, province:V.province, area_type:V.areaType, property_type:V.propertyType,
      m2:V.m2, rooms:V.rooms, baths:V.baths, year:V.year, condition:V.condition, energy:V.energy,
      improvements:V.improvements, drawbacks:V.drawbacks,
      value:V.result.value, unit:V.result.unit, rent:V.result.monthlyRent, potential:V.result.potential
    });
    V.savedId = rec.id; save();
    return rec;
  }

  /* ---------------- Historial ---------------- */
  A.route('/avaluos', async () => {
    const rows = await A.db.list('valuations', A.state.user ? { user_id:A.state.user.id } : null);
    if (!rows.length) {
      return `<div class="container"><div class="empty" style="padding-top:60px">${A.icon('building', 44)}
        <h3>Sin avalúos guardados</h3><p class="small">Valora un inmueble en un minuto.</p>
        <a class="btn" style="margin-top:16px" href="#/avaluo">${A.icon('building', 18)} Nuevo avalúo</a></div></div>`;
    }
    return `<div class="container" style="padding-top:18px">
      <div class="between" style="margin-bottom:14px">
        <div><div class="sec-title">Mis avalúos</div><div class="sec-sub">${rows.length} informes</div></div>
        <a class="btn btn-sm" href="#/avaluo">${A.icon('plus', 16)} Nuevo</a>
      </div>
      <div class="stack">${rows.map((r) => `<div class="card card-p">
        <div class="between">
          <div><div class="mono small muted">${A.esc(r.ref)}</div>
            <div style="font-weight:700;margin-top:3px">${A.esc(r.address || 'Inmueble sin dirección')}</div>
            <div class="small muted">${A.esc(r.province)} · ${A.num(r.m2)} m² · ${A.dateFmt(r.created_at)}</div></div>
          <div style="text-align:right"><div style="font-weight:800;font-size:17px">${A.eur(r.value)}</div>
            <div class="small muted">${A.eur(r.unit, 0)}/m²</div></div>
        </div></div>`).join('')}</div><div style="height:20px"></div></div>`;
  }, { title:'Mis avalúos' });
})(window.App);

/* ============================================================
   views/admin.js — Panel de administración de la empresa
   ============================================================ */
(function (A) {
  'use strict';

  /* Gráfico de barras en SVG (sin librerías) */
  function barChart(data, opts) {
    opts = opts || {};
    const W = 320, H = opts.h || 150, PAD = 8, BASE = H - 22;
    const max = Math.max(1, ...data.map((d) => d.v));
    const bw = (W - PAD * 2) / data.length;
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
      <line x1="${PAD}" y1="${BASE}" x2="${W - PAD}" y2="${BASE}" stroke="var(--border)" stroke-width="1"/>
      ${data.map((d, i) => {
        const bh = (d.v / max) * (BASE - 22);
        const x = PAD + i * bw + bw * 0.2, bwidth = bw * 0.6;
        return `<rect x="${x.toFixed(1)}" y="${(BASE - bh).toFixed(1)}" width="${bwidth.toFixed(1)}"
            height="${Math.max(2, bh).toFixed(1)}" rx="3" fill="${d.c || 'var(--primary)'}">
            <title>${A.esc(d.l)}: ${A.esc(d.t || String(d.v))}</title></rect>
          <text x="${(x + bwidth / 2).toFixed(1)}" y="${BASE + 13}" text-anchor="middle"
            font-size="10" font-family="inherit" fill="var(--text-3)">${A.esc(d.l)}</text>
          ${d.v > 0 ? `<text x="${(x + bwidth / 2).toFixed(1)}" y="${(BASE - bh - 5).toFixed(1)}" text-anchor="middle"
            font-size="9.5" font-weight="700" font-family="inherit" fill="var(--text-2)">${A.esc(d.t || String(d.v))}</text>` : ''}`;
      }).join('')}
    </svg>`;
  }

  /* Gráfico de anillo */
  function donut(parts) {
    const total = parts.reduce((s, p) => s + p.v, 0) || 1;
    let acc = 0;
    const R = 38, C = 2 * Math.PI * R;
    return `<svg viewBox="0 0 100 100" style="width:120px;height:120px">
      <circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--bg-sunken)" stroke-width="16"/>
      ${parts.map((p) => {
        const len = (p.v / total) * C;
        const el = `<circle cx="50" cy="50" r="${R}" fill="none" stroke="${p.c}" stroke-width="16"
          stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}"
          stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 50 50)"><title>${A.esc(p.l)}: ${p.v}</title></circle>`;
        acc += len; return el;
      }).join('')}
      <text x="50" y="49" text-anchor="middle" font-size="15" font-weight="800" fill="var(--text)">${total}</text>
      <text x="50" y="60" text-anchor="middle" font-size="7" fill="var(--text-3)">presupuestos</text>
    </svg>`;
  }

  A.route('/admin', async () => {
    const [quotes, users, apps, pays, vals, cvs] = await Promise.all([
      A.db.list('quotes'), A.db.list('users'), A.db.list('appointments'),
      A.db.list('payments'), A.db.list('valuations'), A.db.list('applications')
    ]);

    const won = quotes.filter((q) => ['aceptado', 'en_obra', 'finalizado'].indexOf(q.status) !== -1);
    const pipeline = quotes.filter((q) => ['borrador', 'enviado'].indexOf(q.status) !== -1);
    const revenue = won.reduce((s, q) => s + q.total, 0);
    const avg = quotes.length ? quotes.reduce((s, q) => s + q.total, 0) / quotes.length : 0;
    const conv = quotes.length ? (won.length / quotes.length) * 100 : 0;
    const collected = pays.reduce((s, p) => s + p.amount, 0);

    /* Serie de los últimos 6 meses */
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const v = quotes.filter((q) => String(q.created_at).slice(0, 7) === key)
        .reduce((s, q) => s + q.total, 0);
      months.push({ l:d.toLocaleDateString('es-ES', { month:'short' }), v, t:A.eur(v) });
    }

    /* Por categoría */
    const COLORS = ['#0B2545', '#25599A', '#C4841F', '#2E9E6B', '#64748B', '#7C5A38'];
    const byCat = A.data.CATEGORIES.map((c, i) => ({
      l:c.name, v:quotes.filter((q) => q.category === c.id).length, c:COLORS[i % COLORS.length]
    })).filter((x) => x.v > 0);

    const STATUS_L = { borrador:'Borrador', enviado:'Enviado', aceptado:'Aceptado', en_obra:'En obra', finalizado:'Finalizado', rechazado:'Rechazado' };

    A.onMount(() => {
      A.$$('[data-cvst]').forEach((sel) => sel.addEventListener('change', async (e) => {
        await A.db.update('applications', sel.dataset.cvst, { status:e.target.value });
        A.toast('Candidatura actualizada', 'ok');
      }));
      A.$$('[data-cv]').forEach((b) => b.addEventListener('click', async () => {
        const rec = cvs.find((x) => x.id === b.dataset.cv);
        b.disabled = true; b.innerHTML = '<span class="spinner"></span>';
        try {
          const url = await A.jobs.cvUrl(rec);
          if (!url) throw new Error('El archivo ya no está disponible');
          window.open(url, '_blank', 'noopener');
        } catch (err) { A.toast(err.message, 'err'); }
        b.disabled = false; b.innerHTML = A.icon('download', 14) + ' Abrir';
      }));
      A.$$('[data-st]').forEach((s) => s.addEventListener('change', async (e) => {
        await A.db.update('quotes', s.dataset.st, { status:e.target.value });
        A.toast('Estado actualizado', 'ok');
      }));
      const on = A.$('#ad-demo-on');
      if (on) on.addEventListener('click', async () => {
        on.disabled = true; on.innerHTML = '<span class="spinner"></span> Generando…';
        await A.loadDemo(); A.toast('Datos de ejemplo cargados', 'ok'); A.render();
      });
      const off = A.$('#ad-demo-off');
      if (off) off.addEventListener('click', async () => {
        if (await A.confirm('Borrar datos de ejemplo', 'Se eliminarán solo los registros marcados como ejemplo. Tus datos reales no se tocan.', 'Borrar')) {
          await A.clearDemo(); A.toast('Ejemplos eliminados', 'ok'); A.render();
        }
      });
      A.$('#ad-export').addEventListener('click', () => {
        const head = 'Referencia;Fecha;Cliente;Servicio;Provincia;Estado;Base;IVA;Total\n';
        const rows = quotes.map((q) => [q.ref, String(q.created_at).slice(0, 10), q.client_name || '',
          q.service_name, q.province, q.status, (q.base || 0).toFixed(2), (q.vat || 0).toFixed(2), (q.total || 0).toFixed(2)]
          .join(';')).join('\n');
        A.download('vivascr-presupuestos.csv', new Blob(['﻿' + head + rows], { type:'text/csv;charset=utf-8' }));
        A.toast('CSV descargado', 'ok');
      });
    });

    const kpi = (v, l, sub, color) => `<div class="card card-p">
      <div class="small muted" style="font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:10.5px">${l}</div>
      <div style="font-weight:800;font-size:22px;letter-spacing:-.03em;margin-top:4px;${color ? 'color:' + color : ''}">${v}</div>
      ${sub ? `<div class="small muted" style="margin-top:2px">${sub}</div>` : ''}</div>`;

    return `<div class="container" style="padding-top:18px">
      <div class="between" style="margin-bottom:14px">
        <div><div class="sec-title">Panel de administración</div>
          <div class="sec-sub">${A.esc(A.data.COMPANY.legalName)} · datos en ${A.db.mode === 'supabase' ? 'Supabase' : 'este dispositivo'}</div></div>
        <div class="row" style="gap:8px">
          ${A.store.get('nova.demo', false)
            ? '<button class="btn btn-ghost btn-sm" id="ad-demo-off" style="color:var(--red)">' + A.icon('trash', 15) + ' Borrar ejemplos</button>'
            : '<button class="btn btn-ghost btn-sm" id="ad-demo-on">' + A.icon('sparkles', 15) + ' Cargar datos de ejemplo</button>'}
          <button class="btn btn-ghost btn-sm" id="ad-export">${A.icon('download', 15)} Exportar CSV</button>
        </div>
      </div>

      <div class="grid g4">
        ${kpi(A.eur(revenue), 'Contratado', won.length + ' obras', 'var(--green)')}
        ${kpi(A.eur(collected), 'Cobrado', pays.length + ' pagos')}
        ${kpi(A.num(conv, 0) + ' %', 'Conversión', quotes.length + ' presupuestos')}
        ${kpi(A.eur(avg), 'Ticket medio', 'por presupuesto')}
        ${kpi(String(pipeline.length), 'En pipeline', A.eur(pipeline.reduce((s, q) => s + q.total, 0)), 'var(--accent)')}
        ${kpi(String(users.length), 'Clientes', 'registrados')}
        ${kpi(String(apps.filter((a) => a.status !== 'cancelada').length), 'Citas activas', 'visitas y obra')}
        ${kpi(String(vals.length), 'Avalúos', 'informes emitidos')}
        ${kpi(String(cvs.filter((c) => c.status === 'nueva').length), 'Candidaturas',
             cvs.length + ' en total', cvs.some((c) => c.status === 'nueva') ? 'var(--accent)' : '')}
      </div>

      <div class="grid g2" style="gap:12px;margin-top:14px">
        <div class="card card-p">
          <strong style="font-size:15px">Volumen presupuestado (6 meses)</strong>
          <div style="margin-top:14px">${barChart(months)}</div>
        </div>
        <div class="card card-p">
          <strong style="font-size:15px">Reparto por área</strong>
          <div class="row" style="gap:16px;margin-top:12px;align-items:center">
            ${donut(byCat)}
            <div style="flex:1;min-width:0">
              ${byCat.map((c) => `<div class="between small" style="padding:3px 0">
                <span class="row" style="gap:7px"><span style="width:10px;height:10px;border-radius:3px;background:${c.c}"></span>
                ${A.esc(c.l)}</span><strong>${c.v}</strong></div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="sec-head"><div class="sec-title">Presupuestos</div>
        <div class="sec-sub">${quotes.length} registros</div></div>
      ${!quotes.length ? `<div class="empty" style="padding:34px 20px">${A.icon('file-text', 38)}
        <h3>Todavía no hay presupuestos</h3>
        <p class="small">Aparecerán aquí en cuanto un cliente calcule uno desde la app.</p></div>` : ''}
      <div class="tablewrap" ${!quotes.length ? 'style="display:none"' : ''}>
        <table><thead><tr>
          <th>Referencia</th><th>Fecha</th><th>Cliente</th><th>Servicio</th><th>Provincia</th><th>Total</th><th>Estado</th>
        </tr></thead><tbody>
          ${quotes.map((q) => `<tr>
            <td class="mono">${A.esc(q.ref)}</td>
            <td class="muted">${A.dateFmt(q.created_at)}</td>
            <td>${A.esc(q.client_name || '—')}</td>
            <td>${A.esc(q.service_name)}</td>
            <td class="muted">${A.esc(q.province)}</td>
            <td style="font-weight:700">${A.eur(q.total)}</td>
            <td><select class="select" data-st="${q.id}" style="height:32px;font-size:12.5px;padding:0 26px 0 8px">
              ${Object.keys(STATUS_L).map((k) => `<option value="${k}" ${q.status === k ? 'selected' : ''}>${STATUS_L[k]}</option>`).join('')}
            </select></td></tr>`).join('')}
        </tbody></table>
      </div>

      <div class="grid g2" style="gap:12px;margin-top:16px">
        <div class="card card-p">
          <strong style="font-size:15px">Agenda</strong>
          <div style="margin-top:10px">
            ${apps.length ? apps.slice(0, 6).map((a) => `<div class="line">
              <span><strong class="small">${A.esc(a.title)}</strong><br>
                <span class="small muted">${A.dateFmt(a.date)} · ${A.esc(a.time)} · ${A.esc(a.address || '')}</span></span>
              <span class="badge ${a.status === 'confirmada' ? 'badge-green' : a.status === 'cancelada' ? 'badge-red' : 'badge-amber'}">${A.esc(a.status)}</span>
            </div>`).join('') : '<p class="small muted">Sin citas registradas.</p>'}
          </div>
        </div>
        <div class="card card-p">
          <strong style="font-size:15px">Tarifas vigentes</strong>
          <p class="small muted" style="margin-top:4px">Precio base por unidad, calidad estándar.</p>
          <div style="max-height:280px;overflow:auto;margin-top:8px">
            ${A.data.SERVICES.slice(0, 14).map((s) => `<div class="line">
              <span class="small">${A.esc(s.name)}</span>
              <span class="small">${A.eur(s.base, 2)} / ${A.esc(s.unit)}</span></div>`).join('')}
          </div>
          <p class="small muted" style="margin-top:8px">Edita las tarifas en <code>js/data/services.js</code> o en la tabla <code>services</code> de Supabase.</p>
        </div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Bolsa de empleo</div>
        <div class="sec-sub">${cvs.length} candidaturas recibidas</div></div>
        <a class="link" href="#/empleo">Ver el formulario ${A.icon('chev', 14)}</a></div>
      ${cvs.length ? `<div class="tablewrap">
        <table><thead><tr>
          <th>Ref.</th><th>Fecha</th><th>Candidato</th><th>Oficio</th><th>Zona</th>
          <th>Experiencia</th><th>CV</th><th>Estado</th>
        </tr></thead><tbody>
          ${cvs.map((c) => `<tr>
            <td class="mono">${A.esc(c.ref || '—')}</td>
            <td class="muted">${A.dateFmt(c.created_at)}</td>
            <td><strong>${A.esc(c.name)}</strong><br>
              <span class="small muted">${A.esc(c.phone)} · ${A.esc(c.email)}</span></td>
            <td>${A.esc(c.trade_name || '—')}</td>
            <td class="muted">${A.esc(c.city || '—')}</td>
            <td class="muted">${A.esc(((A.data.EXPERIENCE.find((e) => e.id === c.experience)) || {}).name || '—')}</td>
            <td>${(c.cv_path || c.cv_data)
              ? `<button class="btn btn-ghost btn-sm" data-cv="${c.id}">${A.icon('download', 14)} Abrir</button>`
              : '<span class="badge badge-grey">Sin CV</span>'}</td>
            <td><select class="select" data-cvst="${c.id}" style="height:32px;font-size:12.5px;padding:0 26px 0 8px">
              ${['nueva', 'revisada', 'entrevista', 'contratada', 'descartada']
                .map((k) => `<option value="${k}" ${c.status === k ? 'selected' : ''}>${k[0].toUpperCase() + k.slice(1)}</option>`).join('')}
            </select></td></tr>
            ${c.message ? `<tr><td></td><td colspan="7" class="small muted" style="padding-top:0">
              ${A.icon('chat', 12)} ${A.esc(c.message)}
              ${c.licence ? ' · Carnet B' : ''}${c.own_vehicle ? ' · Vehículo propio' : ''}</td></tr>` : ''}`).join('')}
        </tbody></table></div>`
        : `<div class="empty" style="padding:30px 20px">${A.icon('briefcase', 36)}
            <h3>Todavía no hay candidaturas</h3>
            <p class="small">Aparecerán aquí en cuanto alguien envíe su currículum desde la app.</p></div>`}

      <div class="sec-head"><div class="sec-title">Clientes</div></div>
      <div class="tablewrap">
        <table><thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Provincia</th><th>Rol</th><th>Alta</th></tr></thead>
        <tbody>${users.map((u) => `<tr>
          <td style="font-weight:600">${A.esc(u.name)}</td><td class="muted">${A.esc(u.email)}</td>
          <td class="muted">${A.esc(u.phone || '—')}</td><td>${A.esc(u.province || '—')}</td>
          <td><span class="badge ${u.role === 'admin' ? 'badge-amber' : 'badge-grey'}">${A.esc(u.role)}</span></td>
          <td class="muted">${A.dateFmt(u.created_at)}</td></tr>`).join('')}</tbody></table>
      </div>
      <div style="height:26px"></div>
    </div>`;
  }, { title:'Administración', admin:true });
})(window.App);

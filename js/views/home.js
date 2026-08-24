/* ============================================================
   views/home.js — Inicio, servicios y empresa
   ============================================================ */
(function (A) {
  'use strict';

  /* --------- Tarjeta de proyecto reutilizable --------- */
  A.ui = A.ui || {};
  A.ui.projectCard = function (p) {
    return `<a class="card card-hover" href="#/proyecto/${p.id}" style="overflow:hidden;display:block">
      <div class="thumb"><img src="${p.afterImg || A.artwork(p.id + 'after', p.after, p.city)}" alt="${A.esc(p.title)}"></div>
      <div class="card-p" style="padding:13px">
        <div class="row" style="gap:6px;margin-bottom:6px">
          <span class="badge badge-navy">${A.esc((A.data.category(p.cat) || {}).name || '')}</span>
          <span class="small muted">${A.esc(p.city)} · ${p.year}</span>
        </div>
        <div style="font-weight:700;font-size:14.5px;line-height:1.3">${A.esc(p.title)}</div>
        <div class="between" style="margin-top:9px">
          <span class="small muted">${A.num(p.area)} m² · ${p.duration} días</span>
          <span style="font-weight:800;font-size:13.5px">${A.eur(p.budget)}</span>
        </div>
      </div></a>`;
  };

  A.ui.serviceCard = function (s) {
    const c = A.data.category(s.cat);
    return `<a class="card card-hover" href="#/presupuesto/${s.id}">
      <div class="svc">
        <div class="svc-ic" style="background:${c.color}1A;color:${c.color}">${A.icon(c.icon, 22)}</div>
        <div style="min-width:0;flex:1">
          <div class="svc-t">${A.esc(s.name)}</div>
          <div class="svc-d">${A.esc(s.desc)}</div>
          <div class="row" style="margin-top:8px;gap:8px">
            <span class="badge badge-amber">${A.t('common.from')} ${A.eur(s.minTotal)}</span>
            <span class="small muted">${s.days[0]}+ días</span>
          </div>
        </div>
        <span class="muted" style="align-self:center">${A.icon('chev', 18)}</span>
      </div></a>`;
  };

  /* ---------------- INICIO ---------------- */
  A.route('/', async () => {
    const C = A.data.COMPANY;
    const featured = A.data.PROJECTS.slice(0, 6);
    const deals = await A.api.materials.deals(3);

    A.onMount(() => {
      A.$$('[data-quick]').forEach((b) => b.addEventListener('click', () => A.go('/presupuesto/' + b.dataset.quick)));
    });

    return `
    <section class="hero">
      <div class="container">
        <div class="row" style="gap:12px;margin-bottom:14px;position:relative;z-index:1">
          <img src="${A.brand.mark256}" alt="" width="56" height="56" style="width:56px;height:56px;object-fit:contain">
          <div>
            <div class="brand-name" style="color:#fff;font-size:24px">${A.esc(C.name)}</div>
            <div class="small" style="color:rgba(255,255,255,.62);letter-spacing:.14em;text-transform:uppercase;font-weight:600;font-size:10.5px">${A.esc(C.tagline)}</div>
          </div>
        </div>
        <span class="badge" style="background:rgba(255,255,255,.14);color:#fff">${A.icon('shield', 13)} Precio cerrado · Visita técnica gratuita</span>
        <h1 style="margin-top:12px">${A.esc(A.t('home.hero.title'))}</h1>
        <p>${A.esc(A.t('home.hero.sub'))}</p>
        <div class="row wrap" style="margin-top:18px;gap:10px">
          <a class="btn btn-accent btn-lg" href="#/presupuesto">${A.icon('calc', 19)} ${A.esc(A.t('home.cta.quote'))}</a>
          <a class="btn btn-lg" style="background:rgba(255,255,255,.14);color:#fff" href="tel:${C.phone.replace(/\s/g,'')}">${A.icon('phone', 18)} ${A.esc(A.t('home.cta.call'))}</a>
        </div>
        <div class="trust">
          ${C.stats.map((s) => `<div><strong>${A.esc(s.n)}</strong><span>${A.esc(s.l)}</span></div>`).join('')}
        </div>
      </div>
    </section>

    <div class="container">
      <!-- Accesos rápidos -->
      <div class="grid g4" style="margin-top:18px">
        ${[['calc','Presupuesto','#/presupuesto'],['building','Avalúo','#/avaluo'],['sparkles','Render IA','#/render'],['search','Materiales','#/materiales']]
          .map(([ic, t, href]) => `<a class="card card-hover card-p center" href="${href}" style="padding:16px 10px">
            <div style="color:var(--primary);display:grid;place-items:center;margin-bottom:7px">${A.icon(ic, 26)}</div>
            <div style="font-weight:700;font-size:13.5px">${t}</div></a>`).join('')}
      </div>

      <!-- Servicios -->
      <div class="sec-head">
        <div><div class="sec-title">${A.esc(A.t('home.services'))}</div>
        <div class="sec-sub">${A.esc(A.t('home.services.sub'))}</div></div>
        <a class="link" href="#/servicios">Ver todos ${A.icon('chev', 14)}</a>
      </div>
      <div class="grid g3">
        ${A.data.CATEGORIES.map((c) => `<a class="card card-hover" href="#/servicios/${c.id}">
          <div class="svc">
            <div class="svc-ic" style="background:${c.color}1A;color:${c.color}">${A.icon(c.icon, 22)}</div>
            <div style="flex:1;min-width:0">
              <div class="svc-t">${A.esc(c.name)}</div>
              <div class="svc-d">${A.esc(c.desc)}</div>
              <div class="small" style="margin-top:7px;color:var(--primary);font-weight:700">
                ${A.data.servicesOf(c.id).length} especialidades</div>
            </div>
          </div></a>`).join('')}
      </div>

      <!-- Cotización rápida -->
      <div class="card card-p" style="margin-top:22px;background:linear-gradient(150deg,var(--navy-800),var(--navy-700));border:0;color:#fff">
        <div class="between wrap" style="gap:14px">
          <div style="min-width:230px;flex:1">
            <div style="font-weight:800;font-size:17px;letter-spacing:-.02em">Los 4 trabajos más pedidos</div>
            <p class="small" style="color:rgba(255,255,255,.65);margin-top:4px">Calcula el precio en menos de dos minutos.</p>
          </div>
          <div class="grid g2" style="flex:2;min-width:260px;gap:8px">
            ${['ref-bano','ref-cocina','cli-aire','add-solar'].map((id) => {
              const s = A.data.service(id);
              return `<button data-quick="${id}" class="opt" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)">
                <div class="opt-t" style="color:#fff">${A.esc(s.name)}</div>
                <div class="opt-p" style="color:#E8A33D">${A.t('common.from')} ${A.eur(s.minTotal)}</div></button>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Trabajos -->
      ${featured.length ? `<div class="sec-head">
        <div><div class="sec-title">${A.esc(A.t('home.recent'))}</div>
        <div class="sec-sub">Obras entregadas</div></div>
        <a class="link" href="#/catalogo">Ver catálogo ${A.icon('chev', 14)}</a>
      </div>
      <div class="grid g3">${featured.map(A.ui.projectCard).join('')}</div>` : ''}

      <!-- Ofertas de materiales -->
      <div class="sec-head">
        <div><div class="sec-title">Ofertas en materiales</div>
        <div class="sec-sub">Precios comparados en 5 tiendas</div></div>
        <a class="link" href="#/materiales">Comparador ${A.icon('chev', 14)}</a>
      </div>
      <div class="grid g3">
        ${deals.map((p) => `<a class="card card-hover card-p" href="#/material/${p.id}">
          <div class="row" style="gap:11px">
            <div class="thumb" style="width:64px;height:64px;aspect-ratio:auto;flex:none">
              <img src="${p.img}" alt=""></div>
            <div style="min-width:0;flex:1">
              <div class="small muted">${A.esc(p.brand)}</div>
              <div style="font-weight:600;font-size:13px;line-height:1.3;max-height:34px;overflow:hidden">${A.esc(p.name)}</div>
              <div class="pricebar" style="margin-top:5px">
                <span class="price" style="color:var(--green)">${A.eur(p.best.price, 2)}</span>
                ${p.best.discount ? `<span class="price-old">${A.eur(p.best.listPrice, 2)}</span>
                  <span class="badge badge-red">−${p.best.discount} %</span>` : ''}
              </div>
            </div>
          </div></a>`).join('')}
      </div>

      <!-- Por qué NOVA -->
      <div class="sec-head"><div><div class="sec-title">${A.esc(A.t('home.why'))}</div>
        <div class="sec-sub">Seis compromisos por escrito en cada contrato</div></div></div>
      <div class="grid g3">
        ${C.values.map((v) => `<div class="card card-p">
          <div style="color:var(--primary);margin-bottom:9px">${A.icon(v.icon, 22)}</div>
          <div style="font-weight:700;font-size:14.5px">${A.esc(v.t)}</div>
          <p class="small muted" style="margin-top:5px">${A.esc(v.d)}</p></div>`).join('')}
      </div>

      <!-- Reseñas -->
      ${A.data.REVIEWS.length ? `<div class="sec-head"><div><div class="sec-title">${A.esc(A.t('home.reviews'))}</div>
        <div class="sec-sub">Opiniones de clientes con obra entregada</div></div></div>
      <div class="carousel">
        ${A.data.REVIEWS.map((r) => `<div class="card card-p" style="width:290px">
          <div class="row" style="gap:10px">
            ${A.avatar(r.name, 38)}
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:14px">${A.esc(r.name)}</div>
              <div class="small muted">${A.esc(r.city)} · ${A.esc(r.service)}</div>
            </div>
          </div>
          <div style="margin:9px 0 6px">${A.stars(r.rating)}</div>
          <p class="small">${A.esc(r.text)}</p>
          <div class="small muted" style="margin-top:8px">${A.dateFmt(r.date)}</div>
        </div>`).join('')}
      </div>` : ''}

      <!-- CTA final -->
      <div class="card card-p center" style="margin:26px 0 10px">
        <div style="font-weight:800;font-size:18px;letter-spacing:-.02em">¿Prefieres que te llamemos?</div>
        <p class="small muted" style="margin:6px 0 14px">Visita técnica gratuita y sin compromiso en toda España.</p>
        <div class="row wrap center" style="justify-content:center;gap:9px">
          <a class="btn" href="#/citas">${A.icon('calendar', 18)} Pedir visita técnica</a>
          <a class="btn btn-wa" href="https://wa.me/${C.whatsapp.replace(/[^\d]/g,'')}" target="_blank" rel="noopener">
            ${A.icon('whatsapp', 18)} WhatsApp</a>
        </div>
      </div>
    </div>`;
  }, { title:'Inicio' });

  /* ---------------- SERVICIOS ---------------- */
  A.route('/servicios', async () => renderServices(null), { title:'Servicios' });
  A.route('/servicios/:cat', async (p) => renderServices(p.cat), { title:'Servicios' });

  function renderServices(cat) {
    const cats = A.data.CATEGORIES;
    const list = cat ? A.data.servicesOf(cat) : A.data.SERVICES;
    const c = cat ? A.data.category(cat) : null;
    return `<div class="container" style="padding-top:18px">
      <div class="sec-head" style="margin-top:0">
        <div>
          <div class="sec-title">${c ? A.esc(c.name) : 'Todos los servicios'}</div>
          <div class="sec-sub">${c ? A.esc(c.desc) : '33 especialidades con precio de referencia'}</div>
        </div>
      </div>
      <div class="chips" style="margin-bottom:14px">
        <a class="chip ${!cat ? 'sel' : ''}" href="#/servicios">${A.t('common.all')}</a>
        ${cats.map((x) => `<a class="chip ${cat === x.id ? 'sel' : ''}" href="#/servicios/${x.id}">${A.esc(x.name)}</a>`).join('')}
      </div>
      <div class="grid g3">${list.map(A.ui.serviceCard).join('')}</div>
      <div class="card card-p" style="margin-top:20px">
        <div class="row" style="gap:12px">
          <div style="color:var(--primary)">${A.icon('info', 24)}</div>
          <div>
            <div style="font-weight:700">¿No encuentras tu trabajo?</div>
            <p class="small muted" style="margin-top:4px">Escríbenos y lo valoramos a medida en 24 h.</p>
          </div>
          <a class="btn btn-soft btn-sm" style="margin-left:auto" href="#/mensajes">Consultar</a>
        </div>
      </div>
    </div>`;
  }

  /* ---------------- EMPRESA ---------------- */
  A.route('/empresa', async () => {
    const C = A.data.COMPANY;
    return `<div class="container" style="padding-top:18px">
      <div class="card" style="overflow:hidden;margin-bottom:16px">
        <div style="background:linear-gradient(150deg,var(--navy-800),var(--navy-600));padding:24px 20px;color:#fff">
          <div class="row" style="gap:14px">
            <img src="${A.brand.mark256}" alt="" style="width:64px;height:64px;object-fit:contain;flex:none">
            <div>
              <div class="brand-name" style="color:#fff;font-size:24px">${A.esc(C.name)}</div>
              <div class="small" style="color:rgba(255,255,255,.6);letter-spacing:.14em;text-transform:uppercase;font-weight:600;font-size:10.5px">${A.esc(C.tagline)}</div>
            </div>
          </div>
          <p style="color:rgba(255,255,255,.75);margin-top:12px;font-size:14.5px">${A.esc(C.claim)}</p>
          <div class="row wrap" style="gap:16px;margin-top:16px">
            ${C.stats.map((s) => `<div><div style="font-size:19px;font-weight:800">${A.esc(s.n)}</div>
              <div class="small" style="color:rgba(255,255,255,.6)">${A.esc(s.l)}</div></div>`).join('')}
          </div>
        </div>
        <div class="card-p">
          <p class="small">Vivas CR es una empresa de construcción y reformas con base en Amposta que trabaja en toda Cataluña.
          Nos ocupamos de reformas integrales de vivienda, baños y cocinas, fontanería, electricidad, climatización y
          obra menor, con un único interlocutor de principio a fin y presupuesto cerrado antes de empezar.</p>
          <div class="row wrap" style="gap:6px;margin-top:12px">
            <span class="badge badge-grey">NIF ${A.esc(C.nif)}</span>
            <span class="badge badge-grey">${A.esc(C.city)} (${A.esc(C.province)})</span>
            <span class="badge badge-navy">Alta de actividad: ${C.founded}</span>
          </div>
        </div>
      </div>

      <div class="grid g2" style="gap:12px">
        <div class="card card-p">
          <div class="row" style="gap:8px;color:var(--primary);margin-bottom:8px">${A.icon('trending', 20)}
            <strong style="font-size:15px">Misión</strong></div>
          <p class="small muted">${A.esc(C.mission)}</p>
        </div>
        <div class="card card-p">
          <div class="row" style="gap:8px;color:var(--primary);margin-bottom:8px">${A.icon('eye', 20)}
            <strong style="font-size:15px">Visión</strong></div>
          <p class="small muted">${A.esc(C.vision)}</p>
        </div>
      </div>

      <div class="sec-head"><div class="sec-title">Valores</div></div>
      <div class="grid g3">
        ${C.values.map((v) => `<div class="card card-p">
          <div style="color:var(--accent);margin-bottom:8px">${A.icon(v.icon, 20)}</div>
          <div style="font-weight:700;font-size:14px">${A.esc(v.t)}</div>
          <p class="small muted" style="margin-top:4px">${A.esc(v.d)}</p></div>`).join('')}
      </div>

      ${A.data.TEAM.length ? `<div class="sec-head"><div class="sec-title">Equipo profesional</div></div>
      <div class="grid g3">
        ${A.data.TEAM.map((m) => `<div class="card card-p">
          <div class="row" style="gap:11px">
            ${A.avatar(m.name, 46)}
            <div style="min-width:0">
              <div style="font-weight:700;font-size:14.5px">${A.esc(m.name)}</div>
              <div class="small" style="color:var(--primary);font-weight:600">${A.esc(m.role)}</div>
            </div>
          </div>
          <p class="small muted" style="margin-top:9px">${A.esc(m.bio)}</p>
          <div class="row wrap" style="gap:5px;margin-top:9px">
            ${m.tags.map((t) => `<span class="badge badge-grey">${A.esc(t)}</span>`).join('')}
          </div></div>`).join('')}
      </div>` : ''}

      ${A.data.CERTS.length ? `<div class="sec-head"><div class="sec-title">Certificaciones y licencias</div></div>
      <div class="grid g3">
        ${A.data.CERTS.map((c) => `<div class="card card-p">
          <div class="row" style="gap:9px">
            <span style="color:var(--accent)">${A.icon('award', 20)}</span>
            <div><div style="font-weight:700;font-size:14px">${A.esc(c.name)}</div>
              <div class="small muted">${A.esc(c.desc)}</div></div>
          </div>
          <div class="small muted" style="margin-top:8px">${A.esc(c.body)} · desde ${c.year}</div>
        </div>`).join('')}
      </div>` : ''}

      <div class="sec-head"><div class="sec-title">Áreas de servicio</div>
        <div class="sec-sub">Tiempo de respuesta para visita técnica</div></div>
      <div class="tablewrap">
        <table><thead><tr><th>Comunidad</th><th>Provincias</th><th>Respuesta</th></tr></thead>
        <tbody>${A.data.AREAS.map((a) => `<tr>
          <td style="font-weight:600">${A.esc(a.region)}</td>
          <td class="muted">${A.esc(a.provs.join(', '))}</td>
          <td><span class="badge badge-green">${A.esc(a.resp)}</span></td></tr>`).join('')}</tbody></table>
      </div>

      <div class="card card-p" style="margin-top:16px;border-color:var(--accent)">
        <div class="between wrap" style="gap:12px">
          <div class="row" style="gap:12px;align-items:flex-start;min-width:0">
            <span style="color:var(--accent);flex:none">${A.icon('briefcase', 22)}</span>
            <div><strong style="font-size:15px">¿Eres del oficio?</strong>
              <p class="small muted" style="margin-top:3px">Buscamos gente que trabaje bien y cumpla los plazos.
              Déjanos tu currículum y te tenemos en cuenta en la próxima obra.</p></div>
          </div>
          <a class="btn" href="#/empleo">Trabaja con nosotros</a>
        </div>
      </div>

      <div class="sec-head"><div class="sec-title">Preguntas frecuentes</div></div>
      <div class="stack">
        ${A.data.FAQ.map((f, i) => `<details class="card card-p" ${i === 0 ? 'open' : ''}>
          <summary style="font-weight:700;cursor:pointer;font-size:14.5px">${A.esc(f.q)}</summary>
          <p class="small muted" style="margin-top:9px">${A.esc(f.a)}</p></details>`).join('')}
      </div>

      <div class="sec-head"><div class="sec-title">Contacto y horario</div></div>
      <div class="grid g2" style="gap:12px">
        <div class="card card-p">
          <div class="stack" style="gap:10px">
            <div class="row" style="gap:10px">${A.icon('pin', 18)}<span class="small">${A.esc(C.address)}</span></div>
            <div class="row" style="gap:10px">${A.icon('phone', 18)}<a class="small" href="tel:${C.phone.replace(/\s/g,'')}">${A.esc(C.phone)}</a></div>
            <div class="row" style="gap:10px">${A.icon('whatsapp', 18)}<a class="small" href="https://wa.me/${C.whatsapp.replace(/[^\d]/g,'')}" target="_blank" rel="noopener">${A.esc(C.whatsapp)}</a></div>
            ${C.email ? `<div class="row" style="gap:10px">${A.icon('mail', 18)}<a class="small" href="mailto:${C.email}">${A.esc(C.email)}</a></div>` : ''}
            ${C.web ? `<div class="row" style="gap:10px">${A.icon('globe', 18)}<span class="small">${A.esc(C.web)}</span></div>` : ''}
            <div class="row" style="gap:10px">${A.icon('file-text', 18)}<span class="small">NIF ${A.esc(C.nif)}</span></div>
          </div>
          ${C.social.length ? `<hr class="divider">
          <div class="row wrap" style="gap:7px">
            ${C.social.map((s) => `<span class="badge badge-grey">${A.esc(s.name)} · ${A.esc(s.handle)}</span>`).join('')}
          </div>` : ''}
        </div>
        <div class="card card-p">
          <div style="font-weight:700;margin-bottom:9px">Horario de atención</div>
          ${C.hours.map((h) => `<div class="line"><span class="muted">${A.esc(h.d)}</span><span>${A.esc(h.h)}</span></div>`).join('')}
          <a class="btn btn-block" style="margin-top:14px" href="#/citas">${A.icon('calendar', 18)} Reservar visita</a>
        </div>
      </div>
      <div style="height:20px"></div>
    </div>`;
  }, { title:'Empresa' });
})(window.App);

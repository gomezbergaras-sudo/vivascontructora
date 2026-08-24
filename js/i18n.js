/* ============================================================
   i18n.js — Español / English
   ============================================================ */
(function (A) {
  'use strict';

  const DICT = {
    es: {
      'nav.home':'Inicio','nav.services':'Servicios','nav.catalog':'Catálogo','nav.materials':'Materiales',
      'nav.profile':'Perfil','nav.quotes':'Presupuestos','nav.valuation':'Avalúos','nav.render':'Render IA',
      'nav.appointments':'Citas','nav.messages':'Mensajes','nav.admin':'Administración','nav.company':'Empresa',
      'nav.notifications':'Notificaciones','nav.payments':'Pagos','nav.privacy':'Privacidad y RGPD',
      'common.continue':'Continuar','common.back':'Atrás','common.cancel':'Cancelar','common.save':'Guardar',
      'common.search':'Buscar','common.filter':'Filtrar','common.all':'Todos','common.from':'Desde',
      'common.total':'Total','common.download':'Descargar','common.share':'Compartir','common.send':'Enviar',
      'common.new':'Nuevo','common.details':'Ver detalle','common.close':'Cerrar','common.delete':'Eliminar',
      'common.loading':'Cargando…','common.empty':'Nada por aquí todavía','common.required':'Campo obligatorio',
      'home.hero.title':'Tu reforma, con precio cerrado',
      'home.hero.sub':'Presupuesto detallado en 2 minutos y visita técnica gratuita. Reformas, fontanería, electricidad, climatización y obra en Amposta y toda Cataluña.',
      'home.cta.quote':'Calcular presupuesto','home.cta.call':'Llamar ahora',
      'home.services':'Nuestros servicios','home.services.sub':'6 áreas · 33 especialidades',
      'home.recent':'Trabajos recientes','home.why':'Por qué Vivas CR','home.reviews':'Lo que dicen los clientes',
      'quote.title':'Presupuesto instantáneo','nav.quote':'Presupuestos','quote.step.service':'Servicio','quote.step.scope':'Alcance',
      'quote.step.quality':'Calidad','quote.step.extras':'Extras','quote.step.data':'Tus datos','quote.step.result':'Resultado',
      'quote.total':'Total estimado','quote.vat':'IVA','quote.subtotal':'Base imponible','quote.duration':'Duración estimada',
      'quote.days':'días laborables','quote.validity':'Validez de la oferta: 30 días',
      'valuation.title':'Avalúo de inmueble','catalog.title':'Trabajos realizados',
      'materials.title':'Comparador de materiales','render.title':'Render con IA',
      'auth.login':'Iniciar sesión','auth.register':'Crear cuenta','auth.logout':'Cerrar sesión'
    },
    en: {
      'nav.home':'Home','nav.services':'Services','nav.catalog':'Portfolio','nav.materials':'Materials',
      'nav.profile':'Profile','nav.quotes':'Quotes','nav.valuation':'Valuations','nav.render':'AI Render',
      'nav.appointments':'Appointments','nav.messages':'Messages','nav.admin':'Admin','nav.company':'Company',
      'nav.notifications':'Notifications','nav.payments':'Payments','nav.privacy':'Privacy & GDPR',
      'common.continue':'Continue','common.back':'Back','common.cancel':'Cancel','common.save':'Save',
      'common.search':'Search','common.filter':'Filter','common.all':'All','common.from':'From',
      'common.total':'Total','common.download':'Download','common.share':'Share','common.send':'Send',
      'common.new':'New','common.details':'View detail','common.close':'Close','common.delete':'Delete',
      'common.loading':'Loading…','common.empty':'Nothing here yet','common.required':'Required field',
      'home.hero.title':'Your renovation, at a fixed price',
      'home.hero.sub':'Detailed quote in 2 minutes and a free site visit. Renovations, plumbing, electrics, HVAC and building works in Amposta and across Catalonia.',
      'home.cta.quote':'Get a quote','home.cta.call':'Call now',
      'home.services':'Our services','home.services.sub':'6 areas · 33 specialities',
      'home.recent':'Recent work','home.why':'Why Vivas CR','home.reviews':'What clients say',
      'quote.title':'Instant quote','nav.quote':'Quotes','quote.step.service':'Service','quote.step.scope':'Scope',
      'quote.step.quality':'Quality','quote.step.extras':'Extras','quote.step.data':'Your details','quote.step.result':'Result',
      'quote.total':'Estimated total','quote.vat':'VAT','quote.subtotal':'Net amount','quote.duration':'Estimated duration',
      'quote.days':'working days','quote.validity':'Offer valid for 30 days',
      'valuation.title':'Property valuation','catalog.title':'Completed projects',
      'materials.title':'Material price comparison','render.title':'AI Render',
      'auth.login':'Sign in','auth.register':'Create account','auth.logout':'Sign out'
    }
  };

  let lang = A.store.get('nova.lang', 'es');

  function t(key) { return (DICT[lang] && DICT[lang][key]) || (DICT.es[key]) || key; }
  function setLang(l) { lang = (l === 'en' ? 'en' : 'es'); A.store.set('nova.lang', lang); document.documentElement.lang = lang; }
  function getLang() { return lang; }
  /** Elige entre dos textos según idioma activo. */
  function tt(es, en) { return lang === 'en' ? en : es; }

  document.documentElement.lang = lang;
  A.t = t; A.tt = tt; A.setLang = setLang; A.getLang = getLang;
})(window.App);

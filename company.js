/* ============================================================
   data/company.js — Datos de Vivas CR
   Todo lo que aparece en la app y en los PDF sale de aquí.
   ============================================================ */
(function (A) {
  'use strict';

  const COMPANY = {
    name:'Vivas CR',
    legalName:'Vivas CR · Construcción y Reformas',
    short:'Vivas CR',
    tagline:'Construcción y Reformas',
    claim:'Reformas con precio cerrado en toda Cataluña',
    /* NIF del titular (autónomo). Es el dato fiscal que debe figurar en
       presupuestos y facturas según el Reglamento de Facturación. */
    nif:'61235153E',
    founded:2026,
    address:'C/ Navarra 44, 1º B · 43870 Amposta (Tarragona)',
    city:'Amposta',
    province:'Tarragona',
    phone:'+34 603 437 681',
    whatsapp:'+34 603 437 681',
    email:'',            // ← pon aquí tu correo de contacto
    web:'',              // ← pon aquí tu dominio cuando lo tengas
    hours:[
      { d:'Lunes a viernes', h:'08:00 – 18:00' },
      { d:'Sábado', h:'09:00 – 14:00' },
      { d:'Domingo y festivos', h:'Cerrado · urgencias por WhatsApp' }
    ],
    social:[],           // ← añade tus perfiles: { id, name, handle }

    mission:'Que reformar deje de ser una fuente de incertidumbre: presupuesto cerrado antes de empezar, un único interlocutor y plazos que se cumplen.',
    vision:'Ser la empresa de reformas de referencia en las Terres de l’Ebre y crecer al resto de Cataluña sin perder el trato directo.',

    values:[
      { t:'Precio cerrado', d:'El presupuesto que firmas es el que pagas. Cualquier imprevisto se valora y se aprueba por escrito antes de ejecutarlo.', icon:'euro' },
      { t:'Trato directo', d:'Hablas siempre con la misma persona, de la primera visita a la entrega de la obra.', icon:'user' },
      { t:'Plazos realistas', d:'Damos la fecha que podemos cumplir, no la que suena mejor.', icon:'clock' },
      { t:'Obra limpia', d:'Protección de accesos, retirada diaria de escombros y limpieza final incluida en el precio.', icon:'sparkles' },
      { t:'Garantía legal', d:'3 años en acabados e instalaciones y 10 años en estructura e impermeabilización, conforme a la Ley de Ordenación de la Edificación.', icon:'shield' },
      { t:'Todo por escrito', d:'Presupuesto detallado por partidas, seguimiento de la obra y facturas en tu área de cliente.', icon:'file-text' }
    ],

    /* Compromisos, no historial. Sustitúyelos por cifras reales cuando las tengas. */
    stats:[
      { n:'Cataluña', l:'Zona de trabajo' },
      { n:'24 h', l:'Respuesta a tu consulta' },
      { n:'0 €', l:'Visita técnica' },
      { n:'10 años', l:'Garantía en estructura' }
    ]
  };

  /* Equipo: añade a las personas cuando quieras mostrarlas.
     Formato: { name, role, bio, tags:[] } */
  const TEAM = [];

  /* Certificaciones y licencias: añade solo las que tengas en vigor.
     Formato: { name, desc, body, year } */
  const CERTS = [];

  /* Zonas de servicio y tiempo de respuesta para la visita técnica */
  const AREAS = [
    { region:'Terres de l’Ebre', provs:['Amposta','Tortosa','Sant Carles de la Ràpita','Deltebre','Ulldecona','Alcanar','La Sénia'], resp:'24 h' },
    { region:'Baix Ebre y Montsià', provs:['L’Ampolla', 'El Perelló', 'Roquetes', 'Santa Bàrbara', 'Masdenverge'], resp:'24 h' },
    { region:'Terra Alta y Ribera d’Ebre', provs:['Gandesa','Móra d’Ebre','Flix','Batea'], resp:'48 h' },
    { region:'Tarragona y Costa Daurada', provs:['Tarragona','Reus','Cambrils','Salou','El Vendrell','Valls'], resp:'48 h' },
    { region:'Barcelona', provs:['Barcelona','Badalona','Sabadell','Terrassa','Mataró','Vilanova i la Geltrú'], resp:'72 h' },
    { region:'Girona', provs:['Girona','Figueres','Blanes','Olot','Lloret de Mar'], resp:'72 h' },
    { region:'Lleida', provs:['Lleida','Balaguer','Tàrrega','La Seu d’Urgell'], resp:'72 h' }
  ];

  const FAQ = [
    { q:'¿El presupuesto de la app es definitivo?', a:'Es una estimación calculada con nuestras tarifas reales, muy cercana al precio final. Se convierte en presupuesto cerrado tras la visita técnica gratuita, que confirma mediciones y el estado de las instalaciones.' },
    { q:'¿La visita técnica tiene coste?', a:'No. Es gratuita y sin compromiso en toda nuestra zona de trabajo. La reservas desde la app y dura entre 30 y 60 minutos.' },
    { q:'¿Cómo se paga la obra?', a:'40 % a la firma para el acopio de materiales, pagos intermedios según avance y el 10 % restante a la entrega, tras la revisión final. Aceptamos transferencia y tarjeta.' },
    { q:'¿Qué garantía tienen los trabajos?', a:'3 años en acabados e instalaciones y 10 años en estructura e impermeabilización, conforme a la Ley 38/1999 de Ordenación de la Edificación.' },
    { q:'¿Os encargáis de los permisos?', a:'Sí. Tramitamos la comunicación previa o la licencia de obra menor del ayuntamiento correspondiente y, cuando el proyecto lo requiere, coordinamos el proyecto técnico.' },
    { q:'¿Qué pasa si aparece un imprevisto en obra?', a:'Se documenta con fotos, se valora y se te envía por la app para que lo apruebes. Nada se ejecuta sin tu confirmación por escrito.' },
    { q:'¿Trabajáis fuera de Cataluña?', a:'Nuestra zona habitual es Cataluña, con base en Amposta. Para obras de mayor volumen podemos estudiar desplazamientos; consúltanos.' }
  ];

  /* Reseñas de clientes reales. Publica solo las que puedas acreditar.
     Formato: { name, city, service, rating, date, text } */
  const REVIEWS = [];

  A.data = A.data || {};
  A.data.COMPANY = COMPANY;
  A.data.TEAM = TEAM;
  A.data.CERTS = CERTS;
  A.data.AREAS = AREAS;
  A.data.FAQ = FAQ;
  A.data.REVIEWS = REVIEWS;
})(window.App);

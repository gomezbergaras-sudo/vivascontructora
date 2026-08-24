/* ============================================================
   data/jobs.js — Bolsa de empleo
   Añade o quita puestos según lo que necesites en cada momento.
   ============================================================ */
(function (A) {
  'use strict';

  /* Oficios por los que se puede presentar candidatura */
  const TRADES = [
    { id:'albanil',      name:'Albañil / oficial de 1ª' },
    { id:'fontanero',    name:'Fontanero' },
    { id:'electricista', name:'Electricista' },
    { id:'climatizacion',name:'Instalador de climatización' },
    { id:'pintor',       name:'Pintor' },
    { id:'alicatador',   name:'Alicatador / solador' },
    { id:'pladurista',   name:'Montador de pladur' },
    { id:'carpintero',   name:'Carpintero' },
    { id:'encofrador',   name:'Encofrador / ferrallista' },
    { id:'peon',         name:'Peón de obra' },
    { id:'jefe-obra',    name:'Jefe de obra / encargado' },
    { id:'tecnico',      name:'Técnico o administración' },
    { id:'otro',         name:'Otro (lo explico abajo)' }
  ];

  const EXPERIENCE = [
    { id:'sin',    name:'Sin experiencia, con ganas de aprender' },
    { id:'1-3',    name:'Entre 1 y 3 años' },
    { id:'3-8',    name:'Entre 3 y 8 años' },
    { id:'8-15',   name:'Entre 8 y 15 años' },
    { id:'15+',    name:'Más de 15 años' }
  ];

  const CONTRACT = [
    { id:'nomina',    name:'Contrato por cuenta ajena' },
    { id:'autonomo',  name:'Autónomo / subcontrata' },
    { id:'cualquiera',name:'Me da igual, lo que haya' }
  ];

  const AVAILABILITY = [
    { id:'inmediata', name:'Inmediata' },
    { id:'15dias',    name:'En 15 días' },
    { id:'1mes',      name:'En un mes' },
    { id:'consultar', name:'A consultar' }
  ];

  /* Lo que ofreces a quien entra a trabajar contigo.
     REVISA ESTAS CUATRO PROMESAS: aparecen en tu web y te comprometen. */
  const PERKS = [
    { icon:'euro',     t:'Pago puntual',   d:'Todos los días 1' },
    { icon:'pin',      t:'Obras cercanas', d:'Sin dormir fuera' },
    { icon:'shield',   t:'Alta y PRL',     d:'Todo en regla' },
    { icon:'trending', t:'Continuidad',    d:'Trabajo estable' }
  ];

  /* Texto de presentación de la bolsa de empleo */
  const PITCH = 'Buscamos gente de oficio que trabaje bien y cumpla los plazos. ' +
    'Si eres de los que dejan la obra limpia y avisan cuando algo no va, queremos conocerte.';

  /* ------------------------------------------------------------
     OFERTAS ABIERTAS — deja el array vacío si ahora mismo no
     buscas a nadie: el formulario de candidatura espontánea sigue
     funcionando igual.

     { id, title, trade, place, contract, schedule, salary,
       requirements:[], offer:[], open:true }
     ------------------------------------------------------------ */
  const VACANCIES = [];

  A.data = A.data || {};
  A.data.TRADES = TRADES;
  A.data.EXPERIENCE = EXPERIENCE;
  A.data.CONTRACT = CONTRACT;
  A.data.AVAILABILITY = AVAILABILITY;
  A.data.VACANCIES = VACANCIES;
  A.data.JOB_PERKS = PERKS;
  A.data.JOB_PITCH = PITCH;
  A.data.trade = (id) => TRADES.find((t) => t.id === id);
  A.data.vacancy = (id) => VACANCIES.find((v) => v.id === id);
})(window.App);

/* ============================================================
   data/projects.js — Catálogo de trabajos realizados
   Añade aquí tus obras. Cada una aparece en el catálogo con su
   comparativa antes/después y su ficha de detalle.
   ============================================================ */
(function (A) {
  'use strict';

  const TAGS = [
    { id:'cocinas',      name:'Cocinas',       en:'Kitchens' },
    { id:'banos',        name:'Baños',         en:'Bathrooms' },
    { id:'exteriores',   name:'Exteriores',    en:'Outdoor' },
    { id:'interiorismo', name:'Interiorismo',  en:'Interiors' },
    { id:'obra',         name:'Obra y estructura', en:'Structure' },
    { id:'instalaciones',name:'Instalaciones', en:'Systems' },
    { id:'comercial',    name:'Locales',       en:'Commercial' }
  ];

  /* ------------------------------------------------------------
     PLANTILLA — copia este bloque para cada obra terminada:

     { id:'p01',                                   // identificador único
       title:'Reforma de baño en Amposta',
       cat:'reformas',                             // fontaneria | electricidad | construccion | reformas | climatizacion | adicionales
       tags:['banos'],                             // de la lista TAGS
       city:'Amposta', year:2026,
       area:6, duration:12, budget:8400, rating:5, // m², días, € y valoración del cliente
       desc:'Descripción de la obra en dos o tres líneas.',
       before:'Baño con bañera y azulejo antiguo',  // pie de la foto ANTES
       after:'Baño con ducha de obra',              // pie de la foto DESPUÉS
       beforeImg:'assets/obras/p01-antes.jpg',      // opcional: tus fotos reales
       afterImg:'assets/obras/p01-despues.jpg',
       client:'Familia M.',                         // inicial, nunca el nombre completo
       quote:'Frase del cliente, solo si te ha autorizado a publicarla.',
       details:['Partida 1','Partida 2','Partida 3'] }
     ------------------------------------------------------------ */
  const PROJECTS = [];

  /* Vídeos de obra: { id, project, title, dur } */
  const VIDEOS = [];

  A.data = A.data || {};
  A.data.TAGS = TAGS;
  A.data.PROJECTS = PROJECTS;
  A.data.VIDEOS = VIDEOS;
  A.data.project = (id) => PROJECTS.find((p) => p.id === id);
})(window.App);

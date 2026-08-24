/* ============================================================
   data/zones.js — Valores de mercado inmobiliario (€/m²)
   Referencia orientativa por provincia y tipo de zona.
   ============================================================ */
(function (A) {
  'use strict';

  /* base = €/m² vivienda usada en estado normal, zona media de la provincia */
  const ZONES = [
    { prov:'Madrid',        base:3980, prime:7600, rentYield:4.6, trend:+6.2 },
    { prov:'Barcelona',     base:3820, prime:7100, rentYield:5.1, trend:+5.4 },
    { prov:'Baleares',      base:4150, prime:8200, rentYield:4.2, trend:+7.1 },
    { prov:'Guipúzcoa',     base:3510, prime:5400, rentYield:4.0, trend:+3.8 },
    { prov:'Vizcaya',       base:2960, prime:4700, rentYield:4.3, trend:+3.5 },
    { prov:'Málaga',        base:3120, prime:6900, rentYield:5.4, trend:+9.3 },
    { prov:'Las Palmas',    base:2340, prime:4600, rentYield:5.8, trend:+6.0 },
    { prov:'S.C. Tenerife', base:2210, prime:4300, rentYield:5.7, trend:+5.6 },
    { prov:'Navarra',       base:2180, prime:3300, rentYield:4.9, trend:+3.1 },
    { prov:'Girona',        base:2450, prime:5200, rentYield:5.0, trend:+5.9 },
    { prov:'Valencia',      base:2090, prime:4400, rentYield:6.0, trend:+8.4 },
    { prov:'Alicante',      base:2010, prime:4800, rentYield:6.2, trend:+7.8 },
    { prov:'Cantabria',     base:1950, prime:3400, rentYield:5.2, trend:+3.4 },
    { prov:'Zaragoza',      base:1820, prime:2900, rentYield:6.1, trend:+4.2 },
    { prov:'A Coruña',      base:1780, prime:3000, rentYield:5.6, trend:+3.9 },
    { prov:'Asturias',      base:1620, prime:2700, rentYield:5.9, trend:+2.8 },
    { prov:'Sevilla',       base:1890, prime:3600, rentYield:5.8, trend:+5.1 },
    { prov:'Tarragona',     base:1560, prime:3100, rentYield:6.4, trend:+5.0 },
    { prov:'Granada',       base:1610, prime:2800, rentYield:6.0, trend:+4.6 },
    { prov:'Cádiz',         base:1720, prime:3900, rentYield:5.7, trend:+5.5 },
    { prov:'Murcia',        base:1320, prime:2400, rentYield:6.6, trend:+5.2 },
    { prov:'Córdoba',       base:1350, prime:2200, rentYield:6.3, trend:+3.7 },
    { prov:'Almería',       base:1410, prime:2900, rentYield:6.5, trend:+5.8 },
    { prov:'Valladolid',    base:1590, prime:2500, rentYield:5.9, trend:+3.2 },
    { prov:'Salamanca',     base:1520, prime:2400, rentYield:5.8, trend:+2.9 },
    { prov:'Toledo',        base:1180, prime:1900, rentYield:6.4, trend:+3.6 },
    { prov:'León',          base:1140, prime:1800, rentYield:6.2, trend:+2.1 },
    { prov:'Badajoz',       base:1060, prime:1600, rentYield:6.7, trend:+2.4 },
    { prov:'Cáceres',       base:1010, prime:1550, rentYield:6.8, trend:+2.2 },
    { prov:'Otra',          base:1450, prime:2600, rentYield:6.0, trend:+3.5 }
  ];

  /* Tipo de zona dentro de la provincia */
  const AREA_TYPE = [
    { id:'centro',    name:'Centro urbano / prime',   en:'Prime city centre', factor:1.55 },
    { id:'ensanche',  name:'Ensanche consolidado',    en:'Consolidated area', factor:1.18 },
    { id:'periferia', name:'Periferia / barrio',      en:'Suburb',            factor:0.92 },
    { id:'costa',     name:'Primera línea de costa',  en:'Beachfront',        factor:1.62 },
    { id:'rural',     name:'Rural / afueras',         en:'Rural',             factor:0.62 }
  ];

  /* Tipología del inmueble */
  const PROPERTY_TYPE = [
    { id:'piso',       name:'Piso',              en:'Flat',        factor:1.00 },
    { id:'atico',      name:'Ático',             en:'Penthouse',   factor:1.22 },
    { id:'bajo',       name:'Bajo con patio',    en:'Ground floor',factor:0.90 },
    { id:'duplex',     name:'Dúplex',            en:'Duplex',      factor:1.08 },
    { id:'adosado',    name:'Adosado',           en:'Townhouse',   factor:1.05 },
    { id:'chalet',     name:'Chalet independiente', en:'Detached', factor:1.28 },
    { id:'local',      name:'Local comercial',   en:'Retail unit', factor:0.78 },
    { id:'nave',       name:'Nave industrial',   en:'Warehouse',   factor:0.45 },
    { id:'solar',      name:'Solar / terreno',   en:'Plot',        factor:0.30 }
  ];

  /* Estado de conservación */
  const CONDITION = [
    { id:'nuevo',     name:'Obra nueva / a estrenar', en:'Brand new',        factor:1.18, note:'Sin necesidad de intervención.' },
    { id:'excelente', name:'Excelente / reformado',   en:'Excellent',        factor:1.10, note:'Reforma integral reciente (<5 años).' },
    { id:'bueno',     name:'Buen estado',             en:'Good',             factor:1.00, note:'Habitable, mantenimiento al día.' },
    { id:'aceptable', name:'Aceptable',               en:'Fair',             factor:0.90, note:'Necesita actualización de acabados.' },
    { id:'reformar',  name:'A reformar',              en:'Needs renovation', factor:0.74, note:'Instalaciones obsoletas, reforma integral necesaria.' },
    { id:'ruina',     name:'Muy deteriorado',         en:'Poor',             factor:0.55, note:'Daños estructurales o abandono prolongado.' }
  ];

  /* Antigüedad: depreciación */
  function ageFactor(years) {
    if (years <= 5) return 1.06;
    if (years <= 15) return 1.00;
    if (years <= 30) return 0.93;
    if (years <= 50) return 0.86;
    if (years <= 80) return 0.80;
    return 0.76;
  }

  /* Mejoras que suman plusvalía (importe absoluto o €/m²) */
  const IMPROVEMENTS = [
    { id:'ascensor',   name:'Ascensor en el edificio',        en:'Lift in building',     type:'pct', value:0.055 },
    { id:'garaje',     name:'Plaza de garaje',                en:'Parking space',        type:'abs', value:18000 },
    { id:'trastero',   name:'Trastero',                       en:'Storage room',         type:'abs', value:6500 },
    { id:'terraza',    name:'Terraza > 10 m²',                en:'Terrace > 10 m²',      type:'pct', value:0.045 },
    { id:'piscina-c',  name:'Piscina comunitaria o privada',  en:'Swimming pool',        type:'pct', value:0.038 },
    { id:'reforma-int',name:'Reforma integral reciente',      en:'Recent full reno',     type:'pct', value:0.085 },
    { id:'aerotermia-v',name:'Aerotermia o suelo radiante',   en:'Heat pump / underfloor',type:'pct',value:0.032 },
    { id:'solar-v',    name:'Placas solares de autoconsumo',  en:'Solar panels',         type:'abs', value:7200 },
    { id:'domotica-v', name:'Domótica integral',              en:'Home automation',      type:'pct', value:0.022 },
    { id:'ventanas-v', name:'Ventanas de altas prestaciones', en:'High-performance windows',type:'pct',value:0.028 },
    { id:'vistas',     name:'Vistas despejadas / al mar',     en:'Open or sea views',    type:'pct', value:0.070 },
    { id:'orientacion',name:'Orientación sur / muy luminoso', en:'South facing',         type:'pct', value:0.030 }
  ];

  /* Penalizaciones */
  const DRAWBACKS = [
    { id:'sin-ascensor', name:'Sin ascensor (planta 3ª o superior)', en:'No lift (3rd floor+)', value:-0.075 },
    { id:'ruido',        name:'Ruido intenso (vía principal)',       en:'High noise',           value:-0.040 },
    { id:'interior',     name:'Vivienda interior / poca luz',        en:'Interior, low light',  value:-0.055 },
    { id:'cert-e',       name:'Certificación energética E, F o G',   en:'Energy rating E-G',    value:-0.035 },
    { id:'ocupada',      name:'Con inquilino u ocupación',           en:'Tenanted / occupied',  value:-0.120 },
    { id:'ite-desf',     name:'ITE desfavorable / derrama pendiente',en:'Failed building survey',value:-0.060 }
  ];

  /* Certificación energética */
  const ENERGY = ['A','B','C','D','E','F','G'];

  A.data = A.data || {};
  A.data.ZONES = ZONES;
  A.data.AREA_TYPE = AREA_TYPE;
  A.data.PROPERTY_TYPE = PROPERTY_TYPE;
  A.data.CONDITION = CONDITION;
  A.data.IMPROVEMENTS = IMPROVEMENTS;
  A.data.DRAWBACKS = DRAWBACKS;
  A.data.ENERGY = ENERGY;
  A.data.ageFactor = ageFactor;
  A.data.zone = (prov) => ZONES.find((z) => z.prov === prov) || ZONES[ZONES.length - 1];
})(window.App);

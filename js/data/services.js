/* ============================================================
   data/services.js — Catálogo de servicios y tarifas
   Precios de referencia del mercado español (base imponible,
   sin IVA). Editables desde el panel de administración.
   ============================================================ */
(function (A) {
  'use strict';

  /* Calidades transversales: multiplican el precio de materiales/acabados */
  const Q = {
    basica:   { id:'basica',   name:'Básica',   en:'Basic',    factor:0.82, desc:'Materiales de gama estándar, marcas económicas con garantía.' },
    estandar: { id:'estandar', name:'Estándar', en:'Standard', factor:1.00, desc:'Primeras marcas nacionales. La opción más contratada.' },
    premium:  { id:'premium',  name:'Premium',  en:'Premium',  factor:1.34, desc:'Gama alta, acabados de diseño y garantía ampliada.' },
    lujo:     { id:'lujo',     name:'Alta gama',en:'Luxury',   factor:1.78, desc:'Materiales exclusivos, piezas a medida y dirección de obra.' }
  };
  const QLIST = [Q.basica, Q.estandar, Q.premium, Q.lujo];

  /* Coeficiente por provincia (coste de mano de obra y logística) */
  const REGION_FACTOR = {
    'Madrid':1.16,'Barcelona':1.15,'Guipúzcoa':1.14,'Vizcaya':1.12,'Baleares':1.18,
    'Málaga':1.09,'Valencia':1.03,'Sevilla':0.98,'Alicante':0.99,'Zaragoza':0.99,
    'Murcia':0.94,'A Coruña':0.97,'Asturias':0.96,'Cantabria':1.00,'Navarra':1.06,
    'Girona':1.08,'Tarragona':1.01,'Las Palmas':1.05,'S.C. Tenerife':1.04,'Granada':0.95,
    'Córdoba':0.93,'Cádiz':0.95,'Almería':0.93,'Valladolid':0.96,'Salamanca':0.94,
    'Toledo':0.95,'Badajoz':0.90,'Cáceres':0.90,'León':0.92,'Otra':1.00
  };
  const PROVINCES = Object.keys(REGION_FACTOR);

  /* Urgencia */
  const URGENCY = [
    { id:'normal',   name:'Planificado (2-4 semanas)', en:'Planned (2-4 weeks)', factor:1.00 },
    { id:'preferente', name:'Preferente (1 semana)',   en:'Priority (1 week)',   factor:1.12 },
    { id:'urgente',  name:'Urgente (24-48 h)',         en:'Urgent (24-48 h)',    factor:1.35 }
  ];

  /* ------------------------------------------------------------
     CATEGORÍAS
     ------------------------------------------------------------ */
  const CATEGORIES = [
    { id:'fontaneria',   name:'Fontanería',    en:'Plumbing',     icon:'droplet', color:'#0EA5D9', desc:'Fugas, sanitarios, calentadores y desatascos.' },
    { id:'electricidad', name:'Electricidad',  en:'Electrical',   icon:'bolt',    color:'#E0A32B', desc:'Instalaciones, cuadros, LED, domótica y boletines.' },
    { id:'construccion', name:'Construcción',  en:'Building',     icon:'crane',   color:'#7E93A8', desc:'Obra nueva, ampliaciones, estructuras y cimentación.' },
    { id:'reformas',     name:'Reformas',      en:'Renovation',   icon:'paint',   color:'#14B67C', desc:'Cocinas, baños, suelos, pintura y carpintería.' },
    { id:'climatizacion',name:'Climatización', en:'HVAC',         icon:'wind',    color:'#3D9BEA', desc:'Aire, calefacción, aerotermia y ventilación.' },
    { id:'adicionales',  name:'Otros servicios',en:'Other',       icon:'tools',   color:'#B98555', desc:'Impermeabilización, solar, piscinas, cerrajería…' }
  ];

  /* ------------------------------------------------------------
     SERVICIOS
     unit: unidad de medida del campo cantidad
     base: precio unitario base (€ sin IVA) sobre calidad estándar
     fixed: importe fijo de desplazamiento/puesta en obra
     minTotal: importe mínimo facturable
     days: [díasFijos, díasPorUnidad]
     ------------------------------------------------------------ */
  const SERVICES = [
    /* ---------------- FONTANERÍA ---------------- */
    { id:'fon-fugas', cat:'fontaneria', name:'Reparación de fugas', en:'Leak repair',
      desc:'Localización con geófono/termografía y reparación de la fuga, incluida reposición de acabado.',
      unit:'punto', unitName:'punto de fuga', base:145, fixed:60, minTotal:120, days:[1,0.4], qty:{min:1,max:8,def:1,step:1},
      includes:['Localización no destructiva','Corte y reposición de tubería','Prueba de estanqueidad','Reposición de alicatado (hasta 0,5 m²)'],
      extras:[
        { id:'termografia', name:'Informe termográfico para seguro', price:95, type:'fixed' },
        { id:'sustitucion', name:'Sustitución de tramo completo (por m)', price:38, type:'unit' },
        { id:'guardia', name:'Servicio 24 h fin de semana', price:110, type:'fixed' }
      ] },
    { id:'fon-sanitarios', cat:'fontaneria', name:'Instalación de sanitarios', en:'Sanitary ware installation',
      desc:'Suministro y montaje de inodoro, lavabo, bidé o plato de ducha con todas las conexiones.',
      unit:'ud', unitName:'aparato', base:210, fixed:55, minTotal:180, days:[1,0.3], qty:{min:1,max:10,def:2,step:1},
      includes:['Desmontaje y retirada del antiguo','Latiguillos y llaves de escuadra nuevas','Sellado sanitario','Gestión de residuos'],
      extras:[
        { id:'cisterna', name:'Cisterna empotrada + bastidor', price:390, type:'unit' },
        { id:'grifo-term', name:'Grifería termostática', price:180, type:'unit' },
        { id:'mampara', name:'Mampara de ducha a medida', price:520, type:'fixed' }
      ] },
    { id:'fon-calentador', cat:'fontaneria', name:'Sistemas de calentadores', en:'Water heaters',
      desc:'Instalación o sustitución de termo eléctrico, calentador de gas o caldera de ACS.',
      unit:'ud', unitName:'equipo', base:420, fixed:70, minTotal:350, days:[1,0.5], qty:{min:1,max:4,def:1,step:1},
      includes:['Retirada del equipo antiguo','Adaptación de conexiones','Puesta en marcha y regulación','Certificado de instalación'],
      extras:[
        { id:'gas-cert', name:'Certificado de gas (IG-B)', price:150, type:'fixed' },
        { id:'salida-humos', name:'Adecuación de salida de humos', price:280, type:'fixed' },
        { id:'termo-bomba', name:'Upgrade a termo con bomba de calor', price:850, type:'unit' },
        { id:'mant-2a', name:'Mantenimiento 2 años incluido', price:190, type:'fixed' }
      ] },
    { id:'fon-desatasco', cat:'fontaneria', name:'Desatascos', en:'Drain unblocking',
      desc:'Desatasco con máquina de cable o camión cuba, e inspección con cámara si es necesario.',
      unit:'servicio', unitName:'intervención', base:130, fixed:45, minTotal:110, days:[1,0], qty:{min:1,max:5,def:1,step:1},
      includes:['Desatasco mecánico','Limpieza del punto de trabajo','Comprobación de evacuación'],
      extras:[
        { id:'camara', name:'Inspección con cámara + informe', price:140, type:'fixed' },
        { id:'cuba', name:'Camión cuba de alta presión', price:290, type:'fixed' },
        { id:'arqueta', name:'Limpieza de arqueta general', price:120, type:'unit' }
      ] },
    { id:'fon-general', cat:'fontaneria', name:'Fontanería general', en:'General plumbing',
      desc:'Renovación de instalación de agua fría/caliente y desagües en vivienda.',
      unit:'m2', unitName:'m² de vivienda', base:34, fixed:180, minTotal:900, days:[3,0.06], qty:{min:25,max:400,def:85,step:5},
      includes:['Tubería multicapa o PPR','Llaves de corte por estancia','Desagües en PVC insonorizado','Prueba de presión y certificado'],
      extras:[
        { id:'descalcificador', name:'Descalcificador compacto', price:980, type:'fixed' },
        { id:'recirculacion', name:'Retorno de ACS con bomba', price:640, type:'fixed' },
        { id:'contador', name:'Adecuación de batería de contadores', price:420, type:'fixed' }
      ] },

    /* ---------------- ELECTRICIDAD ---------------- */
    { id:'ele-instalacion', cat:'electricidad', name:'Instalación eléctrica completa', en:'Full electrical installation',
      desc:'Renovación integral de la instalación según REBT, con nueva canalización y cableado.',
      unit:'m2', unitName:'m² de vivienda', base:46, fixed:220, minTotal:1600, days:[4,0.07], qty:{min:25,max:500,def:90,step:5},
      includes:['Cableado libre de halógenos','Mecanismos de primera marca','Cuadro con diferenciales y magnetotérmicos','Boletín eléctrico (CIE)'],
      extras:[
        { id:'tomas-extra', name:'Puntos de luz/enchufe adicionales', price:52, type:'unit' },
        { id:'red-datos', name:'Red de datos Cat.6 por vivienda', price:690, type:'fixed' },
        { id:'sai', name:'SAI para zona técnica', price:540, type:'fixed' }
      ] },
    { id:'ele-cuadro', cat:'electricidad', name:'Cuadros eléctricos', en:'Distribution boards',
      desc:'Sustitución o ampliación del cuadro general de mando y protección.',
      unit:'ud', unitName:'cuadro', base:480, fixed:60, minTotal:390, days:[1,0.5], qty:{min:1,max:6,def:1,step:1},
      includes:['Envolvente y peine de conexión','Diferenciales superinmunizados','Etiquetado de circuitos','Medición de tierra'],
      extras:[
        { id:'proteccion-sobretension', name:'Protección contra sobretensiones', price:230, type:'unit' },
        { id:'reconectador', name:'Reconectador automático', price:195, type:'unit' },
        { id:'toma-tierra', name:'Renovación de puesta a tierra', price:380, type:'fixed' }
      ] },
    { id:'ele-led', cat:'electricidad', name:'Iluminación LED', en:'LED lighting',
      desc:'Proyecto y montaje de iluminación LED eficiente con regulación.',
      unit:'punto', unitName:'punto de luz', base:68, fixed:70, minTotal:260, days:[1,0.08], qty:{min:3,max:120,def:14,step:1},
      includes:['Luminaria LED de alta eficiencia','Driver regulable','Ajuste de temperatura de color','Retirada del material antiguo'],
      extras:[
        { id:'dali', name:'Control DALI / regulación por escenas', price:38, type:'unit' },
        { id:'tira-led', name:'Tira LED perimetral (por metro)', price:29, type:'unit' },
        { id:'estudio-luminico', name:'Estudio lumínico con simulación', price:280, type:'fixed' }
      ] },
    { id:'ele-domotica', cat:'electricidad', name:'Domótica', en:'Home automation',
      desc:'Sistema de control de iluminación, clima, persianas y accesos con app propia.',
      unit:'estancia', unitName:'estancia', base:390, fixed:280, minTotal:1200, days:[2,0.4], qty:{min:1,max:20,def:5,step:1},
      includes:['Pasarela KNX o Zigbee','Actuadores y sensores','Escenas configuradas','App móvil y formación'],
      extras:[
        { id:'voz', name:'Integración con Alexa / Google / HomeKit', price:180, type:'fixed' },
        { id:'camaras', name:'Videovigilancia (por cámara)', price:290, type:'unit' },
        { id:'cerradura', name:'Cerradura inteligente', price:420, type:'unit' },
        { id:'riego', name:'Riego automatizado', price:520, type:'fixed' }
      ] },
    { id:'ele-boletin', cat:'electricidad', name:'Certificado eléctrico (boletín)', en:'Electrical certificate',
      desc:'Inspección, mediciones y tramitación del Certificado de Instalación Eléctrica ante industria.',
      unit:'ud', unitName:'certificado', base:180, fixed:40, minTotal:150, days:[1,0.2], qty:{min:1,max:5,def:1,step:1},
      includes:['Medición de aislamiento y tierra','Verificación de protecciones','Memoria técnica','Presentación telemática'],
      extras:[
        { id:'urgente-24', name:'Tramitación urgente 24 h', price:90, type:'fixed' },
        { id:'legalizacion', name:'Legalización de local o industria', price:340, type:'fixed' }
      ] },

    /* ---------------- CONSTRUCCIÓN ---------------- */
    { id:'con-obranueva', cat:'construccion', name:'Obra nueva', en:'New build',
      desc:'Ejecución de vivienda unifamiliar llave en mano, de cimentación a acabados.',
      unit:'m2', unitName:'m² construidos', base:1180, fixed:6500, minTotal:70000, days:[90,0.9], qty:{min:60,max:600,def:140,step:5},
      includes:['Estructura y cerramientos','Cubierta e impermeabilización','Instalaciones completas','Acabados y carpinterías','Dirección facultativa'],
      extras:[
        { id:'sotano', name:'Sótano / garaje (por m²)', price:640, type:'unit' },
        { id:'piscina-on', name:'Piscina 8×4 m', price:28000, type:'fixed' },
        { id:'passivhaus', name:'Certificación Passivhaus', price:19000, type:'fixed' },
        { id:'urbanizacion', name:'Urbanización de parcela', price:14500, type:'fixed' }
      ] },
    { id:'con-ampliacion', cat:'construccion', name:'Ampliaciones', en:'Extensions',
      desc:'Ampliación de superficie habitable con licencia y refuerzo estructural.',
      unit:'m2', unitName:'m² ampliados', base:960, fixed:3800, minTotal:22000, days:[45,0.8], qty:{min:8,max:200,def:30,step:1},
      includes:['Proyecto y licencia de obra','Estructura y cerramiento','Cubierta y aislamiento','Enlace con instalaciones existentes'],
      extras:[
        { id:'porche', name:'Porche cubierto (por m²)', price:420, type:'unit' },
        { id:'buhardilla', name:'Habilitación de bajocubierta', price:9800, type:'fixed' },
        { id:'ascensor', name:'Hueco para ascensor', price:16500, type:'fixed' }
      ] },
    { id:'con-estructura', cat:'construccion', name:'Estructuras', en:'Structures',
      desc:'Refuerzo, recalce o ejecución de estructura de hormigón o metálica.',
      unit:'m2', unitName:'m² de forjado', base:210, fixed:2400, minTotal:6000, days:[15,0.35], qty:{min:10,max:400,def:60,step:5},
      includes:['Cálculo estructural firmado','Apeos y seguridad','Hormigón y armado o perfilería','Ensayos de control'],
      extras:[
        { id:'fibra-carbono', name:'Refuerzo con fibra de carbono (por m²)', price:145, type:'unit' },
        { id:'informe-patologia', name:'Informe de patología estructural', price:850, type:'fixed' },
        { id:'ite', name:'Tramitación de ITE / IEE', price:620, type:'fixed' }
      ] },
    { id:'con-cimentacion', cat:'construccion', name:'Cimentaciones', en:'Foundations',
      desc:'Zapatas, losa o micropilotaje con estudio geotécnico previo.',
      unit:'m2', unitName:'m² de cimentación', base:185, fixed:3200, minTotal:8000, days:[18,0.28], qty:{min:15,max:500,def:80,step:5},
      includes:['Excavación y transporte a vertedero','Hormigón de limpieza','Armado y hormigonado','Impermeabilización y drenaje'],
      extras:[
        { id:'geotecnico', name:'Estudio geotécnico', price:1650, type:'fixed' },
        { id:'micropilotes', name:'Micropilotaje (por unidad)', price:780, type:'unit' },
        { id:'muro-contencion', name:'Muro de contención (por m lineal)', price:295, type:'unit' }
      ] },
    { id:'con-tabiqueria', cat:'construccion', name:'Tabiquería', en:'Partition walls',
      desc:'Distribución interior con tabique de yeso laminado o cerámico.',
      unit:'m2', unitName:'m² de tabique', base:58, fixed:350, minTotal:600, days:[3,0.05], qty:{min:5,max:400,def:40,step:1},
      includes:['Perfilería o ladrillo','Aislamiento en cámara','Tratamiento de juntas','Listo para pintar'],
      extras:[
        { id:'acustico', name:'Mejora acústica (lana + doble placa)', price:22, type:'unit' },
        { id:'hidrofugo', name:'Placa hidrófuga en zonas húmedas', price:14, type:'unit' },
        { id:'puerta-corredera', name:'Armazón de puerta corredera', price:390, type:'unit' }
      ] },

    /* ---------------- REFORMAS ---------------- */
    { id:'ref-cocina', cat:'reformas', name:'Cocinas integrales', en:'Full kitchens',
      desc:'Reforma completa de cocina: obra, instalaciones, mobiliario y electrodomésticos.',
      unit:'m2', unitName:'m² de cocina', base:820, fixed:1900, minTotal:6500, days:[18,0.7], qty:{min:4,max:45,def:11,step:1},
      includes:['Demolición y retirada','Fontanería y electricidad nuevas','Alicatado y solado','Muebles altos y bajos','Encimera y fregadero','Montaje de electrodomésticos'],
      extras:[
        { id:'isla', name:'Isla central con almacenaje', price:2850, type:'fixed' },
        { id:'porcelanico', name:'Encimera porcelánica (sobrecoste)', price:1450, type:'fixed' },
        { id:'electro-pack', name:'Pack electrodomésticos A+++', price:3400, type:'fixed' },
        { id:'campana-ext', name:'Campana con extracción exterior', price:780, type:'fixed' }
      ] },
    { id:'ref-bano', cat:'reformas', name:'Baños completos', en:'Complete bathrooms',
      desc:'Reforma integral de baño con cambio de bañera por ducha, alicatado y sanitarios.',
      unit:'m2', unitName:'m² de baño', base:940, fixed:1450, minTotal:4200, days:[12,0.8], qty:{min:2,max:25,def:5,step:1},
      includes:['Demolición y escombros','Nuevas instalaciones','Impermeabilización de ducha','Alicatado y solado','Sanitarios y grifería','Mueble y espejo'],
      extras:[
        { id:'suelo-radiante-b', name:'Suelo radiante eléctrico', price:890, type:'fixed' },
        { id:'ducha-obra', name:'Plato de ducha de obra a medida', price:720, type:'fixed' },
        { id:'toallero', name:'Toallero eléctrico', price:290, type:'fixed' },
        { id:'ventilacion-b', name:'Extractor con humidostato', price:210, type:'fixed' }
      ] },
    { id:'ref-suelos', cat:'reformas', name:'Suelos y pavimentos', en:'Floors',
      desc:'Suministro y colocación de tarima, laminado, porcelánico o microcemento.',
      unit:'m2', unitName:'m² de suelo', base:52, fixed:290, minTotal:600, days:[2,0.035], qty:{min:8,max:600,def:70,step:5},
      includes:['Nivelación de base','Lámina aislante','Colocación y rodapié','Retirada del pavimento antiguo'],
      extras:[
        { id:'retirada-gres', name:'Demolición de gres existente (por m²)', price:16, type:'unit' },
        { id:'autonivelante', name:'Mortero autonivelante (por m²)', price:13, type:'unit' },
        { id:'microcemento', name:'Acabado microcemento (sobrecoste m²)', price:38, type:'unit' }
      ] },
    { id:'ref-pintura', cat:'reformas', name:'Pintura interior/exterior', en:'Painting',
      desc:'Preparación de soporte, plastecido y dos manos de pintura.',
      unit:'m2', unitName:'m² de superficie', base:11.5, fixed:150, minTotal:350, days:[2,0.012], qty:{min:20,max:2000,def:220,step:10},
      includes:['Protección de mobiliario','Lijado y plastecido','Imprimación','Dos manos de acabado'],
      extras:[
        { id:'gotele', name:'Eliminación de gotelé (por m²)', price:8.5, type:'unit' },
        { id:'esmalte', name:'Esmalte en carpintería (por m²)', price:19, type:'unit' },
        { id:'termica', name:'Pintura termoaislante fachada (por m²)', price:14, type:'unit' },
        { id:'andamio', name:'Alquiler de andamio homologado', price:680, type:'fixed' }
      ] },
    { id:'ref-carpinteria', cat:'reformas', name:'Carpintería', en:'Joinery',
      desc:'Puertas, armarios empotrados y muebles a medida en madera o lacado.',
      unit:'ud', unitName:'elemento', base:420, fixed:190, minTotal:390, days:[3,0.35], qty:{min:1,max:40,def:6,step:1},
      includes:['Toma de medidas','Fabricación a medida','Herrajes de primera marca','Montaje y ajuste'],
      extras:[
        { id:'armario-int', name:'Interior de armario equipado (por ml)', price:290, type:'unit' },
        { id:'lacado', name:'Lacado en color RAL', price:110, type:'unit' },
        { id:'corredera-c', name:'Sistema corredero empotrado', price:340, type:'unit' }
      ] },

    /* ---------------- CLIMATIZACIÓN ---------------- */
    { id:'cli-aire', cat:'climatizacion', name:'Aire acondicionado', en:'Air conditioning',
      desc:'Instalación de equipos split o multisplit inverter con garantía de fabricante.',
      unit:'ud', unitName:'split', base:780, fixed:180, minTotal:690, days:[1,0.5], qty:{min:1,max:12,def:2,step:1},
      includes:['Equipo inverter A++','Línea frigorífica aislada','Desagüe de condensados','Puesta en marcha y vacío'],
      extras:[
        { id:'conductos', name:'Sistema por conductos con rejillas', price:2400, type:'fixed' },
        { id:'wifi-clima', name:'Control WiFi por equipo', price:120, type:'unit' },
        { id:'bomba-cond', name:'Bomba de condensados', price:150, type:'unit' },
        { id:'grua', name:'Medios de elevación / grúa', price:420, type:'fixed' }
      ] },
    { id:'cli-calefaccion', cat:'climatizacion', name:'Calefacción', en:'Heating',
      desc:'Instalación de caldera de condensación y circuito de radiadores.',
      unit:'radiador', unitName:'radiador', base:290, fixed:1450, minTotal:1900, days:[3,0.3], qty:{min:2,max:30,def:7,step:1},
      includes:['Caldera de condensación','Tubería multicapa','Radiadores de aluminio','Termostato programable','Purgado y equilibrado'],
      extras:[
        { id:'suelo-radiante', name:'Suelo radiante (por m²)', price:78, type:'unit' },
        { id:'termostato-smart', name:'Termostato inteligente por zonas', price:340, type:'fixed' },
        { id:'valvulas', name:'Válvulas termostáticas', price:48, type:'unit' }
      ] },
    { id:'cli-aerotermia', cat:'climatizacion', name:'Aerotermia', en:'Air-source heat pump',
      desc:'Bomba de calor aerotérmica para calefacción, refrigeración y ACS.',
      unit:'kW', unitName:'kW de potencia', base:790, fixed:2600, minTotal:7500, days:[4,0.4], qty:{min:4,max:40,def:8,step:1},
      includes:['Unidad exterior e hidrokit','Depósito de ACS','Integración con emisores','Legalización y certificado','Tramitación de ayudas'],
      extras:[
        { id:'deposito-inercia', name:'Depósito de inercia', price:980, type:'fixed' },
        { id:'fancoil', name:'Fancoils por estancia', price:690, type:'unit' },
        { id:'monitorizacion', name:'Monitorización de consumo', price:420, type:'fixed' }
      ] },
    { id:'cli-ventilacion', cat:'climatizacion', name:'Ventilación mecánica', en:'Mechanical ventilation',
      desc:'Sistema de ventilación de doble flujo con recuperador de calor (VMC).',
      unit:'m2', unitName:'m² de vivienda', base:62, fixed:1200, minTotal:2600, days:[4,0.05], qty:{min:40,max:400,def:95,step:5},
      includes:['Recuperador de calor','Red de conductos aislados','Difusores y rejillas','Equilibrado de caudales'],
      extras:[
        { id:'filtro-hepa', name:'Filtración HEPA / antipolen', price:480, type:'fixed' },
        { id:'sensores-co2', name:'Sensores de CO₂ por zona', price:190, type:'unit' },
        { id:'silenciador', name:'Silenciadores acústicos', price:260, type:'fixed' }
      ] },
    { id:'cli-eficiencia', cat:'climatizacion', name:'Eficiencia energética', en:'Energy efficiency',
      desc:'Auditoría energética y paquete de mejoras para subir la letra del certificado.',
      unit:'m2', unitName:'m² de vivienda', base:88, fixed:900, minTotal:2400, days:[6,0.06], qty:{min:40,max:600,def:100,step:5},
      includes:['Auditoría con termografía','Certificado energético','Plan de mejoras priorizado','Tramitación de subvenciones'],
      extras:[
        { id:'ventanas', name:'Sustitución de ventanas (por m²)', price:390, type:'unit' },
        { id:'sate', name:'Aislamiento SATE fachada (por m²)', price:98, type:'unit' },
        { id:'domotica-ef', name:'Gestión energética domótica', price:1100, type:'fixed' }
      ] },

    /* ---------------- ADICIONALES ---------------- */
    { id:'add-impermeabilizacion', cat:'adicionales', name:'Impermeabilización', en:'Waterproofing',
      desc:'Tratamiento de cubiertas, terrazas y sótanos con garantía de 10 años.',
      unit:'m2', unitName:'m² a tratar', base:58, fixed:420, minTotal:900, days:[3,0.04], qty:{min:10,max:1500,def:60,step:5},
      includes:['Saneado del soporte','Imprimación','Lámina o poliurea','Refuerzo de encuentros y sumideros','Prueba de inundación'],
      extras:[
        { id:'aislamiento-cub', name:'Aislamiento térmico bajo cubierta (m²)', price:28, type:'unit' },
        { id:'grava', name:'Acabado con grava o baldosa filtrante', price:22, type:'unit' },
        { id:'garantia-15', name:'Ampliación de garantía a 15 años', price:640, type:'fixed' }
      ] },
    { id:'add-aislamiento', cat:'adicionales', name:'Aislamiento térmico/acústico', en:'Insulation',
      desc:'Insuflado en cámara, trasdosado interior o SATE en fachada.',
      unit:'m2', unitName:'m² de cerramiento', base:46, fixed:380, minTotal:750, days:[3,0.03], qty:{min:15,max:1200,def:80,step:5},
      includes:['Estudio de puentes térmicos','Material aislante certificado','Ejecución sin obra sucia (insuflado)','Informe de mejora'],
      extras:[
        { id:'acustico-ad', name:'Mejora acústica reforzada (m²)', price:24, type:'unit' },
        { id:'sate-ad', name:'Sistema SATE con acabado (m²)', price:62, type:'unit' },
        { id:'termografia-ad', name:'Termografía antes/después', price:290, type:'fixed' }
      ] },
    { id:'add-carpmetalica', cat:'adicionales', name:'Carpintería metálica', en:'Metal work',
      desc:'Rejas, barandillas, pérgolas y estructuras de acero o aluminio a medida.',
      unit:'ml', unitName:'metro lineal', base:135, fixed:260, minTotal:450, days:[4,0.12], qty:{min:2,max:120,def:12,step:1},
      includes:['Diseño y medición','Fabricación en taller','Galvanizado o lacado','Montaje con anclajes químicos'],
      extras:[
        { id:'inox', name:'Acero inoxidable AISI 316', price:78, type:'unit' },
        { id:'vidrio', name:'Vidrio laminado de seguridad (m²)', price:190, type:'unit' },
        { id:'motorizado', name:'Motorización de portón', price:1450, type:'fixed' }
      ] },
    { id:'add-cerrajeria', cat:'adicionales', name:'Cerrajería', en:'Locksmith',
      desc:'Apertura, cambio de bombín y puertas acorazadas con grado de seguridad.',
      unit:'ud', unitName:'servicio', base:110, fixed:45, minTotal:95, days:[1,0.15], qty:{min:1,max:12,def:1,step:1},
      includes:['Desplazamiento','Apertura sin daños cuando es posible','Bombín antibumping','Garantía de 2 años'],
      extras:[
        { id:'acorazada', name:'Puerta acorazada grado 4', price:1890, type:'unit' },
        { id:'24h', name:'Servicio 24 h / festivos', price:85, type:'fixed' },
        { id:'escudo', name:'Escudo protector de alta seguridad', price:120, type:'unit' }
      ] },
    { id:'add-paisajismo', cat:'adicionales', name:'Paisajismo y exteriores', en:'Landscaping',
      desc:'Diseño y ejecución de jardín, riego, iluminación y pavimentos exteriores.',
      unit:'m2', unitName:'m² de jardín', base:78, fixed:850, minTotal:1800, days:[7,0.05], qty:{min:20,max:3000,def:120,step:10},
      includes:['Proyecto paisajístico','Preparación de terreno','Plantación y césped','Riego automático por sectores'],
      extras:[
        { id:'cesped-artificial', name:'Césped artificial premium (m²)', price:34, type:'unit' },
        { id:'ilum-jardin', name:'Iluminación exterior LED', price:1250, type:'fixed' },
        { id:'pergola', name:'Pérgola bioclimática', price:5400, type:'fixed' },
        { id:'huerto', name:'Huerto urbano en bancales', price:890, type:'fixed' }
      ] },
    { id:'add-solar', cat:'adicionales', name:'Energía solar fotovoltaica', en:'Solar PV',
      desc:'Autoconsumo con paneles, inversor, legalización y tramitación de ayudas.',
      unit:'kWp', unitName:'kWp instalados', base:1150, fixed:1400, minTotal:4200, days:[3,0.6], qty:{min:2,max:60,def:5,step:1},
      includes:['Paneles con 25 años de garantía','Inversor híbrido','Estructura sobre cubierta','Legalización y compensación de excedentes','Monitorización'],
      extras:[
        { id:'bateria', name:'Batería de litio (por kWh)', price:640, type:'unit' },
        { id:'cargador-ve', name:'Cargador para vehículo eléctrico', price:1250, type:'fixed' },
        { id:'estructura-suelo', name:'Estructura en suelo o pérgola solar', price:2100, type:'fixed' }
      ] },
    { id:'add-piscinas', cat:'adicionales', name:'Piscinas y spas', en:'Pools & spas',
      desc:'Construcción de piscina de hormigón gunitado con depuración e iluminación.',
      unit:'m2', unitName:'m² de lámina de agua', base:980, fixed:6800, minTotal:18000, days:[35,0.8], qty:{min:12,max:120,def:32,step:1},
      includes:['Excavación y gunitado','Impermeabilización y acabado','Depuradora y valvulería','Iluminación LED sumergida','Coronación perimetral'],
      extras:[
        { id:'climatizada', name:'Climatización con bomba de calor', price:4800, type:'fixed' },
        { id:'sal', name:'Cloración salina', price:1650, type:'fixed' },
        { id:'cubierta-p', name:'Cubierta automática de seguridad', price:7900, type:'fixed' },
        { id:'spa', name:'Zona de spa con hidromasaje', price:6200, type:'fixed' }
      ] },
    { id:'add-mantenimiento', cat:'adicionales', name:'Mantenimiento integral', en:'Facility maintenance',
      desc:'Contrato anual de mantenimiento preventivo y correctivo para comunidades y empresas.',
      unit:'m2', unitName:'m² de superficie', base:9.5, fixed:600, minTotal:1200, days:[1,0], qty:{min:50,max:20000,def:600,step:50},
      includes:['Revisiones programadas','Mano de obra correctiva incluida','Atención en 24 h','Informe trimestral de estado'],
      extras:[
        { id:'guardia-247', name:'Guardia 24/7 con SLA de 4 h', price:1900, type:'fixed' },
        { id:'legionela', name:'Control de legionela', price:1250, type:'fixed' },
        { id:'jardineria-m', name:'Jardinería mensual', price:2400, type:'fixed' }
      ] }
  ];

  const byId = (id) => SERVICES.find((s) => s.id === id);
  const byCat = (cat) => SERVICES.filter((s) => s.cat === cat);
  const catById = (id) => CATEGORIES.find((c) => c.id === id);

  A.data = A.data || {};
  A.data.CATEGORIES = CATEGORIES;
  A.data.SERVICES = SERVICES;
  A.data.QUALITIES = QLIST;
  A.data.URGENCY = URGENCY;
  A.data.REGION_FACTOR = REGION_FACTOR;
  A.data.PROVINCES = PROVINCES;
  A.data.service = byId;
  A.data.servicesOf = byCat;
  A.data.category = catById;
})(window.App);

/* ============================================================
   data/materials.js — Catálogo de materiales y tiendas
   ============================================================ */
(function (A) {
  'use strict';

  const STORES = [
    { id:'leroy',  name:'Leroy Merlin',   short:'LM', color:'#78BE20', ship:'Recogida gratis en tienda · 48 h a domicilio' },
    { id:'brico',  name:'BricoDepôt',     short:'BD', color:'#E4002B', ship:'Retirada en almacén · portes desde 19 €' },
    { id:'bauhaus',name:'Bauhaus',        short:'BH', color:'#E30613', ship:'Entrega en 3-5 días · gratis desde 150 €' },
    { id:'amazon', name:'Amazon España',  short:'AZ', color:'#FF9900', ship:'Entrega en 24-48 h con Prime' },
    { id:'ferre',  name:'Ferretería Ortiz',short:'FO', color:'#1B4477', ship:'Profesional · entrega en obra 24 h' }
  ];

  const MCATS = [
    { id:'fontaneria', name:'Fontanería',  icon:'droplet' },
    { id:'electrico',  name:'Material eléctrico', icon:'bolt' },
    { id:'ceramica',   name:'Cerámica y pavimentos', icon:'grid' },
    { id:'pintura',    name:'Pintura', icon:'paint' },
    { id:'clima',      name:'Climatización', icon:'wind' },
    { id:'construccion',name:'Obra y áridos', icon:'crane' },
    { id:'aislamiento',name:'Aislamiento', icon:'layers' },
    { id:'herramienta',name:'Herramienta', icon:'tools' },
    { id:'jardin',     name:'Jardín y exterior', icon:'leaf' },
    { id:'iluminacion',name:'Iluminación', icon:'sun' }
  ];

  /* base = PVP de referencia (€ con IVA) · unit = unidad de venta */
  const PRODUCTS = [
    // Fontanería
    { id:'m001', cat:'fontaneria', brand:'Roca', name:'Inodoro compacto Roca Victoria salida dual', unit:'ud', base:189.00, ref:'RC-VIC-342395' },
    { id:'m002', cat:'fontaneria', brand:'Grohe', name:'Grifería termostática ducha Grohe Grohtherm 800', unit:'ud', base:229.00, ref:'GR-34558000' },
    { id:'m003', cat:'fontaneria', brand:'Wavin', name:'Tubo multicapa PE-X/Al 16 mm (rollo 50 m)', unit:'rollo', base:78.50, ref:'WV-MC16-50' },
    { id:'m004', cat:'fontaneria', brand:'Junkers', name:'Termo eléctrico 80 l Junkers Elacell', unit:'ud', base:279.00, ref:'JK-EL80' },
    { id:'m005', cat:'fontaneria', brand:'Jimten', name:'Sumidero sifónico inox 15×15 salida 50 mm', unit:'ud', base:34.90, ref:'JT-SS1515' },
    { id:'m006', cat:'fontaneria', brand:'Roca', name:'Plato de ducha resina Roca Terran 120×80', unit:'ud', base:349.00, ref:'RC-TER12080' },
    { id:'m007', cat:'fontaneria', brand:'Genebre', name:'Llave de esfera 1/2" paso total latón', unit:'ud', base:6.95, ref:'GB-3028-12' },
    { id:'m008', cat:'fontaneria', brand:'Saunier Duval', name:'Caldera condensación 24 kW Thelia Condens', unit:'ud', base:1290.00, ref:'SD-THC24' },
    // Eléctrico
    { id:'m010', cat:'electrico', brand:'Schneider', name:'Interruptor diferencial 2P 40A 30mA superinmunizado', unit:'ud', base:79.90, ref:'SE-A9R61240' },
    { id:'m011', cat:'electrico', brand:'Schneider', name:'Magnetotérmico 1P+N 16A curva C', unit:'ud', base:14.50, ref:'SE-A9K17616' },
    { id:'m012', cat:'electrico', brand:'Prysmian', name:'Cable H07Z1-K 2,5 mm² libre halógenos (100 m)', unit:'rollo', base:69.00, ref:'PR-H07Z25-100' },
    { id:'m013', cat:'electrico', brand:'Simon', name:'Mecanismo Simon 270 enchufe schuko blanco', unit:'ud', base:11.20, ref:'SM-270431-39' },
    { id:'m014', cat:'electrico', brand:'Legrand', name:'Cuadro de superficie 24 módulos con puerta', unit:'ud', base:52.00, ref:'LG-601218' },
    { id:'m015', cat:'electrico', brand:'Shelly', name:'Relé WiFi Shelly Plus 1PM domótica', unit:'ud', base:24.90, ref:'SH-PLUS1PM' },
    { id:'m016', cat:'electrico', brand:'Aiscan', name:'Tubo corrugado libre halógenos 20 mm (100 m)', unit:'rollo', base:28.90, ref:'AS-CLH20' },
    // Cerámica y pavimentos
    { id:'m020', cat:'ceramica', brand:'Porcelanosa', name:'Porcelánico Porcelanosa Rodano 44,3×44,3 (1,18 m²)', unit:'caja', base:41.90, ref:'PN-RODANO443' },
    { id:'m021', cat:'ceramica', brand:'Quick-Step', name:'Suelo laminado AC5 roble natural (2,17 m²)', unit:'caja', base:44.50, ref:'QS-AC5-ROBLE' },
    { id:'m022', cat:'ceramica', brand:'Weber', name:'Adhesivo cementoso C2TE 25 kg', unit:'saco', base:14.80, ref:'WB-C2TE25' },
    { id:'m023', cat:'ceramica', brand:'Mapei', name:'Junta cementosa Ultracolor Plus 5 kg', unit:'saco', base:18.90, ref:'MP-UCP5' },
    { id:'m024', cat:'ceramica', brand:'Tarkett', name:'Tarima maciza roble 14 mm (1,9 m²)', unit:'caja', base:112.00, ref:'TK-ROBLE14' },
    { id:'m025', cat:'ceramica', brand:'Topcret', name:'Microcemento kit 10 m² gris perla', unit:'kit', base:289.00, ref:'TC-MC10-GP' },
    // Pintura
    { id:'m030', cat:'pintura', brand:'Titanlux', name:'Pintura plástica mate blanca 15 l', unit:'bote', base:52.90, ref:'TL-PLM15' },
    { id:'m031', cat:'pintura', brand:'Bruguer', name:'Esmalte al agua satinado blanco 750 ml', unit:'bote', base:19.90, ref:'BR-ESM750' },
    { id:'m032', cat:'pintura', brand:'Valentine', name:'Imprimación selladora fijadora 5 l', unit:'bote', base:34.50, ref:'VL-IMP5' },
    { id:'m033', cat:'pintura', brand:'Beissier', name:'Masilla en pasta Aguaplast Standard 5 kg', unit:'bote', base:14.20, ref:'BS-AQP5' },
    { id:'m034', cat:'pintura', brand:'Titan', name:'Pintura fachada termoaislante 15 l', unit:'bote', base:118.00, ref:'TT-FTA15' },
    // Climatización
    { id:'m040', cat:'clima', brand:'Daikin', name:'Split Daikin Sensira 3.5 kW A++/A+', unit:'ud', base:749.00, ref:'DK-TXF35E' },
    { id:'m041', cat:'clima', brand:'Mitsubishi', name:'Multisplit 2×1 Mitsubishi MXZ-2F42VF', unit:'ud', base:1490.00, ref:'MT-MXZ2F42' },
    { id:'m042', cat:'clima', brand:'Baxi', name:'Aerotermia Baxi Platinum BC Monobloc 8 kW', unit:'ud', base:5290.00, ref:'BX-PBC8' },
    { id:'m043', cat:'clima', brand:'Ferroli', name:'Radiador aluminio 800 mm (elemento)', unit:'ud', base:18.90, ref:'FR-AL800' },
    { id:'m044', cat:'clima', brand:'Soler & Palau', name:'Recuperador de calor doble flujo 250 m³/h', unit:'ud', base:1120.00, ref:'SP-RC250' },
    { id:'m045', cat:'clima', brand:'Netatmo', name:'Termostato inteligente WiFi', unit:'ud', base:169.00, ref:'NT-NTH01' },
    // Obra
    { id:'m050', cat:'construccion', brand:'Portland', name:'Cemento CEM II 32,5 saco 25 kg', unit:'saco', base:5.45, ref:'PT-CEM25' },
    { id:'m051', cat:'construccion', brand:'Pladur', name:'Placa yeso laminado N-13 1200×2500', unit:'ud', base:9.80, ref:'PL-N13-1225' },
    { id:'m052', cat:'construccion', brand:'Pladur', name:'Perfil montante 48 mm (3 m)', unit:'ud', base:4.20, ref:'PL-M48-3' },
    { id:'m053', cat:'construccion', brand:'Sika', name:'Mortero autonivelante 25 kg', unit:'saco', base:16.90, ref:'SK-AN25' },
    { id:'m054', cat:'construccion', brand:'Hispalyt', name:'Ladrillo hueco doble 24×11,5×9 (palet 500)', unit:'palet', base:198.00, ref:'HP-LHD500' },
    { id:'m055', cat:'construccion', brand:'Sika', name:'Impermeabilizante poliuretano 25 kg', unit:'bidón', base:265.00, ref:'SK-PU25' },
    // Aislamiento
    { id:'m060', cat:'aislamiento', brand:'Isover', name:'Lana mineral Arena 45 mm (rollo 12 m²)', unit:'rollo', base:38.50, ref:'IS-AR45' },
    { id:'m061', cat:'aislamiento', brand:'Danosa', name:'Poliestireno extruido XPS 50 mm (m²)', unit:'m2', base:11.90, ref:'DN-XPS50' },
    { id:'m062', cat:'aislamiento', brand:'Knauf', name:'EPS grafito fachada SATE 100 mm (m²)', unit:'m2', base:14.60, ref:'KN-EPSG100' },
    { id:'m063', cat:'aislamiento', brand:'Danosa', name:'Lámina acústica Impactodan 5 mm (rollo 30 m²)', unit:'rollo', base:96.00, ref:'DN-IMP5' },
    // Herramienta
    { id:'m070', cat:'herramienta', brand:'Bosch', name:'Martillo perforador SDS-Plus GBH 2-26 F', unit:'ud', base:289.00, ref:'BS-GBH226F' },
    { id:'m071', cat:'herramienta', brand:'Makita', name:'Atornillador a batería 18V 2 baterías 5Ah', unit:'ud', base:239.00, ref:'MK-DHP484' },
    { id:'m072', cat:'herramienta', brand:'Stanley', name:'Nivel láser autonivelante verde 3×360°', unit:'ud', base:329.00, ref:'ST-LAS3360' },
    { id:'m073', cat:'herramienta', brand:'Rubi', name:'Cortadora de cerámica manual 90 cm', unit:'ud', base:198.00, ref:'RB-TX900' },
    // Jardín
    { id:'m080', cat:'jardin', brand:'Gardena', name:'Programador de riego automático 6 zonas', unit:'ud', base:149.00, ref:'GD-SM6' },
    { id:'m081', cat:'jardin', brand:'Verdecora', name:'Césped artificial 40 mm (m²)', unit:'m2', base:18.90, ref:'VD-CA40' },
    { id:'m082', cat:'jardin', brand:'Naterial', name:'Pérgola aluminio bioclimática 3×4 m', unit:'ud', base:2490.00, ref:'NT-PB34' },
    // Iluminación
    { id:'m090', cat:'iluminacion', brand:'Philips', name:'Downlight LED empotrable 18W 4000K', unit:'ud', base:16.90, ref:'PH-DL18' },
    { id:'m091', cat:'iluminacion', brand:'Osram', name:'Tira LED 24V 14,4W/m IP20 (5 m)', unit:'rollo', base:44.90, ref:'OS-TL24-5' },
    { id:'m092', cat:'iluminacion', brand:'Philips', name:'Kit Philips Hue White & Color 3 bombillas', unit:'kit', base:129.00, ref:'PH-HUE3' },
    { id:'m093', cat:'iluminacion', brand:'Sylvania', name:'Proyector LED exterior 50W IP65', unit:'ud', base:38.50, ref:'SY-PR50' }
  ];

  A.data = A.data || {};
  A.data.STORES = STORES;
  A.data.MCATS = MCATS;
  A.data.PRODUCTS = PRODUCTS;
  A.data.store_ = (id) => STORES.find((s) => s.id === id);
  A.data.product = (id) => PRODUCTS.find((p) => p.id === id);
})(window.App);

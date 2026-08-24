# Vivas CR · Construcción y Reformas — Aplicación móvil (PWA)

Aplicación completa para **Vivas CR**, empresa de construcción y reformas con
base en Amposta (Tarragona) que trabaja en toda Cataluña.
Funciona como **PWA instalable** en iOS, Android, tablet y escritorio, sin
frameworks ni dependencias externas: JavaScript propio, CSS propio y un
generador de PDF escrito a medida que incrusta el logotipo real.

**Datos de la empresa ya cargados** — nombre, NIF, dirección, teléfono,
zona de trabajo, horarios, valores, FAQ y logotipo.
**Pendiente de rellenar** — ver la sección 8 al final.

> © 2026 Vivas CR · Construcción y Reformas. Todos los derechos reservados.
> Este repositorio es público para poder publicar la web con GitHub Pages,
> pero el código no es libre: no se autoriza su copia, redistribución ni uso
> comercial por terceros.

---

**Web publicada:** https://gomezbergaras-sudo.github.io/vivasconstructora/

## 0. Publicación

La web se sirve directamente desde la rama `main`: en **Settings → Pages**,
*Source* = **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
No hace falta ningún proceso de construcción — la app son archivos estáticos.

Aparte, cada vez que se sube algo, GitHub Actions ejecuta
`.github/workflows/comprobar.yml`, que verifica que todos los módulos tienen
sintaxis correcta y que ningún archivo referenciado falta. Si algo se rompe,
te llega un aviso; la web publicada no depende de ello.

---

## 1. Cómo ejecutarla

**Opción rápida (un solo archivo):** abre `dist/index.html` en cualquier navegador.
Contiene toda la aplicación incrustada.

**Opción recomendada (con service worker e instalación):** sirve la carpeta por HTTP.

```bash
# con Python
python3 -m http.server 8080
# o con Node
npx serve .
```

Abre `http://localhost:8080`. En el móvil, «Añadir a pantalla de inicio» la instala
como aplicación nativa.

**Regenerar el archivo único** tras cualquier cambio:

```bash
node build.js      # produce dist/index.html
```

### Acceso de administración

| Correo | Contraseña |
|---|---|
| `admin@vivascr.es` | `vivas2026` |

**Cámbialos en cuanto entres por primera vez** (Perfil → tus datos).
Desde Administración puedes pulsar *Cargar datos de ejemplo* para ver el panel
lleno y *Borrar ejemplos* para dejarlo limpio: solo se borran los registros
marcados como ejemplo, nunca los reales.

---

## 2. Módulos incluidos

### Servicios y cotizaciones
- **6 áreas y 33 especialidades** con tarifas de referencia del mercado español (ajústalas a las tuyas).
- Asistente de **6 pasos**: servicio → alcance → calidad → extras → datos → presupuesto.
- Cálculo automático con coeficiente por **provincia** (30 provincias), nivel de
  calidad (4 gamas), urgencia, mínimo facturable y **IVA 10 % / 21 %** según el caso.
- Estimación de **plazo de ejecución** y **plan de pagos** por certificaciones.
- **PDF descargable** con desglose de partidas, condiciones y firmas.
- Envío por **email** y **WhatsApp**; historial de presupuestos con estados.

### Avalúos
- Valoración por **comparación de mercado** (método ECO/805/2003) con €/m² por
  provincia, tipo de zona, tipología, estado de conservación, antigüedad,
  certificación energética y distribución.
- **12 mejoras** que suman plusvalía y **6 penalizaciones**.
- Testigos comparables, media de zona, alquiler estimado y rentabilidad.
- Potencial tras reforma, gastos de compraventa e **informe PDF certificado**.

### Catálogo de trabajos
- Vacío de partida: añade tus obras en `js/data/projects.js` (hay una plantilla comentada).
- **Slider comparativo antes/después** con arrastre táctil y de ratón.
- Vídeos de obra, testimonios verificados y valoraciones.

### Comparador de materiales
- 53 referencias reales de fontanería, eléctrico, cerámica, pintura, clima,
  obra, aislamiento, herramienta, jardín e iluminación.
- Precios comparados en **Leroy Merlin, BricoDepôt, Bauhaus, Amazon España y
  ferretería profesional**, con stock, plazos de entrega, ofertas y ahorro.
- Filtros por categoría, tienda, rango de precio, stock y promociones.
- Historial de búsqueda, alertas de bajada de precio y **cesta que se integra en
  el presupuesto**.

### Generador de renders con IA
- Subida de foto (o cámara), estancia, **7 estilos**, **6 paletas**, **8 materiales**
  y descripción libre.
- 4 variaciones por generación, vista 360° simulada, comparativa antes/después,
  guardado, descarga, compartición y salto directo al presupuesto.

### Cuenta y gestión
- Registro y acceso, perfil con métricas, mensajería interna con respuesta
  automática, notificaciones push, agenda de citas, pasarela de pago simulada
  con 3-D Secure, y exportación/borrado de datos (RGPD).

### Panel de administración
- KPIs de contratación, cobro, conversión, ticket medio y pipeline.
- Gráfico de volumen a 6 meses y reparto por área.
- Tabla de presupuestos con cambio de estado en línea, agenda, tarifas vigentes,
  listado de clientes y **exportación a CSV**.

### Empresa
- Presentación, misión, visión, 6 valores, equipo, 8 certificaciones,
  áreas de servicio con tiempos de respuesta, FAQ, contacto, redes y horarios.

---

## 3. Requisitos técnicos cubiertos

| Requisito | Implementación |
|---|---|
| Responsive | Móvil, tablet y escritorio; navegación inferior en móvil y superior en escritorio |
| Colores corporativos | Derivados del logotipo: cian `#01C3FD`, azul `#0076D9`, azul profundo `#063C6B` y blanco |
| Modo claro/oscuro | Tokens CSS con `prefers-color-scheme` y conmutador manual |
| Iconografía | 60+ iconos SVG propios, sin fuentes externas |
| Carga rápida | Sin dependencias; service worker con caché *offline-first* |
| SEO | Meta etiquetas, Open Graph y datos estructurados `GeneralContractor` |
| iOS y Android | PWA instalable con manifest, atajos y modo standalone |
| Base de datos en tiempo real | Adaptador Supabase (Postgres + Realtime + Storage) |
| RGPD | Consentimiento versionado, política completa, exportación y borrado de datos |
| Multiidioma | Español e inglés conmutables en caliente |

---

## 4. Arquitectura

```
index.html              Punto de entrada (desarrollo)
build.js                Empaqueta todo en dist/index.html
manifest.webmanifest    Instalación PWA
sw.js                   Service worker (caché + push)
css/styles.css          Sistema de diseño completo
supabase/schema.sql     Esquema Postgres con RLS
js/
  ns.js       Espacio de nombres global
  brand.js    Logotipo incrustado y colores de marca
  config.js   Claves, integraciones y parámetros de negocio
  icons.js    Iconografía SVG
  core.js     Utilidades, formato, toast, sheets, validación
  i18n.js     Español / inglés
  engine.js   Motores de cálculo (presupuesto y avalúo)
  db.js       Capa de datos: adaptador local ↔ Supabase
  state.js    Sesión, preferencias, carrito, notificaciones
  pdf.js      Generador de PDF propio (Helvetica + WinAnsi)
  docs.js     Plantillas de presupuesto e informe de avalúo
  app.js      Shell, enrutador por hash, navegación
  data/       Servicios, zonas, empresa, proyectos, materiales
  api/        Comparador de precios y generador de renders
  views/      Pantallas de la aplicación
```

---

## 5. Conectar el backend real

### Supabase

El proyecto ya está creado: `https://bmvvjnhlqheqaniyvwd.supabase.co` (West EU, París).

1. **SQL Editor** → *New query* → pega entero `supabase/schema.sql` → **Run**.
   Crea las 9 tablas, el disparador que da de alta el perfil al registrarse,
   las políticas RLS por usuario y los dos almacenes de imágenes.
2. **Settings → API Keys** → copia la *publishable key* (`sb_publishable_…`).
3. En `index.html`, antes de `<script src="js/ns.js">`, añade el SDK:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
4. En `js/config.js` pega la clave en `supabase.anonKey`. La URL ya está puesta.

En cuanto haya claves, la app cambia sola de almacenamiento local a Supabase
**y de autenticación**: `js/auth-supabase.js` sustituye el registro y el acceso
por Supabase Auth, recupera la sesión al abrir y traduce los errores. Cada
presupuesto, avalúo, cita y mensaje queda atado a su usuario por RLS, así que
para guardar hay que haber entrado (la app lo pide sola).

**Para tu cuenta de administración:** regístrate desde la app con tu correo y
luego, en **Table Editor → profiles**, cambia tu fila a `role = admin`.

**La clave publicable puede ir en el repositorio público** — está diseñada para
viajar en el navegador y quien protege los datos es el RLS. La clave `secret` /
`service_role` no debe salir nunca de Supabase.

### Otras integraciones
Todas se activan rellenando su clave en `js/config.js`. Mientras estén vacías, la
aplicación usa su simulador interno con datos representativos.

| Integración | Campo | Notas |
|---|---|---|
| Precios de materiales | `integrations.materialsApi` | Endpoint propio o proveedor de scraping; devuelve `{items:[…]}` |
| Renders con IA | `integrations.aiRender` | Stability, Replicate u OpenAI Images |
| Pagos | `integrations.payments` | Stripe (PCI-DSS, 3-D Secure) |
| Email | `integrations.email` | Resend, SendGrid o SES |
| WhatsApp | `integrations.whatsapp` | WhatsApp Cloud API de Meta |
| Push | `integrations.push` | Clave VAPID para Web Push |

> Los comparadores de precio de tiendas requieren acuerdo comercial o API de
> afiliados con cada cadena; el código deja preparada la llamada y el mapeo.

---

## 6. Personalización

- **Tarifas**: `js/data/services.js` (o la tabla `services` en Supabase).
- **Valores de mercado para avalúos**: `js/data/zones.js`.
- **Datos de la empresa, equipo, certificaciones y reseñas**: `js/data/company.js`.
- **Obras del catálogo**: `js/data/projects.js`.
- **Logotipo y colores**: `js/brand.js` y las variables `--brand-*` de `css/styles.css`.

---

## 7. Protección de datos

En la app y en los PDF figura únicamente el **NIF** (`61235153E`), que el
Reglamento de Facturación exige en presupuestos y facturas.

**No se han incluido, y no deben incluirse, en ninguna pantalla ni documento
público:** el número de afiliación a la Seguridad Social y el identificador CEA.
Son datos internos de tu relación con la Administración; publicarlos no aporta
nada y expone información sensible.

---

## 8. Qué falta por rellenar

| Qué | Dónde | Por qué importa |
|---|---|---|
| Correo de contacto | `js/data/company.js` → `email` | Aparece en la web, en los PDF y en el envío de presupuestos |
| Dominio web | `js/data/company.js` → `web` | Cuando lo contrates |
| Correo para RGPD | `js/config.js` → `gdpr.dpoEmail` | Es el canal legal para ejercer derechos |
| Redes sociales | `js/data/company.js` → `social` | Formato `{ id, name, handle }` |
| Obras terminadas | `js/data/projects.js` | Fotos antes/después: es lo que más convence |
| Reseñas de clientes | `js/data/company.js` → `REVIEWS` | Publica solo las que puedas acreditar |
| Certificaciones y seguros | `js/data/company.js` → `CERTS` | Seguro de responsabilidad civil, instalador autorizado, etc. |
| Equipo | `js/data/company.js` → `TEAM` | Opcional; la sección se oculta si está vacía |
| Tus tarifas reales | `js/data/services.js` | Los precios actuales son de mercado, no los tuyos |

Las secciones vacías **no se muestran**: la app no enseña equipos, reseñas ni
certificaciones inventadas. Se rellenan y aparecen solas.

---

## 9. Aviso

Los precios y los valores de mercado son de referencia y sirven como punto de
partida realista; ajústalos antes de dar presupuestos en firme. Los informes de
avalúo son orientativos y no sustituyen a una tasación oficial homologada por el
Banco de España.

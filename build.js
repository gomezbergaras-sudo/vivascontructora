#!/usr/bin/env node
/* Empaqueta la app en un único archivo dist/index.html (sin dependencias). */
const fs = require('fs'), path = require('path');
const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
/* Los scripts servidos desde fuera (el SDK de Supabase) no se incrustan:
   se dejan como etiqueta para que el archivo único siga funcionando igual. */
const externos = scripts.filter((s) => /^https?:\/\//.test(s));
const locales = scripts.filter((s) => !/^https?:\/\//.test(s));
let js = locales.map((s) => `/* ===== ${s} ===== */\n` + fs.readFileSync(path.join(root, s), 'utf8')).join('\n');
// Una etiqueta de cierre de script dentro del código cortaría el bloque en línea.
js = js.replace(/<\/script>/gi, '<\\/script>');
// Comprobación de sintaxis antes de escribir nada.
try { new Function(js); } catch (e) { console.error('Error de sintaxis en el paquete:', e.message); process.exit(1); }

/* Ojo: la sustitución debe hacerse con función. Con una cadena, las
   secuencias $&, $' y $` del propio código se interpretarían como
   comodines y corromperían el resultado. */
let out = html
  .replace('<link rel="stylesheet" href="css/styles.css">', () => `<style>\n${css}\n</style>`)
  .replace(/<script src="[^"]+"><\/script>\n?/g, '')
  .replace('<!-- Núcleo -->', () =>
    externos.map((u) => `<script src="${u}"></script>`).join('\n') + `\n<script>\n${js}\n</script>`)
  .replace(/<!-- Datos -->|<!-- Lógica -->|<!-- Shell y vistas -->|<!-- SDK de Supabase[^>]*-->/g, '')
  .replace('<link rel="manifest" href="manifest.webmanifest">', '')
  /* El archivo único se abre directamente: no hay service worker que registrar. */
  .replace(/\s*if \('serviceWorker' in navigator[\s\S]*?\n  \}\n/, '\n');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), out);
console.log('dist/index.html →', (out.length / 1024).toFixed(1), 'KB');

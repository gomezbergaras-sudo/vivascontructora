/* Service worker — carga instantánea y uso sin conexión */
const CACHE = 'vivascr-v1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/styles.css',
  './js/ns.js','./js/brand.js','./js/config.js','./js/icons.js','./js/core.js','./js/i18n.js',
  './js/data/services.js','./js/data/zones.js','./js/data/company.js','./js/data/projects.js','./js/data/materials.js','./js/data/jobs.js',
  './js/engine.js','./js/db.js','./js/state.js','./js/auth-supabase.js','./js/pdf.js','./js/docs.js',
  './js/api/materials-api.js','./js/api/render-api.js','./js/app.js',
  './js/views/home.js','./js/views/quote.js','./js/views/valuation.js','./js/views/catalog.js',
  './js/views/materials.js','./js/views/render.js','./js/views/account.js','./js/views/jobs.js','./js/views/admin.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
/* Notificaciones push */
self.addEventListener('push', (e) => {
  let d = { title:'NOVA', body:'Tienes una novedad en tu obra.' };
  try { d = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, icon:'./assets/icon-192.svg', badge:'./assets/icon-192.svg', data:{ url: d.url || './' }
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || './'));
});

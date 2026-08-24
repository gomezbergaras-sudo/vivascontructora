/* ============================================================
   config.js — Configuración de la aplicación
   ============================================================ */
(function (A) {
  'use strict';

  A.config = {
    /* --- Backend ---
       Rellena estas claves y la app pasará automáticamente a Supabase
       (Postgres en tiempo real + Auth + Storage). Sin claves funciona
       en modo local con persistencia en el dispositivo. */
    supabase: {
      url: 'https://bmvvjnhlqheqaniyvwd.supabase.co',
      /* Clave publicable (sb_publishable_...). Es pública por diseño:
         quien protege los datos son las políticas RLS del esquema.
         NUNCA pongas aquí la clave secreta / service_role. */
      anonKey: 'sb_publishable_m31S3TIowKcEERYa1pFbKw_DieKpHEz'
    },

    /* --- Integraciones externas ---
       Cada servicio queda desactivado mientras no haya clave; la app
       usa entonces el simulador incorporado con datos representativos. */
    integrations: {
      materialsApi: { provider:'nova-scraper', endpoint:'', apiKey:'' },
      aiRender:     { provider:'stability',    endpoint:'', apiKey:'', model:'sd3-large' },
      payments:     { provider:'stripe',       publicKey:'' },
      email:        { provider:'resend',       apiKey:'', from:'presupuestos@novaconstruccion.es' },
      whatsapp:     { provider:'meta-cloud',   phoneId:'', token:'' },
      push:         { vapidPublicKey:'' },
      maps:         { apiKey:'' }
    },

    /* --- Negocio --- */
    business: {
      vatGeneral: 0.21,
      vatReduced: 0.10,
      quoteValidityDays: 30,
      depositPct: 0.40,
      currency: 'EUR',
      locale: 'es-ES'
    },

    /* --- RGPD --- */
    gdpr: {
      dpoEmail: '',        // ← tu correo para ejercer derechos RGPD
      retentionMonths: 60,
      consentVersion: '2026-01'
    },

    version: '1.0.0'
  };

  A.hasKey = (path) => {
    const parts = path.split('.');
    let v = A.config;
    for (const p of parts) { v = v && v[p]; }
    return !!(v && String(v).trim());
  };
})(window.App);

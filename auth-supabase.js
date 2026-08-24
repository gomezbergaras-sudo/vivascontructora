/* ============================================================
   auth-supabase.js — Autenticación real contra Supabase Auth
   Solo se activa cuando hay claves configuradas. En modo local
   la app sigue usando su autenticación propia del dispositivo.
   ============================================================ */
(function (A) {
  'use strict';

  /** Lee (o crea) la ficha de perfil asociada a la cuenta. */
  async function loadProfile(user) {
    const sb = A.db.client;
    let { data, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
    if (error || !data) {
      /* Si el disparador de la base de datos no llegó a crearla, la creamos aquí. */
      const meta = user.user_metadata || {};
      const ins = await sb.from('profiles').insert({
        id: user.id, name: meta.name || user.email.split('@')[0], email: user.email,
        phone: meta.phone || '', province: meta.province || 'Tarragona', role: 'cliente'
      }).select().single();
      data = ins.data;
    }
    return data;
  }

  async function register(d) {
    const sb = A.db.client;
    const { data, error } = await sb.auth.signUp({
      email: d.email, password: d.password,
      options: { data: { name: d.name, phone: d.phone || '', province: d.province || 'Tarragona' } }
    });
    if (error) throw new Error(traducir(error.message));
    if (!data.session) {
      /* Supabase pide confirmar el correo antes de entrar. */
      throw new Error('Cuenta creada. Revisa tu correo y confirma la dirección para poder entrar.');
    }
    A.auth.setUser(await loadProfile(data.user));
    return A.state.user;
  }

  async function login(email, password) {
    const sb = A.db.client;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(traducir(error.message));
    A.auth.setUser(await loadProfile(data.user));
    return A.state.user;
  }

  async function logout() {
    try { await A.db.client.auth.signOut(); } catch (e) {}
    A.auth.setUser(null);
  }

  /** Recupera la sesión al abrir la app (el token se refresca solo). */
  async function restore() {
    const sb = A.db.client;
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    if (data && data.session) {
      try { A.auth.setUser(await loadProfile(data.session.user)); } catch (e) {}
    } else {
      A.auth.setUser(null);
    }
    sb.auth.onAuthStateChange(async (evt, session) => {
      if (evt === 'SIGNED_OUT') A.auth.setUser(null);
      else if (session && (!A.state.user || A.state.user.id !== session.user.id)) {
        try { A.auth.setUser(await loadProfile(session.user)); } catch (e) {}
      }
    });
    return A.state.user;
  }

  /** Mensajes de error de Supabase en castellano. */
  function traducir(msg) {
    const m = String(msg || '').toLowerCase();
    if (m.indexOf('invalid login credentials') !== -1) return 'El correo o la contraseña no son correctos.';
    if (m.indexOf('user already registered') !== -1) return 'Ya existe una cuenta con ese correo.';
    if (m.indexOf('email not confirmed') !== -1) return 'Tienes que confirmar tu correo antes de entrar. Mira tu bandeja de entrada.';
    if (m.indexOf('password should be') !== -1) return 'La contraseña es demasiado corta: mínimo 6 caracteres.';
    if (m.indexOf('rate limit') !== -1) return 'Demasiados intentos. Espera un minuto y vuelve a probar.';
    return msg;
  }

  /** Sustituye la autenticación local por la de Supabase. */
  function install() {
    A.auth.register = register;
    A.auth.login = login;
    A.auth.logout = logout;
  }

  A.authSupabase = { install, restore, loadProfile };
})(window.App);

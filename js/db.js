/* ============================================================
   db.js — Capa de datos con dos adaptadores
   · LocalAdapter    : IndexedDB/localStorage (funciona sin backend)
   · SupabaseAdapter : Postgres + Auth + Storage + Realtime
   Cambia de uno a otro en config.js sin tocar el resto de la app.
   ============================================================ */
(function (A) {
  'use strict';

  const KEY = 'nova.db.v1';

  /* ---------------- Adaptador local ---------------- */
  const LocalAdapter = {
    name:'local',
    _load() {
      return A.store.get(KEY, { users:[], quotes:[], valuations:[], appointments:[],
        messages:[], notifications:[], renders:[], payments:[], searches:[], favorites:[] });
    },
    _save(db) { A.store.set(KEY, db); },

    async list(table, filter) {
      const db = this._load();
      let rows = (db[table] || []).slice();
      if (filter) rows = rows.filter((r) => Object.keys(filter).every((k) => r[k] === filter[k]));
      return rows.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    },
    async get(table, id) {
      const db = this._load();
      return (db[table] || []).find((r) => r.id === id) || null;
    },
    async insert(table, row) {
      const db = this._load();
      db[table] = db[table] || [];
      const rec = Object.assign({ id: A.uid(table.slice(0, 3)), created_at: new Date().toISOString() }, row);
      db[table].unshift(rec);
      this._save(db);
      return rec;
    },
    async update(table, id, patch) {
      const db = this._load();
      const i = (db[table] || []).findIndex((r) => r.id === id);
      if (i === -1) return null;
      db[table][i] = Object.assign({}, db[table][i], patch, { updated_at: new Date().toISOString() });
      this._save(db);
      return db[table][i];
    },
    async remove(table, id) {
      const db = this._load();
      db[table] = (db[table] || []).filter((r) => r.id !== id);
      this._save(db);
      return true;
    },
    async count(table, filter) { return (await this.list(table, filter)).length; }
  };

  /* ---------------- Adaptador Supabase ----------------
     Requiere cargar antes el SDK oficial de Supabase (una etiqueta script
     apuntando a https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2)
     y las claves en A.config.supabase. El esquema SQL está en
     /supabase/schema.sql (con políticas RLS por usuario).
     ---------------------------------------------------- */
  /* La app habla de "users"; en Postgres la tabla es "profiles",
     porque las credenciales las gestiona Supabase Auth. */
  const TABLE_ALIAS = { users:'profiles' };
  const real = (t) => TABLE_ALIAS[t] || t;

  const SupabaseAdapter = {
    name:'supabase',
    client:null,
    init(url, anonKey) {
      if (!window.supabase) { console.warn('[NOVA] SDK de Supabase no cargado; se usa el adaptador local.'); return false; }
      this.client = window.supabase.createClient(url, anonKey);
      return true;
    },
    async list(table, filter) {
      let q = this.client.from(real(table)).select('*').order('created_at', { ascending:false });
      if (filter) Object.keys(filter).forEach((k) => { q = q.eq(k, filter[k]); });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    async get(table, id) {
      const { data, error } = await this.client.from(real(table)).select('*').eq('id', id).single();
      if (error) return null;
      return data;
    },
    async insert(table, row) {
      const { data, error } = await this.client.from(real(table)).insert(row).select().single();
      if (error) throw error;
      return data;
    },
    async update(table, id, patch) {
      const { data, error } = await this.client.from(real(table)).update(patch).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async remove(table, id) {
      const { error } = await this.client.from(real(table)).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    async count(table, filter) {
      let q = this.client.from(real(table)).select('id', { count:'exact', head:true });
      if (filter) Object.keys(filter).forEach((k) => { q = q.eq(k, filter[k]); });
      const { count } = await q;
      return count || 0;
    },
    /** Suscripción en tiempo real (mensajería, estado de obra). */
    subscribe(table, cb) {
      return this.client.channel('rt-' + real(table))
        .on('postgres_changes', { event:'*', schema:'public', table: real(table) }, (p) => cb(p))
        .subscribe();
    }
  };

  /* ---------------- Selección de adaptador ---------------- */
  let active = LocalAdapter;

  function useSupabase(url, key) {
    if (SupabaseAdapter.init(url, key)) { active = SupabaseAdapter; return true; }
    return false;
  }

  A.db = {
    get adapter() { return active; },
    get client() { return active.client || null; },
    get mode() { return active.name; },
    useSupabase,
    useLocal() { active = LocalAdapter; },
    list:(t, f) => active.list(t, f),
    get:(t, id) => active.get(t, id),
    insert:(t, r) => active.insert(t, r),
    update:(t, id, p) => active.update(t, id, p),
    remove:(t, id) => active.remove(t, id),
    count:(t, f) => active.count(t, f),
    subscribe:(t, cb) => (active.subscribe ? active.subscribe(t, cb) : null),
    /** Exporta todos los datos locales (respaldo del cliente / RGPD). */
    exportAll() { return A.store.get(KEY, {}); },
    importAll(obj) { A.store.set(KEY, obj); },
    wipe() { A.store.del(KEY); }
  };
})(window.App);

-- ============================================================
-- Vivas CR · Bolsa de empleo
-- Ejecuta este bloque en el SQL Editor de Supabase si ya habías
-- creado el esquema antes de añadir el apartado de empleo.
-- Es idempotente: puedes lanzarlo más de una vez sin romper nada.
-- ============================================================

create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  ref           text unique,
  name          text not null,
  email         text not null,
  phone         text not null,
  city          text,
  trade         text,
  trade_name    text,
  vacancy       text,
  experience    text,
  contract      text,
  availability  text,
  licence       boolean default false,
  own_vehicle   boolean default false,
  message       text,
  cv_path       text,          -- objeto dentro del bucket "curriculums"
  cv_name       text,
  cv_type       text,
  status        text default 'nueva'
                check (status in ('nueva','revisada','entrevista','contratada','descartada')),
  notes         text,          -- anotaciones internas del equipo
  consent_version text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists applications_status_idx on public.applications(status, created_at desc);

alter table public.applications enable row level security;

-- Cualquiera puede presentar su candidatura, sin cuenta ni sesión.
drop policy if exists "candidatura abierta" on public.applications;
create policy "candidatura abierta" on public.applications
  for insert to anon, authenticated with check (true);

-- Solo la administración de la empresa ve y gestiona los currículums.
drop policy if exists "candidaturas solo admin"        on public.applications;
drop policy if exists "candidaturas admin actualiza"   on public.applications;
drop policy if exists "candidaturas admin borra"       on public.applications;
create policy "candidaturas solo admin"      on public.applications for select using (public.is_admin());
create policy "candidaturas admin actualiza" on public.applications for update using (public.is_admin());
create policy "candidaturas admin borra"     on public.applications for delete using (public.is_admin());

-- ---------- Almacén de currículums ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('curriculums', 'curriculums', false, 5242880,
        array['application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'image/jpeg','image/png'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = excluded.allowed_mime_types;

-- Subir sí; leer, modificar y borrar solo la administración.
drop policy if exists "cv subida abierta"  on storage.objects;
drop policy if exists "cv lectura admin"   on storage.objects;
drop policy if exists "cv gestion admin"   on storage.objects;
create policy "cv subida abierta" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'curriculums');
create policy "cv lectura admin"  on storage.objects
  for select using (bucket_id = 'curriculums' and public.is_admin());
create policy "cv gestion admin"  on storage.objects
  for delete using (bucket_id = 'curriculums' and public.is_admin());

-- ---------- Limpieza automática a los 12 meses (RGPD) ----------
-- Ejecútalo de vez en cuando, o prográmalo con pg_cron si lo activas.
create or replace function public.purgar_candidaturas_antiguas()
returns integer language plpgsql security definer set search_path = public as $$
declare borradas integer;
begin
  delete from public.applications
   where created_at < now() - interval '12 months'
     and status in ('nueva','revisada','descartada');
  get diagnostics borradas = row_count;
  return borradas;
end; $$;

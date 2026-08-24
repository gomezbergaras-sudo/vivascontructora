-- ============================================================
-- NOVA Construcción & Reformas — Esquema Supabase / PostgreSQL
-- Ejecutar en el SQL Editor del proyecto Supabase.
-- Incluye RLS por usuario y rol de administración.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Perfiles (extiende auth.users) ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  email        text not null,
  phone        text,
  province     text default 'Madrid',
  role         text not null default 'cliente' check (role in ('cliente','tecnico','admin')),
  consent      boolean default false,
  consent_version text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, phone, province)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
          new.email,
          new.raw_user_meta_data->>'phone',
          coalesce(new.raw_user_meta_data->>'province','Madrid'));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- Catálogo de tarifas (editable por administración) ----------
create table if not exists public.services (
  id          text primary key,
  category    text not null,
  name        text not null,
  description text,
  unit        text not null,
  unit_name   text,
  base_price  numeric(12,2) not null,
  fixed_price numeric(12,2) default 0,
  min_total   numeric(12,2) default 0,
  days_fixed  numeric(6,2) default 1,
  days_per_unit numeric(8,4) default 0,
  includes    jsonb default '[]'::jsonb,
  extras      jsonb default '[]'::jsonb,
  active      boolean default true,
  updated_at  timestamptz default now()
);

-- ---------- Presupuestos ----------
create table if not exists public.quotes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,
  ref           text unique not null,
  service_id    text references public.services(id),
  service_name  text,
  category      text,
  qty           numeric(12,2),
  quality       text,
  province      text,
  urgency       text,
  extras        jsonb default '[]'::jsonb,
  materials     jsonb default '[]'::jsonb,
  base          numeric(12,2),
  vat           numeric(12,2),
  total         numeric(12,2),
  days          integer,
  status        text default 'borrador'
                check (status in ('borrador','enviado','aceptado','en_obra','finalizado','rechazado')),
  client_name   text, client_email text, client_phone text, client_address text,
  notes         text,
  vivienda2anios boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists quotes_user_idx on public.quotes(user_id, created_at desc);
create index if not exists quotes_status_idx on public.quotes(status);

-- ---------- Avalúos ----------
create table if not exists public.valuations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,
  ref           text unique not null,
  address       text, province text, area_type text, property_type text,
  m2 numeric(10,2), rooms int, baths int, year int,
  condition text, energy text,
  improvements jsonb default '[]'::jsonb,
  drawbacks    jsonb default '[]'::jsonb,
  value numeric(14,2), unit numeric(12,2), rent numeric(12,2), potential numeric(14,2),
  created_at timestamptz default now()
);

-- ---------- Citas ----------
create table if not exists public.appointments (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references public.profiles(id) on delete cascade,
  quote_id  uuid references public.quotes(id) on delete set null,
  type      text default 'visita',
  title     text not null,
  date      date not null,
  time      text,
  address   text,
  notes     text,
  status    text default 'pendiente' check (status in ('pendiente','confirmada','realizada','cancelada')),
  assigned_to uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ---------- Mensajería (tiempo real) ----------
create table if not exists public.messages (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references public.profiles(id) on delete cascade,
  thread    text default 'soporte',
  sender    text not null check (sender in ('cliente','empresa')),
  text      text not null,
  read      boolean default false,
  created_at timestamptz default now()
);
create index if not exists messages_thread_idx on public.messages(user_id, thread, created_at);

-- ---------- Notificaciones ----------
create table if not exists public.notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references public.profiles(id) on delete cascade,
  title     text not null, body text, icon text default 'bell', link text,
  read      boolean default false,
  created_at timestamptz default now()
);

-- ---------- Renders IA ----------
create table if not exists public.renders (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references public.profiles(id) on delete cascade,
  room text, style text, palette text, materials jsonb, description text,
  image_path text,          -- objeto en Storage (bucket "renders")
  prompt text,
  created_at timestamptz default now()
);

-- ---------- Pagos ----------
create table if not exists public.payments (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references public.profiles(id) on delete set null,
  quote_id  uuid references public.quotes(id) on delete set null,
  amount    numeric(12,2) not null,
  method    text, concept text,
  status    text default 'completado' check (status in ('pendiente','completado','fallido','reembolsado')),
  provider_ref text,
  created_at timestamptz default now()
);

-- ---------- Proyectos del catálogo público ----------
create table if not exists public.projects (
  id text primary key,
  title text not null, category text, tags text[], city text, year int,
  area numeric(10,2), duration int, budget numeric(12,2), rating numeric(2,1),
  description text, before_image text, after_image text,
  client text, quote text, details jsonb default '[]'::jsonb,
  published boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.quotes        enable row level security;
alter table public.valuations    enable row level security;
alter table public.appointments  enable row level security;
alter table public.messages      enable row level security;
alter table public.notifications enable row level security;
alter table public.renders       enable row level security;
alter table public.payments      enable row level security;
alter table public.services      enable row level security;
alter table public.projects      enable row level security;

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Perfil propio
create policy "perfil propio lectura"  on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "perfil propio escritura" on public.profiles for update using (id = auth.uid());
create policy "perfil propio alta"     on public.profiles for insert with check (id = auth.uid());

-- Plantilla: el usuario ve y edita lo suyo; administración lo ve todo
do $$
declare t text;
begin
  foreach t in array array['quotes','valuations','appointments','messages','notifications','renders','payments']
  loop
    execute format('create policy "%1$s propios select" on public.%1$s for select using (user_id = auth.uid() or public.is_admin());', t);
    execute format('create policy "%1$s propios insert" on public.%1$s for insert with check (user_id = auth.uid());', t);
    execute format('create policy "%1$s propios update" on public.%1$s for update using (user_id = auth.uid() or public.is_admin());', t);
    execute format('create policy "%1$s propios delete" on public.%1$s for delete using (user_id = auth.uid() or public.is_admin());', t);
  end loop;
end $$;

-- Catálogo público de lectura, escritura solo administración
create policy "servicios lectura"  on public.services for select using (true);
create policy "servicios escritura" on public.services for all using (public.is_admin());
create policy "proyectos lectura"  on public.projects for select using (published = true or public.is_admin());
create policy "proyectos escritura" on public.projects for all using (public.is_admin());

-- ---------- Tiempo real ----------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.quotes;

-- ---------- Storage ----------
insert into storage.buckets (id, name, public) values ('renders','renders', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('obras','obras', true)     on conflict do nothing;

create policy "renders propios" on storage.objects for all
  using (bucket_id = 'renders' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "obras públicas" on storage.objects for select using (bucket_id = 'obras');

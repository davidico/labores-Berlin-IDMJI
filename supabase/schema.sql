-- Labores Berlín · configuración de Supabase
-- Pega todo esto en Supabase → SQL Editor → New query → Run (una sola vez).

-- 1. Tablas
create table if not exists public.members (
  email text primary key,
  person_id text not null,
  is_admin boolean not null default false,
  can_upload boolean not null default false
);
create table if not exists public.app_state (
  id text primary key,
  json text not null,
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);

-- 2. Quién es miembro (solo los correos registrados por el administrador)
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where email = lower(auth.jwt() ->> 'email'))
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where email = lower(auth.jwt() ->> 'email') and is_admin)
$$;
create or replace function public.can_upload() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where email = lower(auth.jwt() ->> 'email') and can_upload)
$$;

-- 3. Reglas de acceso
alter table public.members enable row level security;
alter table public.app_state enable row level security;
drop policy if exists "miembros leen miembros" on public.members;
drop policy if exists "admin gestiona miembros" on public.members;
drop policy if exists "miembros leen estado" on public.app_state;
drop policy if exists "miembros crean estado" on public.app_state;
drop policy if exists "miembros cambian estado" on public.app_state;
create policy "miembros leen miembros" on public.members for select to authenticated using (public.is_member());
create policy "admin gestiona miembros" on public.members for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "miembros leen estado" on public.app_state for select to authenticated using (public.is_member());
create policy "miembros crean estado" on public.app_state for insert to authenticated with check (public.is_member());
create policy "miembros cambian estado" on public.app_state for update to authenticated using (public.is_member()) with check (public.is_member());

-- 4. Cambios en vivo
do $$ begin
  alter publication supabase_realtime add table public.app_state;
exception when duplicate_object then null; end $$;

-- 5. Fichas de interpretación (PDF)
insert into storage.buckets (id, name, public) values ('fichas', 'fichas', false) on conflict (id) do nothing;
drop policy if exists "miembros leen fichas" on storage.objects;
drop policy if exists "suben fichas" on storage.objects;
drop policy if exists "borran fichas" on storage.objects;
create policy "miembros leen fichas" on storage.objects for select to authenticated using (bucket_id = 'fichas' and public.is_member());
create policy "suben fichas" on storage.objects for insert to authenticated with check (bucket_id = 'fichas' and public.can_upload());
create policy "borran fichas" on storage.objects for delete to authenticated using (bucket_id = 'fichas' and public.can_upload());

-- 6. Administrador y datos iniciales: se cargan aparte con el archivo que genera tools/make_sql.py
--    (no se guardan aquí para no dejar datos de los hermanos en el repositorio).

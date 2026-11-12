-- Labores Berlín · seguridad de los datos (versión 7.7)
-- Pegar TODO en Supabase → SQL Editor → New query → Run (una sola vez). Se puede volver a correr sin problema.
--
-- Qué hace:
--  1. Teléfono y correo pasan a una tabla privada: solo los ven el admin y la propia persona.
--  2. Cada uno ve solo su propia fila de «members» (el admin ve todas).
--  3. Cada celular solo puede registrarse para recibir los avisos de su propia cuenta.
--  4. Solo el admin puede cambiar quién es admin o pastor, las labores (roles), las asignaciones fijas,
--     qué meses están publicados, ni quitar personas. Si otra cuenta lo intenta, se rechaza.
--  5. Copia de seguridad: se guardan las últimas 150 versiones del estado (para poder recuperar si algo se borra).

-- Persona de la cuenta que está usando la app
create or replace function public.my_person_id() returns text
language sql stable security definer set search_path = public as $$
  select person_id from members where email = lower(auth.jwt() ->> 'email') limit 1
$$;

-- 1. Datos privados (teléfono y correo)
create table if not exists public.private_info (
  person_id text primary key,
  phone text not null default '',
  email text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.private_info enable row level security;
drop policy if exists "privado: leer" on public.private_info;
drop policy if exists "privado: crear" on public.private_info;
drop policy if exists "privado: cambiar" on public.private_info;
drop policy if exists "privado: borrar" on public.private_info;
create policy "privado: leer" on public.private_info for select to authenticated
  using (public.is_admin() or person_id = public.my_person_id());
create policy "privado: crear" on public.private_info for insert to authenticated
  with check (public.is_admin() or person_id = public.my_person_id());
create policy "privado: cambiar" on public.private_info for update to authenticated
  using (public.is_admin() or person_id = public.my_person_id())
  with check (public.is_admin() or person_id = public.my_person_id());
create policy "privado: borrar" on public.private_info for delete to authenticated
  using (public.is_admin());

-- 2. members: cada uno ve solo su fila; el admin, todas (la regla «admin gestiona miembros» sigue igual)
drop policy if exists "miembros leen miembros" on public.members;
create policy "miembros leen miembros" on public.members for select to authenticated
  using (email = lower(auth.jwt() ->> 'email') or public.is_admin());

-- 3. Avisos al celular: solo para la propia cuenta
drop policy if exists "miembros registran su celular" on public.push_subs;
drop policy if exists "miembros actualizan su celular" on public.push_subs;
drop policy if exists "miembros ven celulares" on public.push_subs;
drop policy if exists "miembros borran su celular" on public.push_subs;
create policy "miembros registran su celular" on public.push_subs for insert to authenticated
  with check (person_id = public.my_person_id());
create policy "miembros actualizan su celular" on public.push_subs for update to authenticated
  using (person_id = public.my_person_id()) with check (person_id = public.my_person_id());
create policy "miembros ven celulares" on public.push_subs for select to authenticated
  using (person_id = public.my_person_id() or public.is_admin());
create policy "miembros borran su celular" on public.push_subs for delete to authenticated
  using (person_id = public.my_person_id() or public.is_admin());

-- 4. Lo que solo puede cambiar el admin dentro del estado compartido
create or replace function public.state_guard_key(j jsonb) returns jsonb
language sql immutable as $$
  select jsonb_build_object(
    'people', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', p ->> 'id',
               'admin', coalesce(p ->> 'admin', 'false') = 'true',
               'pastor', coalesce(p ->> 'pastor', 'false') = 'true',
               'roles', coalesce((select jsonb_agg(r order by r) from jsonb_array_elements_text(coalesce(p -> 'roles', '[]'::jsonb)) r), '[]'::jsonb))
             order by p ->> 'id')
      from jsonb_array_elements(coalesce(j -> 'people', '[]'::jsonb)) p), '[]'::jsonb),
    'fixed', coalesce(j -> 'fixed', '{}'::jsonb),
    'published', (select coalesce(jsonb_agg(k order by k), '[]'::jsonb) from jsonb_object_keys(coalesce(j -> 'published', '{}'::jsonb)) k)
  )
$$;

create table if not exists public.app_state_history (
  id bigserial primary key,
  saved_at timestamptz not null default now(),
  version bigint,
  by_email text,
  json text not null
);
alter table public.app_state_history enable row level security;
drop policy if exists "admin ve historial" on public.app_state_history;
create policy "admin ve historial" on public.app_state_history for select to authenticated using (public.is_admin());

create or replace function public.app_state_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  claims jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
begin
  -- Copia de seguridad de la versión anterior (se guardan las últimas 150)
  insert into app_state_history(version, by_email, json) values (old.version, claims ->> 'email', old.json);
  delete from app_state_history where id <= (select max(id) - 150 from app_state_history);
  -- La función del servidor (service_role), el SQL Editor y el admin pueden cambiar todo
  if claims is null or claims ->> 'role' = 'service_role' or public.is_admin() then
    return new;
  end if;
  if public.state_guard_key(old.json::jsonb) is distinct from public.state_guard_key(new.json::jsonb) then
    raise exception 'Solo el administrador puede cambiar personas, labores, asignaciones fijas o meses publicados.'
      using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists app_state_guard on public.app_state;
create trigger app_state_guard before update on public.app_state
  for each row execute function public.app_state_guard();

-- Solo el admin puede crear la fila del estado (una sola vez, al empezar)
drop policy if exists "miembros crean estado" on public.app_state;
create policy "miembros crean estado" on public.app_state for insert to authenticated with check (public.is_admin());

-- Para recuperar una versión anterior (solo si hace falta):
--   select id, saved_at, version, by_email from app_state_history order by id desc limit 20;
--   update app_state set json = (select json from app_state_history where id = <ID>), version = version + 1 where id = 'main';

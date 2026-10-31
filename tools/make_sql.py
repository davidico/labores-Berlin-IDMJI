"""Genera supabase/setup.sql con las tablas, reglas de acceso y los datos actuales.
Uso: python3 tools/make_sql.py <estado.json> <correo_admin>"""
import json, sys, pathlib
state_file, admin_email = sys.argv[1], sys.argv[2].strip().lower()
doc = json.load(open(state_file))
state = json.loads(doc['json'] if 'json' in doc else doc)
state.pop('me', None)
for p in state['people']:
    if p['id'] == 'david' and not p.get('email'):
        p['email'] = admin_email
for coll in ('teachings', 'leipzig'):
    for t in state.get(coll, []):
        t.pop('pdf', None)  # las fichas del prototipo no existen en Supabase
data = json.dumps(state, ensure_ascii=False, separators=(',', ':'))
assert '$datos$' not in data
sql = f"""-- Labores Berlín · configuración de Supabase
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

-- 6. Administrador
insert into public.members (email, person_id, is_admin, can_upload)
values ('{admin_email}', 'david', true, true)
on conflict (email) do update set person_id = 'david', is_admin = true, can_upload = true;

-- 7. Datos actuales del prototipo (personas, horarios, reglas, mensajes)
insert into public.app_state (id, json) values ('main', $datos${data}$datos$)
on conflict (id) do update set json = excluded.json, updated_at = now();
"""
out = pathlib.Path(__file__).resolve().parent.parent / 'supabase' / 'setup.sql'
out.parent.mkdir(exist_ok=True)
out.write_text(sql)
print(out, len(sql))

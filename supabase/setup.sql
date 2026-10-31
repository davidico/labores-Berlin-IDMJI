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
values ('correo@ejemplo.com', 'david', true, true)
on conflict (email) do update set person_id = 'david', is_admin = true, can_upload = true;

-- 7. Datos actuales del prototipo (personas, horarios, reglas, mensajes)
insert into public.app_state (id, json) values ('main', $datos${"v":1,"people":[{"id":"javier","name":"Javier","sex":"M","roles":["pulpito"],"days":[0,1,2,3,4,5,6],"blocked":[],"pastor":true,"leipzig":true},{"id":"david","name":"David C.","sex":"M","roles":["pulpito","puerta","microfonos","entrega"],"days":[0,2,3,4,5,6,1],"blocked":["2026-11-02"],"admin":true,"freeAlab":true,"email":"correo@ejemplo.com"},{"id":"oswaldo","name":"Oswaldo G.","sex":"M","roles":["pulpito","puerta","sonido","ofrendas","entrega"],"days":[3,4,5,0,6,2,1],"blocked":["2026-11-03","2026-11-04","2026-11-05","2026-11-09","2026-11-11","2026-11-12","2026-11-14","2026-11-15","2026-11-20","2026-11-23","2026-11-25","2026-11-26"]},{"id":"carlos","name":"Carlos R.","sex":"M","roles":["puerta","trad_de"],"days":[0,1,2,3,4,5,6],"blocked":[],"pref":{"puerta":[0,2,5]}},{"id":"alfonso","name":"Alfonso R.","sex":"M","roles":["puerta"],"days":[0,1,2,3,4,5,6],"blocked":[],"pref":{"puerta":[2,5]}},{"id":"miguel","name":"Miguel Martinez","sex":"M","roles":["puerta","ofrendas","microfonos","entrega"],"days":[0,1,2,3,4,5,6],"blocked":["2026-11-02","2026-11-03","2026-11-05","2026-11-06","2026-11-11","2026-11-16","2026-11-18","2026-11-23","2026-11-24","2026-11-25"]},{"id":"armando","name":"Armando","sex":"M","roles":["sonido"],"days":[0,1,2,3,4,5,6],"blocked":[]},{"id":"daniel","name":"Daniel L.","sex":"M","roles":["sonido"],"days":[0,1,2,3,4,5,6],"blocked":[]},{"id":"aicardo","name":"Aicardo M.","sex":"M","roles":["ofrendas","microfonos","entrega"],"days":[0],"blocked":[]},{"id":"gabriela","name":"Gabriela C.","sex":"F","roles":["sonido","trad_en","entrega","guardar_sup"],"days":[0,5,6,4,3,2,1],"blocked":[],"admin":false,"noSlots":["en_test","de_test"],"maxOne":true,"introNotWith":"david"},{"id":"leidy","name":"Leidy O.","sex":"F","roles":["sonido","trad_en","entrega"],"days":[0,1,2,3,4,5,6],"blocked":[]},{"id":"nadia","name":"Nadia G.","sex":"F","roles":["sonido","ofrendas"],"days":[0,1,2,3,4,5,6],"blocked":[]},{"id":"valery","name":"Valery R.","sex":"F","roles":["trad_de","guardar"],"days":[0,1,2,3,4,5,6],"blocked":[],"noSlots":["de_test","en_test"]},{"id":"denisse","name":"Denisse R.","sex":"F","roles":["trad_de","entrega","guardar_sup"],"days":[0,1,2,3,4,5,6],"blocked":["2026-11-15"]},{"id":"katherine","name":"Katherine O.","sex":"F","roles":["trad_de","ofrendas","entrega"],"days":[0,1,2,3,4,5,6],"blocked":["2026-11-02","2026-11-03","2026-11-04","2026-11-06","2026-11-07","2026-11-09","2026-11-10","2026-11-11","2026-11-13","2026-11-14","2026-11-15","2026-11-16","2026-11-17","2026-11-18","2026-11-20","2026-11-21","2026-11-23","2026-11-24","2026-11-25","2026-11-27","2026-11-28","2026-11-29","2026-11-30"]},{"id":"mafe","name":"Maria Fernanda C.","sex":"F","roles":["trad_de","trad_en","entrega"],"days":[0,1,2,3,4,5,6],"blocked":["2026-11-09","2026-11-11"]},{"id":"roxana","name":"Roxana R.","sex":"F","roles":["trad_de"],"days":[0,1,2,3,4,5,6],"blocked":[],"leipzig":true,"avoidSlots":["de_intro"],"avoidDays":[4],"favorSlots":["de_pred","de_test"]},{"id":"evelyn","name":"Evelyn G.","sex":"F","roles":["ofrendas","entrega"],"days":[0,1,2,3,4,5,6],"blocked":[]},{"id":"alexandra","name":"Alexandra C.","sex":"F","roles":["ofrendas","entrega"],"days":[0],"blocked":["2026-11-08"]},{"id":"ariana","name":"Ariana P.","sex":"F","roles":["ofrendas","entrega"],"days":[0,1,2,3,4,5,6],"blocked":["2026-11-12","2026-11-26"]},{"id":"tomasa","name":"Tomasa P.","sex":"F","roles":["guardar"],"days":[0,1,2,3,4,5,6],"blocked":[]},{"id":"marion","name":"Marion D.","sex":"F","roles":["guardar"],"days":[0,1,2,3,4,5,6],"blocked":[]}],"fixed":{"sonido":{"0":"daniel","1":"leidy","2":"gabriela","3":"nadia","4":"armando","5":"armando","6":"nadia"},"puerta":{"0":"carlos"}},"teachStart":"2026-11-01","teachings":[{"id":"ek6xh4t","title":"Enseñanza 1 (ejemplo)","pdf":{"id":"a201fa4452d190faa6dbe6db64ae2dbf","name":"Labores Berlin - noviembre 2026.pdf"}},{"id":"h1a4e6q","title":"Enseñanza 2 (ejemplo)"},{"id":"tx8y3se","title":"Enseñanza 3 (ejemplo)"},{"id":"2sejaej","title":"Enseñanza 4 (ejemplo)"},{"id":"1c4wutv","title":"Enseñanza 5 (ejemplo)"},{"id":"lfttz7l","title":"Enseñanza 6 (ejemplo)"},{"id":"efxb56g","title":"Enseñanza 7 (ejemplo)"},{"id":"ocpqjtz","title":"Enseñanza 8 (ejemplo)"}],"trans":[{"id":"oupalpw","date":"2026-11-29","link":"ajja","note":""}],"leipzig":[{"id":"3xfxz7z","date":"2026-11-14","teaching":""},{"id":"9exdopf","date":"2026-11-28","teaching":""}],"schedules":{"2026-11":{"2026-11-01":{"pul":"david","sonido":"daniel","puerta":"carlos","en_pred":"leidy","en_test":"leidy","ofr1":"katherine","ofr2":"evelyn","ofr3":"alexandra","ofr4":"ariana","mic1":"david","mic2":"aicardo","de_pred":"roxana","de_test":"roxana","de_intro":"denisse","ent":"denisse","en_intro":"mafe","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-02":{"pul_ini":"javier","pul_fin":"oswaldo","sonido":"leidy","puerta":"oswaldo"},"2026-11-03":{"pul":"javier","sonido":"gabriela","puerta":"alfonso"},"2026-11-04":{"pul_fin":"javier","sonido":"nadia","puerta":"miguel","pul_ini":"david"},"2026-11-05":{"pul":"david","sonido":"armando","puerta":"david","ofr1":"ariana","ofr2":"katherine","mic1":"david","ent":"mafe","de_pred":"valery","de_test":"denisse","de_intro":"mafe","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-06":{"pul_ini":"oswaldo","pul_fin":"javier","sonido":"armando","puerta":"carlos"},"2026-11-07":{"pul":"oswaldo","sonido":"nadia","puerta":"oswaldo"},"2026-11-08":{"pul":"oswaldo","sonido":"daniel","puerta":"carlos","en_pred":"gabriela","en_test":"leidy","ofr1":"miguel","ofr2":"aicardo","ofr3":"evelyn","ofr4":"ariana","en_intro":"mafe","mic1":"david","ent":"denisse","de_pred":"roxana","de_test":"roxana","de_intro":"katherine","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-09":{"pul_fin":"javier","sonido":"leidy","puerta":"miguel","pul_ini":"david"},"2026-11-10":{"pul":"javier","sonido":"gabriela","puerta":"carlos"},"2026-11-11":{"pul_fin":"javier","sonido":"nadia","puerta":"david","pul_ini":"david"},"2026-11-12":{"sonido":"armando","puerta":"miguel","ofr1":"nadia","ofr2":"katherine","de_pred":"mafe","de_test":"mafe","de_intro":"valery","ent":"evelyn","predica":"david","pul":"javier","mic1":"miguel","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-13":{"pul_ini":"oswaldo","pul_fin":"javier","sonido":"armando","puerta":"alfonso"},"2026-11-14":{"pul":"david","sonido":"nadia","puerta":"david"},"2026-11-15":{"pul":"david","sonido":"daniel","puerta":"carlos","en_pred":"mafe","en_test":"mafe","ofr1":"alexandra","ofr2":"evelyn","ofr3":"aicardo","ofr4":"miguel","mic1":"david","de_pred":"roxana","de_test":"roxana","de_intro":"valery","ent":"ariana","en_intro":"leidy","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-16":{"pul_ini":"javier","pul_fin":"david","sonido":"leidy","puerta":"david"},"2026-11-17":{"pul":"javier","sonido":"gabriela","puerta":"alfonso"},"2026-11-18":{"pul_ini":"oswaldo","pul_fin":"javier","sonido":"nadia","puerta":"oswaldo"},"2026-11-19":{"pul":"oswaldo","sonido":"armando","puerta":"carlos","de_pred":"denisse","de_test":"denisse","ofr1":"oswaldo","ofr2":"miguel","de_intro":"katherine","mic1":"david","ent":"leidy","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-20":{"pul_ini":"david","pul_fin":"javier","sonido":"armando","puerta":"carlos"},"2026-11-21":{"pul":"oswaldo","sonido":"nadia","puerta":"oswaldo"},"2026-11-22":{"pul":"david","sonido":"daniel","puerta":"carlos","ofr1":"alexandra","ofr2":"katherine","ofr3":"evelyn","ofr4":"ariana","mic1":"miguel","mic2":"aicardo","ent":"denisse","de_pred":"roxana","de_test":"roxana","en_intro":"mafe","en_pred":"gabriela","en_test":"leidy","de_intro":"valery","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-23":{"pul_ini":"javier","sonido":"leidy","puerta":"david","pul_fin":"david"},"2026-11-24":{"pul":"javier","sonido":"gabriela","puerta":"carlos"},"2026-11-25":{"pul_fin":"javier","sonido":"nadia","puerta":"david","pul_ini":"david"},"2026-11-26":{"sonido":"armando","puerta":"miguel","ofr1":"katherine","ofr2":"evelyn","de_pred":"carlos","de_test":"carlos","de_intro":"katherine","ent":"mafe","predica":"david","pul":"javier","mic1":"miguel","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-27":{"pul_ini":"oswaldo","pul_fin":"javier","sonido":"armando","puerta":"alfonso"},"2026-11-28":{"pul":"david","sonido":"nadia","puerta":"david"},"2026-11-29":{"pul":"oswaldo","sonido":"daniel","puerta":"carlos","en_pred":"leidy","en_test":"leidy","ofr1":"alexandra","ofr2":"ariana","ofr3":"oswaldo","ofr4":"aicardo","en_intro":"gabriela","mic1":"miguel","mic2":"david","de_pred":"roxana","de_test":"roxana","de_intro":"denisse","ent":"evelyn","grd1":"tomasa","grd2":"marion","grd3":"valery"},"2026-11-30":{"pul_ini":"oswaldo","sonido":"leidy","puerta":"miguel","pul_fin":"javier"}}},"adminFix":1,"entFix":1,"reqs":[],"notifs":[],"msgs":[],"novFix":1,"davidFix":1,"davidFix2":1,"leipFix":1,"roxFix":1,"leipThuRule":1,"ruleFix3":1,"grdFix":1,"lateFix":1,"phoneFix":1,"meets":[]}$datos$)
on conflict (id) do update set json = excluded.json, updated_at = now();

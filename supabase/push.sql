-- Labores Berlín · notificaciones al celular
-- Pegar en Supabase → SQL Editor → New query → Run (una sola vez), con CRON_SECRET reemplazado.

-- 1. Celulares registrados para recibir avisos
create table if not exists public.push_subs (
  endpoint text primary key,
  person_id text not null,
  sub jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists "miembros registran su celular" on public.push_subs;
drop policy if exists "miembros actualizan su celular" on public.push_subs;
drop policy if exists "miembros ven celulares" on public.push_subs;
create policy "miembros registran su celular" on public.push_subs for insert to authenticated with check (public.is_member());
create policy "miembros actualizan su celular" on public.push_subs for update to authenticated using (public.is_member()) with check (public.is_member());
create policy "miembros ven celulares" on public.push_subs for select to authenticated using (public.is_member());

-- 2. Recordatorio de la noche antes: la función revisa cada hora y envía a las 20:00 de Berlín
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('labores-recordatorios') where exists (select 1 from cron.job where jobname = 'labores-recordatorios');
select cron.schedule(
  'labores-recordatorios',
  '0 * * * *',
  $$ select net.http_post(
       url := 'https://hooqurezzjbzcgjtuqnn.supabase.co/functions/v1/push',
       headers := '{"Content-Type":"application/json","x-cron-secret":"CRON_SECRET"}'::jsonb,
       body := '{"mode":"daily"}'::jsonb
     ) $$
);

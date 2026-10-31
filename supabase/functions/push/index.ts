// Función "push" de Supabase: envía notificaciones al celular.
// - mode "send": la app avisa a ciertas personas (solo miembros registrados pueden usarla).
// - mode "daily": recordatorio de la noche antes (lo llama la tarea programada cada hora; envía una sola vez por día, a las 20:00 de Berlín).
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';

function secretKey(): string {
  // Proyectos nuevos usan SUPABASE_SECRET_KEYS; los anteriores, SUPABASE_SERVICE_ROLE_KEY.
  try { const k = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'); const v = k.default || Object.values(k)[0]; if (v) return v as string; } catch (_) { /* sin claves nuevas */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
}
const SB = createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), { auth: { persistSession: false } });
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const ERRORS: string[] = [];
async function sendTo(ids: string[], title: string, body: string, url = '/') {
  if (!ids.length) return 0;
  const { data } = await SB.from('push_subs').select('endpoint,sub').in('person_id', ids);
  let sent = 0;
  for (const r of data ?? []) {
    try {
      await webpush.sendNotification(r.sub, JSON.stringify({ title, body, url }), { TTL: 60 * 60 * 12 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      const msg = String((e as { body?: string }).body || (e as Error).message || e).slice(0, 300);
      console.error('push fallo', code, msg);
      ERRORS.push(`${code ?? '-'} ${msg}`);
      if (code === 404 || code === 410) await SB.from('push_subs').delete().eq('endpoint', r.endpoint);
    }
  }
  return sent;
}

// ---- recordatorio diario ----
const LBL: Record<string, string> = {
  pul: 'Púlpito', pul_ini: 'Púlpito (inicia)', pul_fin: 'Púlpito (finaliza)', predica: 'Predicación',
  sonido: 'Sonido', puerta: 'Puerta',
  de_intro: 'Alemán · introducción', de_pred: 'Alemán · predicación', de_test: 'Alemán · testimonios',
  en_intro: 'Inglés · introducción', en_pred: 'Inglés · predicación', en_test: 'Inglés · testimonios',
  ofr1: 'Recoger ofrendas', ofr2: 'Recoger ofrendas', ofr3: 'Recoger ofrendas', ofr4: 'Recoger ofrendas',
  ent: 'Entrega de ofrendas', mic1: 'Micrófonos', mic2: 'Micrófonos',
  grd1: 'Guardar ofrendas', grd2: 'Guardar ofrendas', grd3: 'Guardar ofrendas',
};
const SVC: Record<number, [string, string]> = {
  1: ['Alabanza', '18:30'], 2: ['Estudio bíblico', '18:30'], 3: ['Alabanza', '18:30'], 4: ['Enseñanza', '18:30'],
  5: ['Alabanza', '18:30'], 6: ['Estudio bíblico', '18:00'], 0: ['Enseñanza', '10:00'],
};
const DOW = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const ROLEAREA: Record<string, string> = {
  pulpito: 'pulpito', puerta: 'puerta', sonido: 'sonido', trad_de: 'trad', trad_en: 'trad',
  ofrendas: 'ofr', guardar: 'ofr', guardar_sup: 'ofr', microfonos: 'mic', entrega: 'ofr',
};
function berlin(d: Date) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  return Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value])) as Record<string, string>;
}
// deno-lint-ignore no-explicit-any
function invitees(st: any, m: any): string[] {
  // deno-lint-ignore no-explicit-any
  const people: any[] = st.people || [];
  if ((m.areas || []).includes('all')) return people.map((p) => p.id);
  return people.filter((p) => (p.roles || []).some((r: string) => (m.areas || []).includes(ROLEAREA[r])) || ((m.areas || []).includes('pulpito') && p.pastor)).map((p) => p.id);
}
// ---- disponibilidad del mes siguiente (día 15 se pide, día 20 se recuerda, día 23 se avisa al administrador) ----
const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const AV = { send: 15, remind: 20, deadline: 22, close: 23, hour: 10 };
const once = async (key: string) => !(await SB.from('push_log').insert({ day: key })).error;
const uid = () => Math.random().toString(36).slice(2, 9);
// deno-lint-ignore no-explicit-any
async function editState(fn: (st: any) => void) {
  for (let i = 0; i < 5; i++) {
    const { data } = await SB.from('app_state').select('json,version').eq('id', 'main').maybeSingle();
    if (!data) return null;
    const st = JSON.parse(data.json);
    fn(st);
    const { data: up } = await SB.from('app_state').update({ json: JSON.stringify(st), version: data.version + 1, updated_at: new Date().toISOString() })
      .eq('id', 'main').eq('version', data.version).select('version');
    if (up && up.length) return st;
  }
  return null;
}
// deno-lint-ignore no-explicit-any
const servers = (st: any): string[] => (st.people || []).filter((x: any) => x.roles && x.roles.length).map((x: any) => x.id);
// deno-lint-ignore no-explicit-any
const addNotif = (st: any, to: string[], text: string) => { st.notifs = st.notifs || []; st.notifs.unshift({ id: uid(), ts: Date.now(), to, text, read: [] }); st.notifs = st.notifs.slice(0, 300); };
async function monthly() {
  const p = berlin(new Date());
  if (Number(p.hour) !== AV.hour) return { skipped: true };
  const day = Number(p.day);
  let y = Number(p.year), m = Number(p.month) + 1;
  if (m > 12) { m = 1; y++; }
  const ym = `${y}-${String(m).padStart(2, '0')}`, mes = MES[m - 1];
  const deadline = `${p.year}-${p.month}-${String(AV.deadline).padStart(2, '0')}`;
  const fmtDl = `${AV.deadline} de ${MES[Number(p.month) - 1]}`;
  if (day === AV.send && await once(`av-send-${ym}`)) {
    let to: string[] = [];
    const st = await editState((st) => {
      st.avReqs = st.avReqs || {};
      if (st.avReqs[ym]) return;
      st.avReqs[ym] = { deadline, ts: Date.now(), done: {}, auto: true };
      to = servers(st);
      addNotif(st, to, `Marca los días que no puedes servir en ${mes}, antes del ${fmtDl}. Está arriba en Labores.`);
    });
    if (st && to.length) await sendTo(to, `Disponibilidad de ${mes}`, `Marca los días que no puedes antes del ${fmtDl}.`);
    return { sent: 'pedido', ym };
  }
  if (day === AV.remind && await once(`av-remind-${ym}`)) {
    let pend: string[] = [];
    await editState((st) => {
      const av = (st.avReqs || {})[ym];
      if (!av) return;
      pend = servers(st).filter((i) => !(av.done && av.done[i]));
      if (pend.length) addNotif(st, pend, `Todavía falta tu disponibilidad de ${mes}. Márcala en Labores antes del ${fmtDl}.`);
    });
    if (pend.length) await sendTo(pend, `Falta tu disponibilidad de ${mes}`, `Márcala antes del ${fmtDl}.`);
    return { sent: 'recordatorio', ym, n: pend.length };
  }
  if (day === AV.close && await once(`av-close-${ym}`)) {
    let admins: string[] = [], txt = '';
    await editState((st) => {
      const av = (st.avReqs || {})[ym];
      if (!av) return;
      // deno-lint-ignore no-explicit-any
      admins = (st.people || []).filter((x: any) => x.admin).map((x: any) => x.id);
      const all = servers(st), done = all.filter((i) => av.done && av.done[i]).length;
      txt = `Cerró la disponibilidad de ${mes}: ${done} de ${all.length} respondieron. Abre Horario para revisar el borrador y publicarlo.`;
      addNotif(st, admins, txt);
    });
    if (admins.length) await sendTo(admins, `Disponibilidad de ${mes} cerrada`, txt);
    return { sent: 'cierre', ym };
  }
  return { skipped: true, day };
}

async function daily() {
  const now = new Date();
  const p = berlin(now);
  if (Number(p.hour) !== 20) return { skipped: true, hour: p.hour };
  const q = berlin(new Date(now.getTime() + 24 * 3600e3));
  const date = `${q.year}-${q.month}-${q.day}`;
  // Solo una vez por día, aunque alguien llame a la función más veces.
  const { error: dup } = await SB.from('push_log').insert({ day: date });
  if (dup) return { skipped: true, already: date };
  const { data } = await SB.from('app_state').select('json').eq('id', 'main').maybeSingle();
  if (!data) return { error: 'sin datos' };
  const st = JSON.parse(data.json);
  const as: Record<string, string> = (st.schedules?.[date.slice(0, 7)] || {})[date] || {};
  const dow = new Date(date + 'T12:00:00Z').getUTCDay();
  const [sn, hr] = SVC[dow];
  const by: Record<string, Set<string>> = {};
  for (const [k, pid] of Object.entries(as)) (by[pid] ??= new Set()).add(LBL[k] || k);
  let sent = 0;
  for (const [pid, set] of Object.entries(by)) sent += await sendTo([pid], `Mañana te toca: ${[...set].join(', ')}`, `${sn} del ${DOW[dow]} a las ${hr}.`);
  // deno-lint-ignore no-explicit-any
  for (const m of (st.meets || []).filter((m: any) => m.date === date)) {
    sent += await sendTo(invitees(st, m), `Mañana: ${m.title}`, `${m.time ? 'A las ' + m.time + '. ' : ''}${m.place || ''}`.trim() || 'Reunión convocada.');
  }
  return { date, sent };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  // deno-lint-ignore no-explicit-any
  const b: any = await req.json().catch(() => ({}));
  if (b.mode === 'daily') return json({ monthly: await monthly(), daily: await daily() });
  if (b.mode === 'ping') {
    // Prueba: envía un aviso solo a los administradores.
    const { data } = await SB.from('app_state').select('json').eq('id', 'main').maybeSingle();
    // deno-lint-ignore no-explicit-any
    const admins = data ? (JSON.parse(data.json).people || []).filter((x: any) => x.admin).map((x: any) => x.id) : [];
    ERRORS.length = 0;
    const sent = await sendTo(admins, 'Prueba de Labores Berlín', 'Si ves esto, las notificaciones funcionan.');
    return json({ sent, errors: ERRORS });
  }
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: u } = await SB.auth.getUser(token);
  const email = u?.user?.email?.toLowerCase();
  if (!email) return json({ error: 'no autorizado' }, 401);
  const { data: m } = await SB.from('members').select('person_id').eq('email', email).maybeSingle();
  if (!m) return json({ error: 'no es miembro' }, 403);
  const to = (Array.isArray(b.to) ? b.to : []).filter((x: unknown) => typeof x === 'string').slice(0, 200);
  const sent = await sendTo(to, String(b.title || 'Labores Berlín').slice(0, 120), String(b.body || '').slice(0, 500), '/');
  return json({ sent });
});

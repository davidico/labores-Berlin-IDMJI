// Función "push" de Supabase: envía notificaciones al celular.
// - mode "send": la app avisa a ciertas personas (solo miembros registrados pueden usarla).
// - mode "daily": recordatorio de la noche antes (lo llama la tarea programada cada 30 minutos; envía una sola vez por día, a las 20:30 de Berlín).
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
// deno-lint-ignore no-explicit-any
async function sendTo(ids: string[], title: string, body: string, url = '/', actions?: any[]) {
  if (!ids.length) return 0;
  const { data } = await SB.from('push_subs').select('endpoint,sub').in('person_id', ids);
  let sent = 0;
  for (const r of data ?? []) {
    try {
      await webpush.sendNotification(r.sub, JSON.stringify(actions ? { title, body, url, actions } : { title, body, url }), { TTL: 60 * 60 * 12, urgency: 'high' });
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
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
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

// ---- recordatorios al pastor: fichas de la semana (lun–mié) y transmisión del domingo (vie–sáb), a las 8:00 ----
// deno-lint-ignore no-explicit-any
function teachMapS(st: any): Record<string, any> {
  // deno-lint-ignore no-explicit-any
  const m: Record<string, any> = {}; const ts: any[] = st.teachings || []; const tr: any[] = st.trans || [];
  if (!st.teachStart) return m;
  const d = new Date(st.teachStart + 'T12:00:00Z'); let i = 0, g = 0;
  while (i < ts.length && g < 2000) {
    const s = d.toISOString().slice(0, 10), w = d.getUTCDay();
    if ((w === 4 || w === 0) && !tr.some((t) => t.date === s)) { m[s] = ts[i]; i++; }
    d.setUTCDate(d.getUTCDate() + 1); g++;
  }
  return m;
}
const plusDays = (iso: string, n: number) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmtD = (iso: string) => { const d = new Date(iso + 'T12:00:00Z'); return `${DOW[d.getUTCDay()]} ${d.getUTCDate()}`; };
async function pastorReminders() {
  const p = berlin(new Date());
  if (Number(p.hour) !== 8) return { skipped: true };
  const today = `${p.year}-${p.month}-${p.day}`;
  const dow = new Date(today + 'T12:00:00Z').getUTCDay();
  if (![1, 2, 3, 5, 6].includes(dow)) return { skipped: true, dow };
  const { data } = await SB.from('app_state').select('json').eq('id', 'main').maybeSingle();
  if (!data) return { error: 'sin datos' };
  const st = JSON.parse(data.json);
  // deno-lint-ignore no-explicit-any
  const pastors: string[] = (st.people || []).filter((x: any) => x.pastor).map((x: any) => x.id);
  if (!pastors.length) return { skipped: true, noPastor: true };
  const lines: string[] = [];
  let title = '';
  if (dow >= 1 && dow <= 3) {
    // Jueves y domingo de esta semana
    const thu = plusDays(today, 4 - dow), sun = plusDays(today, 7 - dow);
    const tm = teachMapS(st);
    for (const d of [thu, sun]) {
      // deno-lint-ignore no-explicit-any
      if ((st.trans || []).some((t: any) => t.date === d)) continue;
      const t = tm[d];
      if (!t) { lines.push(`${fmtD(d)}: falta cargar la enseñanza`); continue; }
      const davidPreaches = Object.keys((st.schedules?.[d.slice(0, 7)] || {})[d] || {}).includes('predica');
      const need = ['alemán', 'inglés'];
      const miss = need.filter((l) => !(l === 'alemán' ? t.linkDe : t.linkEn));
      if (miss.length && !davidPreaches) lines.push(`${fmtD(d)} («${t.title}»): falta el enlace de la ficha en ${miss.join(' y ')}`);
    }
    // deno-lint-ignore no-explicit-any
    for (const l of (st.leipzig || []) as any[]) {
      if (!l.date || l.date < today || l.date > plusDays(today, 7 - dow)) continue;
      const miss = [!l.teaching && 'el título', !l.linkDe && 'el enlace en alemán', !l.linkEn && 'el enlace en inglés'].filter(Boolean);
      if (miss.length) lines.push(`Leipzig ${fmtD(l.date)}: falta ${miss.join(', ')}`);
    }
    title = 'Fichas de esta semana';
  } else {
    const sun = plusDays(today, 7 - dow);
    // Pregunta con respuesta Sí / No (botones en Android; en iPhone se toca y responde en la app)
    // deno-lint-ignore no-explicit-any
    if ((st.trans || []).some((t: any) => t.date === sun) || (st.transNo || []).includes(sun)) return { ok: 'ya respondió', sun };
    if (!(await once(`pastor-${today}`))) return { skipped: true, already: today };
    const q = `¿Hay transmisión internacional el ${fmtD(sun)}?`;
    await editState((s2) => addNotif(s2, pastors, `${q} Responde Sí o No en Labores.`));
    const sent = await sendTo(pastors, 'Transmisión del domingo', `${q} Toca para responder Sí o No.`, `/?tr=${sun}`,
      [{ action: 'tr-si', title: 'Sí, hay' }, { action: 'tr-no', title: 'No hay' }]);
    return { sent, sun };
  }
  if (!lines.length) return { ok: 'nada pendiente' };
  if (!(await once(`pastor-${today}`))) return { skipped: true, already: today };
  const body = lines.join('\n');
  const note = dow >= 5 ? `${title}: ${lines.join(' · ')}` : `${title}: ${lines.join(' · ')}. Pon los enlaces a más tardar el miércoles en la pestaña Pastor.`;
  await editState((s2) => addNotif(s2, pastors, note));
  const sent = await sendTo(pastors, title, body);
  return { sent, lines };
}

// ---- recordatorio a quien da la introducción: que ponga la cita bíblica ----
// Jueves: el miércoles a las 10:00 y, si aún no la puso, el jueves a las 16:00.
// Domingo: el viernes a las 10:00 y, si aún no la puso, el sábado a las 16:00.
async function introReminders() {
  const p = berlin(new Date());
  const hour = Number(p.hour);
  const today = `${p.year}-${p.month}-${p.day}`;
  const dow = new Date(today + 'T12:00:00Z').getUTCDay();
  const plan: Record<number, [number, number]> = { 3: [10, 1], 4: [16, 0], 5: [10, 2], 6: [16, 1] };
  const pl = plan[dow];
  if (!pl || hour !== pl[0]) return { skipped: true };
  const d = plusDays(today, pl[1]);
  const { data } = await SB.from('app_state').select('json').eq('id', 'main').maybeSingle();
  if (!data) return { error: 'sin datos' };
  const st = JSON.parse(data.json);
  if (!(st.published && st.published[d.slice(0, 7)])) return { skipped: true, unpublished: true };
  // deno-lint-ignore no-explicit-any
  if ((st.trans || []).some((t: any) => t.date === d)) return { skipped: true, trans: d };
  const pid: string | undefined = ((st.schedules?.[d.slice(0, 7)] || {})[d] || {}).pul;
  if (!pid) return { skipped: true, noIntro: d };
  if (st.intro?.[d]?.cita) return { ok: 'ya puso la cita', d };
  if (!(await once(`intro-${d}-${today}`))) return { skipped: true, already: today };
  const when = d === today ? 'hoy' : `el ${fmtD(d)}`;
  const title = `Tu introducción ${d === today ? 'de hoy' : 'del ' + fmtD(d)}`;
  const body = `Pon la cita bíblica que leerás (y el enlace del testimonio, si tienes) en Labores, para que los intérpretes se preparen.`;
  await editState((s2) => addNotif(s2, [pid], `Das la introducción ${when}: pon la cita bíblica que leerás (y el enlace del testimonio, si tienes) para que los intérpretes se preparen.`));
  const sent = await sendTo([pid], title, body);
  return { sent, d, pid };
}

// ---- recordatorio del mismo día, a las 8:00 ----
async function todayReminder() {
  const p = berlin(new Date());
  if (Number(p.hour) !== 8) return { skipped: true };
  const date = `${p.year}-${p.month}-${p.day}`;
  const { error: dup } = await SB.from('push_log').insert({ day: `hoy-${date}` });
  if (dup) return { skipped: true, already: date };
  const { data } = await SB.from('app_state').select('json').eq('id', 'main').maybeSingle();
  if (!data) return { error: 'sin datos' };
  const st = JSON.parse(data.json);
  if (!(st.published && st.published[date.slice(0, 7)])) return { skipped: true, unpublished: true };
  const as: Record<string, string> = (st.schedules?.[date.slice(0, 7)] || {})[date] || {};
  const dow = new Date(date + 'T12:00:00Z').getUTCDay();
  const [sn, hr] = SVC[dow];
  const by: Record<string, Set<string>> = {};
  for (const [k, pid] of Object.entries(as)) if (pid) (by[pid] ??= new Set()).add(LBL[k] || k);
  let sent = 0;
  for (const [pid, set] of Object.entries(by)) sent += await sendTo([pid], `Hoy te toca: ${[...set].join(', ')}`, `${sn} a las ${hr}.`);
  // deno-lint-ignore no-explicit-any
  for (const m of (st.meets || []).filter((m: any) => m.date === date)) {
    sent += await sendTo(invitees(st, m), `Hoy: ${m.title}`, `${m.time ? 'A las ' + m.time + '. ' : ''}${m.place || ''}`.trim() || 'Reunión convocada.');
  }
  return { date, sent };
}

async function daily() {
  const now = new Date();
  const p = berlin(now);
  // Aviso de lo que toca mañana: a las 20:30 (la tarea programada corre cada 30 minutos).
  if (Number(p.hour) !== 20 || Number(p.minute) < 30) return { skipped: true, hour: p.hour, minute: p.minute };
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

// ---- calendario (Google Calendar, iPhone): enlace personal y secreto ----
const enc = new TextEncoder();
let HK: CryptoKey | null = null;
async function sig(id: string) {
  HK ??= await crypto.subtle.importKey('raw', enc.encode(Deno.env.get('VAPID_PRIVATE_KEY') + ':cal'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const b = new Uint8Array(await crypto.subtle.sign('HMAC', HK, enc.encode(id)));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 24);
}
const icsTxt = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function fold(l: string) {
  const out: string[] = [];
  const b = enc.encode(l);
  if (b.length <= 74) return l;
  let cur = '';
  for (const ch of l) { if (enc.encode(cur + ch).length > 73) { out.push(cur); cur = ' ' + ch; } else cur += ch; }
  out.push(cur);
  return out.join('\r\n');
}
const VTZ = ['BEGIN:VTIMEZONE', 'TZID:Europe/Berlin', 'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD', 'END:VTIMEZONE'];
const lt = (date: string, hm: string) => date.replace(/-/g, '') + 'T' + hm.replace(':', '') + '00';
function plus(hm: string, min: number) { const [h, m] = hm.split(':').map(Number); const t = h * 60 + m + min; return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; }
const ORDERK = Object.keys(LBL);
async function calendar(pid: string, t: string) {
  if (!pid || !t || t !== await sig(pid)) return new Response('Enlace no válido', { status: 403 });
  const { data } = await SB.from('app_state').select('json').eq('id', 'main').maybeSingle();
  if (!data) return new Response('sin datos', { status: 500 });
  const st = JSON.parse(data.json);
  const all = pid === '*todos';
  // deno-lint-ignore no-explicit-any
  const people: any[] = st.people || [];
  const me = people.find((x) => x.id === pid);
  if (!all && !me) return new Response('Enlace no válido', { status: 403 });
  const nm = (id: string) => (people.find((x) => x.id === id) || {}).name || id;
  const p0 = berlin(new Date());
  const from = `${p0.year}-${p0.month}-01`.slice(0, 7);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const L: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Labores Berlin//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${all ? 'Labores Berlín · todos' : 'Mis labores · Berlín'}`, 'X-WR-TIMEZONE:Europe/Berlin', 'REFRESH-INTERVAL;VALUE=DURATION:PT6H', 'X-PUBLISHED-TTL:PT6H', ...VTZ];
  const ev = (uid: string, date: string, hm: string, mins: number, sum: string, desc: string) => {
    L.push('BEGIN:VEVENT', `UID:${uid}@labores-berlin`, `DTSTAMP:${stamp}`, `DTSTART;TZID=Europe/Berlin:${lt(date, hm)}`, `DTEND;TZID=Europe/Berlin:${lt(date, plus(hm, mins))}`,
      `SUMMARY:${icsTxt(sum)}`, `LOCATION:${icsTxt('Pistoriusstraße 114, Berlin')}`);
    if (desc) L.push(`DESCRIPTION:${icsTxt(desc)}`);
    L.push('END:VEVENT');
  };
  for (const ym of Object.keys(st.schedules || {}).sort()) {
    if (ym < from || !(st.published && st.published[ym])) continue;
    for (const [date, as] of Object.entries(st.schedules[ym] as Record<string, Record<string, string>>).sort()) {
      const dow = new Date(date + 'T12:00:00Z').getUTCDay();
      const [sn, hr] = SVC[dow];
      const ks = Object.keys(as).filter((k) => as[k]).sort((a, b) => ORDERK.indexOf(a) - ORDERK.indexOf(b));
      if (all) {
        if (!ks.length) continue;
        ev(`${date}-todos`, date, hr, 120, `${sn} · labores`, ks.map((k) => `${LBL[k] || k}: ${nm(as[k])}`).join('\n'));
      } else {
        const mine = [...new Set(ks.filter((k) => as[k] === pid).map((k) => LBL[k] || k))];
        if (mine.length) ev(`${date}-${pid}`, date, hr, 120, `Labor: ${mine.join(', ')}`, `${sn} del ${DOW[dow]} a las ${hr}.\nVer en la app: https://labores-berlin.pages.dev`);
        // Gabriela: los días de alabanza en que David no tiene labor, va ella a la alabanza (sin labor).
        if (pid === 'gabriela' && !mine.length && [1, 3, 5].includes(dow) && !Object.values(as).includes('david'))
          ev(`${date}-alab-${pid}`, date, hr, 120, 'Alabanza (vas tú)', 'Ese día vas tú a la alabanza. No tienes labor.');
      }
    }
  }
  // deno-lint-ignore no-explicit-any
  for (const m of (st.meets || []) as any[]) {
    if (!m.date || m.date.slice(0, 7) < from) continue;
    if (!all && !invitees(st, m).includes(pid)) continue;
    const hm = /^\d{1,2}:\d{2}$/.test(m.time || '') ? m.time.padStart(5, '0') : '';
    const sum = `Reunión: ${m.title || ''}`;
    if (hm) ev(`meet-${m.id || m.date}-${pid}`, m.date, hm, 60, sum, m.place || '');
    else L.push('BEGIN:VEVENT', `UID:meet-${m.id || m.date}-${pid}@labores-berlin`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${m.date.replace(/-/g, '')}`, `SUMMARY:${icsTxt(sum)}`, ...(m.place ? [`DESCRIPTION:${icsTxt(m.place)}`] : []), 'END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return new Response(L.map(fold).join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method === 'GET') { const q = new URL(req.url).searchParams; return calendar(q.get('p') || '', q.get('t') || ''); }
  // deno-lint-ignore no-explicit-any
  const b: any = await req.json().catch(() => ({}));
  if (b.mode === 'daily') return json({ monthly: await monthly(), pastor: await pastorReminders(), today: await todayReminder(), intro: await introReminders(), daily: await daily() });
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
  if (b.mode === 'delete-me') {
    // Borrar mi cuenta: se borran los datos personales y la cuenta de acceso.
    const pid = m.person_id;
    const today = (() => { const p = berlin(new Date()); return `${p.year}-${p.month}-${p.day}`; })();
    await SB.from('push_subs').delete().eq('person_id', pid);
    let name = '';
    await editState((st) => {
      // deno-lint-ignore no-explicit-any
      const p = (st.people || []).find((x: any) => x.id === pid);
      if (!p) return;
      name = p.name;
      Object.assign(p, { name: 'Persona eliminada', email: '', phone: '', photo: undefined, roles: [], days: [], blocked: [], predPref: undefined, privacy: undefined, deleted: Date.now(), admin: false, pastor: false });
      delete p.photo; delete p.predPref; delete p.privacy;
      const freed: string[] = [];
      for (const ym of Object.keys(st.schedules || {})) for (const [d, as] of Object.entries(st.schedules[ym] as Record<string, Record<string, string>>)) {
        if (d < today) continue;
        for (const k of Object.keys(as)) if (as[k] === pid) { delete as[k]; freed.push(d); }
      }
      // deno-lint-ignore no-explicit-any
      const admins = (st.people || []).filter((x: any) => x.admin && x.id !== pid).map((x: any) => x.id);
      if (admins.length) addNotif(st, admins, `${name} borró su cuenta.${freed.length ? ` Quedaron labores sin asignar: ${[...new Set(freed)].sort().join(', ')}. Revisa el horario.` : ''}`);
    });
    await SB.from('members').delete().eq('email', email);
    const { error } = await SB.auth.admin.deleteUser(u!.user!.id);
    return json({ ok: !error });
  }
  if (b.mode === 'caltoken') {
    const base = `${Deno.env.get('SUPABASE_URL')}/functions/v1/push`;
    const { data: adm } = await SB.from('members').select('is_admin').eq('email', email).maybeSingle();
    const out: Record<string, string> = { me: `${base}?p=${encodeURIComponent(m.person_id)}&t=${await sig(m.person_id)}` };
    if (adm?.is_admin) out.all = `${base}?p=${encodeURIComponent('*todos')}&t=${await sig('*todos')}`;
    return json(out);
  }
  const to = (Array.isArray(b.to) ? b.to : []).filter((x: unknown) => typeof x === 'string').slice(0, 200);
  const sent = await sendTo(to, String(b.title || 'Labores Berlín').slice(0, 120), String(b.body || '').slice(0, 500), '/');
  return json({ sent });
});


const LS='labores-berlin-v1';
const pad=n=>String(n).padStart(2,'0');
const ds=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)};
const linkify=s=>esc(s).replace(/(https?:\/\/[^\s<]+)/g,u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const DOW=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DOWS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESS=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const ROLES={pulpito:'Púlpito',puerta:'Puerta',sonido:'Sonido',trad_de:'Traducción alemán',trad_en:'Traducción inglés',ofrendas:'Ofrendas (recogen)',guardar:'Ofrendas (guardan)',guardar_sup:'Ofrendas (guardan, reemplazo)',microfonos:'Micrófonos',entrega:'Entrega de ofrendas'};
const ROLEAREA={pulpito:'pulpito',puerta:'puerta',sonido:'sonido',trad_de:'trad',trad_en:'trad',ofrendas:'ofr',guardar:'ofr',guardar_sup:'ofr',microfonos:'mic',entrega:'ofr'};
const AREAC={pulpito:'--a-pul',puerta:'--a-puer',sonido:'--a-son',trad:'--a-trad',ofr:'--a-ofr',mic:'--a-mic'};
const AREAN={pulpito:'Púlpito',puerta:'Puerta',sonido:'Sonido',trad:'Traducción',ofr:'Ofrendas',mic:'Micrófonos'};
const INTROT=['Llamamiento de Dios a nuestra Hna. María Luisa cuando ella tenía 8 años','Somos cristianos practicantes de la Biblia y guiados por el Espíritu','Promesa: «De este pequeño redil levantaré mi Iglesia en medio de las naciones»','Destacar el libro «Vivencias»','Promesa: «Dios le enseñaría la doctrina a nuestra Hna. María Luisa y viajaría para llevar su palabra»'];
const PREAMB=['Prepararnos para alabar a Dios','Darle gracias a Dios','Buscar los dones espirituales','Concentrarnos y dejar la timidez','¿Cómo recibir el Bautismo con el Espíritu Santo?','La reverencia'];
const SVC={1:['Alabanza','18:30'],2:['Estudio bíblico','18:30'],3:['Alabanza','18:30'],4:['Enseñanza','18:30'],5:['Alabanza','18:30'],6:['Estudio bíblico','18:00'],0:['Enseñanza','10:00']};
// Combinaciones permitidas en el mismo culto. El sonido nunca combina.
const ALLOWED=new Set(['grd|trI','grd|trP','ent|trI','puerta|pul','mic|pul','ofr|pul','ofr|puerta','mic|puerta','ofr|trI','trP|trT','ent|puerta','ent|pul','ent|mic','pul|pul']);

const S=(k,l,role,tag,area,x={})=>({k,l,role,tag,area,...x});
function slotsFor(dow){
  const son=S('sonido','Sonido','sonido','son','sonido');
  const puer=S('puerta','Puerta','puerta','puerta','puerta');
  if(dow===1||dow===3||dow===5) return [S('pul_ini','Púlpito · inicia','pulpito','pul','pulpito'),S('pul_fin','Púlpito · finaliza','pulpito','pul','pulpito'),son,puer];
  if(dow===2) return [S('pul','Púlpito · inicia y finaliza','pulpito','pul','pulpito',{onlyPastor:1}),son,S('puerta','Puerta','puerta','puerta','puerta',{excl:['david','oswaldo']})];
  if(dow===6) return [S('pul','Púlpito · inicia y finaliza','pulpito','pul','pulpito',{noPastor:1}),son,puer];
  const a=[S('pul','Púlpito · introducción','pulpito','pul','pulpito',{noPastor:1}),son,dow===4?S('puerta','Puerta','puerta','puerta','puerta',{prefer:['carlos','miguel','oswaldo','david']}):puer,
    S('de_intro','Alemán · introducción','trad_de','trI','trad',{lang:'de'}),
    S('de_pred','Alemán · predicación','trad_de','trP','trad',{lang:'de'}),
    S('de_test','Alemán · testimonios','trad_de','trT','trad',{lang:'de'})];
  if(dow===0) a.push(S('en_intro','Inglés · introducción','trad_en','trI','trad',{lang:'en'}),
    S('en_pred','Inglés · predicación','trad_en','trP','trad',{lang:'en'}),
    S('en_test','Inglés · testimonios','trad_en','trT','trad',{lang:'en'}));
  a.push(S('ofr1','Ofrendas · pareja 1','ofrendas','ofr','ofr',{pair:'ofr2'}),S('ofr2','Ofrendas · pareja 1','ofrendas','ofr','ofr',{pairOf:'ofr1'}));
  if(dow===0) a.push(S('ofr3','Ofrendas · pareja 2','ofrendas','ofr','ofr',{pair:'ofr4'}),S('ofr4','Ofrendas · pareja 2','ofrendas','ofr','ofr',{pairOf:'ofr3'}));
  for(const i of [1,2,3])a.push(S('grd'+i,'Ofrendas · guardan','guardar','grd','ofr',{altRole:'guardar_sup'}));
  a.push(S('mic1','Micrófonos','microfonos','mic','mic'));
  if(dow===0) a.push(S('mic2','Micrófonos','microfonos','mic','mic'));
  a.push(S('ent','Entrega de ofrendas','entrega','ent','ofr'));
  return a;
}
const ORDER=['predica','pul','pul_ini','pul_fin','sonido','grd1','grd2','grd3','puerta','de_pred','de_test','en_pred','en_test','ofr1','ofr3','de_intro','en_intro','mic1','mic2','ent'];
function leipThu(date){const d=pd(date);if(d.getDay()!==4)return false;const sat=ds(new Date(d.getTime()+2*864e5));return state.leipzig.some(l=>l.date===sat)}
function slotsAt(date){const a=slotsFor(pd(date).getDay());if(!state.leipThuRule||!leipThu(date))return a;
  return [S('predica','Púlpito · predicación','pulpito','pred','pulpito',{only:['david','javier'],prefer:['david']}),...a.map(s=>s.k==='pul'?{...s,noPastor:0,only:['oswaldo','javier','david'],prefer:['oswaldo','javier']}:s)]}
function pen(p,s,dow){let v=0;if(s.altRole&&!p.roles.includes(s.role))v+=800;if(p.avoidSlots&&p.avoidSlots.includes(s.k))v+=300;if(p.avoidDays&&p.avoidDays.includes(dow))v+=300;if(p.favorSlots&&p.favorSlots.includes(s.k))v-=100;return v}
function combo(a,b){
  if(a.tag==='son'||b.tag==='son') return false;
  const k=[a.tag,b.tag].sort().join('|');
  if(k==='trP|trT') return a.lang===b.lang;
  return ALLOWED.has(k);
}

function P(id,name,sex,roles,x={}){return{id,name,sex,roles,days:[0,1,2,3,4,5,6],blocked:[],phone:'',...x}}
function seed(){
  // Estado vacío: los datos reales llegan de Supabase al entrar (no se guardan nombres en el código público).
  return {v:1,me:null,davidFix:1,davidFix2:1,leipFix:1,roxFix:1,ruleFix3:1,grdFix:1,lateFix:1,phoneFix:1,entFix:1,novFix:1,pubFix:1,gabyAlabUndo:1,gabyAlab:1,meets:[],leipThuRule:1,
    people:[],fixed:{},teachStart:ds(new Date()),teachings:[],trans:[],leipzig:[],schedules:{},published:{},avReqs:{}};
}
let state;
try{state=JSON.parse(localStorage.getItem(LS)||'null')}catch(e){state=null}
if(!state||state.v!==1) state=seed();
state.reqs=state.reqs||[];state.notifs=state.notifs||[];state.msgs=state.msgs||[];state.meets=state.meets||[];
if(!state.adminFix){const g=state.people.find(p=>p.id==='gabriela'),d=state.people.find(p=>p.id==='david');if(g)g.admin=false;if(d)d.admin=true;state.adminFix=1;if(state.me==='gabriela')state.me=null}
const SB=window.supabase.createClient(window.CFG.url,window.CFG.key);
let SYNC='loading',lastJson=null,BASE=null,VER=0,writing=false,dirty=false,wTimer=null,SESSION=null,MYPID=null,READY=false,CH=null,LOADED=false,rTimer=null,lTimer=null,skipped=false;
/* Lo último que se sincronizó con el servidor: si se cierra la app con cambios sin guardar, al volver se unen con lo del servidor en vez de perderse. */
const BASEK=LS+'-base';
const storeBase=()=>{try{if(lastJson)localStorage.setItem(BASEK,lastJson)}catch(e){}};
try{const b=localStorage.getItem(BASEK);if(b){BASE=JSON.parse(b);lastJson=b}}catch(e){lastJson=null;BASE=null}
/* Teléfono y correo van en la tabla private_info (solo los leen el admin y la propia persona), no en el estado que ven todos. */
let PRIV={},PRIVTBL=false;
const sharedObj=()=>{const{me,...rest}=state;if(!state.privMoved)return rest;return {...rest,people:(rest.people||[]).map(({phone,email,...x})=>x)}};
async function loadPriv(){try{const{data,error}=await SB.from('private_info').select('person_id,phone,email');if(error)throw error;PRIVTBL=true;PRIV={};for(const x of data||[])PRIV[x.person_id]={phone:x.phone||'',email:x.email||''}}catch(e){PRIVTBL=false}}
function applyPriv(){if(!PRIVTBL)return;for(const p of state.people||[]){const x=PRIV[p.id];if(x){p.phone=x.phone;p.email=x.email}}}
function savePriv(p){if(!PRIVTBL||!p)return;PRIV[p.id]={phone:p.phone||'',email:(p.email||'').toLowerCase()};
  SB.from('private_info').upsert({person_id:p.id,...PRIV[p.id],updated_at:new Date().toISOString()}).then(r=>{if(r&&r.error){ui.toast='No se pudo guardar el teléfono o el correo. Revisa la conexión.';render()}},()=>{})}
// Una sola vez, en el aparato del admin: pasa teléfonos y correos a la tabla privada y los quita del estado compartido.
async function movePriv(){const r=realMe();if(!PRIVTBL||state.privMoved||!r||!r.admin||ui.viewAs)return;
  const rows=state.people.filter(p=>p.phone||p.email||PRIV[p.id]).map(p=>({person_id:p.id,phone:(PRIV[p.id]&&PRIV[p.id].phone)||p.phone||'',email:((PRIV[p.id]&&PRIV[p.id].email)||p.email||'').toLowerCase(),updated_at:new Date().toISOString()}));
  try{if(rows.length){const{error}=await SB.from('private_info').upsert(rows);if(error)return}
    for(const x of rows)PRIV[x.person_id]={phone:x.phone,email:x.email};state.privMoved=1;save()}catch(e){}}
const sharedJson=()=>JSON.stringify(sharedObj());
function save(){try{localStorage.setItem(LS,JSON.stringify(state))}catch(e){}if(SESSION&&READY){clearTimeout(wTimer);wTimer=setTimeout(push,400)}}
/* Unir cambios de dos personas que guardan al mismo tiempo (base común, lo mío, lo del servidor). */
const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function merge3(b,l,r){
  if(same(l,b))return r;if(same(r,b)||same(l,r))return l;
  if(isObj(l)&&isObj(r)){const bb=isObj(b)?b:{},out={};
    for(const k of new Set([...Object.keys(r),...Object.keys(l)])){const inL=k in l,inR=k in r,inB=k in bb;
      if(inL&&inR)out[k]=merge3(bb[k],l[k],r[k]);
      else if(inL){if(inB&&same(bb[k],l[k]))continue;out[k]=l[k]}
      else{if(inB&&same(bb[k],r[k]))continue;out[k]=r[k]}}
    return out}
  if(Array.isArray(l)&&Array.isArray(r)){const ba=Array.isArray(b)?b:[];
    const withIds=a=>a.every(x=>isObj(x)&&typeof x.id==='string');
    if(withIds(l)&&withIds(r)&&withIds(ba)){const M=a=>new Map(a.map(x=>[x.id,x])),B=M(ba),L=M(l),R=M(r);
      const keep=id=>{const inB=B.has(id),inL=L.has(id),inR=R.has(id);if(inL&&inR)return true;if(inL)return !inB;if(inR)return !inB;return false};
      const newLocal=l.filter(x=>!B.has(x.id)&&!R.has(x.id)).map(x=>x.id);
      let order;
      if(!same(l.map(x=>x.id),ba.map(x=>x.id))&&same(r.map(x=>x.id),ba.map(x=>x.id))&&!newLocal.length)order=l.map(x=>x.id);
      else{const rest=r.map(x=>x.id);order=l.length&&newLocal.includes(l[0].id)?[...newLocal,...rest]:[...rest,...newLocal]}
      return [...new Set(order)].filter(keep).map(id=>L.has(id)&&R.has(id)?merge3(B.get(id),L.get(id),R.get(id)):(L.get(id)||R.get(id)))}
    if([l,r,ba].every(a=>a.every(x=>!isObj(x)&&!Array.isArray(x)))){const add=l.filter(x=>!ba.includes(x)),del=ba.filter(x=>!l.includes(x));
      return [...r.filter(x=>!del.includes(x)),...add.filter(x=>!r.includes(x))]}}
  return l}
async function refetch(){const{data}=await SB.from('app_state').select('json,version').eq('id','main').maybeSingle();if(data)adopt(data.json,data.version)}
async function push(){if(!SESSION||!READY||!LOADED)return;if(writing){dirty=true;return}
  writing=true;let ok=false;clearTimeout(rTimer);
  try{for(let i=0;i<6;i++){const j=sharedJson();if(j===lastJson){ok=true;break}
      const res=VER?await SB.from('app_state').update({json:j,version:VER+1,updated_at:new Date().toISOString()}).eq('id','main').eq('version',VER).select('version')
                   :await SB.from('app_state').insert({id:'main',json:j,version:1}).select('version');
      if(!res.error&&res.data&&res.data.length){VER=res.data[0].version;lastJson=j;BASE=JSON.parse(j);storeBase();continue}
      if(res.error&&VER)throw res.error;
      await refetch()}
    if(!ok)throw new Error('conflicto');
    if(SYNC!=='ok'){SYNC='ok';render()}}
  catch(e){if(e&&e.code==='42501'){
      // La base rechazó un cambio que solo puede hacer el admin: se descarta lo local y se toma lo del servidor.
      lastJson=null;writing=false;ui.toast='Un cambio no se guardó: solo el administrador puede hacerlo.';
      refetch().then(()=>{SYNC='ok';resolveMe();render()}).catch(()=>{});return}
    SYNC=navigator.onLine===false?'local':'error';render();rTimer=setTimeout(push,15000)}
  writing=false;if(dirty){dirty=false;push()}
  else if(skipped){skipped=false;refetch().then(()=>{resolveMe();softRender()}).catch(()=>{})}}
/* Volver a dibujar sin borrar lo que alguien está escribiendo: si hay un campo activo, se espera a que salga de él. */
function softRender(){if(quiet())render();else ui.needRender=true}
document.addEventListener('focusout',()=>setTimeout(()=>{if(ui.needRender&&quiet()){ui.needRender=false;render()}},250));
window.addEventListener('online',()=>{if(SESSION&&LOADED){push();refetch().then(()=>{resolveMe();softRender()}).catch(()=>{})}else if(SESSION)loadData()});
const person=id=>state.people.find(p=>p.id===id);
const me=()=>person(state.me);

let today=ds(new Date());
/* Un culto deja de mostrarse 2 h 30 min después de empezar (10:00 → 12:30, 18:30 → 21:00). */
const GONE_MIN=150;
// Cultos de la tarde (18:00/18:30): a las 20:00 ya pasaron. Domingo 10:00: a las 12:30.
function svcGone(d){if(d<today)return true;if(d>today)return false;const t=(SVC[pd(d).getDay()]||[0,'23:59'])[1].split(':').map(Number),n=new Date();const end=t[0]>=17?20*60:t[0]*60+t[1]+GONE_MIN;return n.getHours()*60+n.getMinutes()>=end}
const quiet=()=>!(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName));
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){today=ds(new Date());if(quiet())try{render()}catch(e){}
  // Al volver a la app: traer lo último (mientras el celular duerme no llegan los cambios en vivo)
  if(SESSION&&LOADED&&!writing)refetch().then(()=>{resolveMe();softRender()}).catch(()=>{})}});
setInterval(()=>{today=ds(new Date());if(document.visibilityState==="visible"&&quiet())try{render()}catch(e){}},10*60e3);
function defaultMonth(){const d=new Date();if(d.getDate()>20)d.setMonth(d.getMonth()+1,1);return `${d.getFullYear()}-${pad(d.getMonth()+1)}`}
const ui={tab:'mis',month:defaultMonth(),area:'all',view:'grid',mv:'cal',cm:defaultMonth(),sel:null,edit:null,open:null,regen:false,delp:null};
// Enlace desde la notificación de transmisión: ?tr=AAAA-MM-DD (y &a=si|no si se tocó un botón de la notificación)
try{const q=new URLSearchParams(location.search);if(/^\d{4}-\d\d-\d\d$/.test(q.get('tr')||'')){ui.trQ=q.get('tr');ui.trA=['si','no'].includes(q.get('a'))?q.get('a'):null;ui.tab='mis'}if(q.get('n'))ui.goN=q.get('n');if(q.get('go'))ui.goQ={tab:{ic:'mis',disp:'disp',hor:'hor',ens:'ens',lz:'mis',mis:'mis'}[q.get('go')]||'mis',d:/^\d{4}-\d\d-\d\d$/.test(q.get('d')||'')?q.get('d'):null,ed:q.get('go')==='ic'?'ic':null,lz:q.get('go')==='lz'?1:0};if(q.has('tr')||q.has('n')||q.has('go'))history.replaceState(null,'',location.pathname)}catch(e){}

function monthDates(ym){const[y,m]=ym.split('-').map(Number);const out=[];const d=new Date(y,m-1,1,12);while(d.getMonth()===m-1){out.push(ds(d));d.setDate(d.getDate()+1)}return out}
function mondayOf(s){const d=pd(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return ds(d)}
/* Tema sugerido para la introducción de jueves y domingo: rota en bucle desde el jueves 5 nov 2026; los domingos con transmisión no cuentan, así el tema pasa al siguiente culto. */
function introTema(date){const tr=new Set((state.trans||[]).map(t=>t.date));const d=new Date(pd('2026-11-05'));let n=0;
  while(ds(d)<date){const w=d.getDay();if((w===4||w===0)&&!tr.has(ds(d)))n++;d.setDate(d.getDate()+1)}return n%INTROT.length}
// Preámbulos sugeridos: estudio bíblico (el martes y el sábado de la misma semana llevan el mismo) y culto de transmisión
const PRE_EB=[['El pan de vida','alimento espiritual y banquete suculento'],['La fuente de agua viva','limpia, liberta'],['La vid verdadera','permanecer y dar frutos'],['Camino de la vida eterna','conduce a la salvación'],['Luz del mundo','ilumina, alumbra, buen testimonio']];
const PRE_TR=[['La Biblia','Instituto bíblico para todos'],['La universidad más importante','enseñados por Dios'],['Verdadero cambio de vida','leer y valorar con el corazón'],['Raíces de la doctrina','fundamentos del Antiguo y Nuevo Testamento'],['Maestra de Dios','perfección de los santos']];
function preEB(date){const wk=Math.floor(Math.round((pd(mondayOf(date))-pd('2026-11-09'))/864e5)/7);return PRE_EB[((wk%5)+5)%5]}
function preTR(date){const ts=[...new Set((state.trans||[]).map(t=>t.date).filter(x=>x>='2026-11-01'))].sort();const i=Math.max(0,ts.indexOf(date));return PRE_TR[i%5]}
const preTxt=x=>`<b>${esc(x[0])}</b> — ${esc(x[1])}`;
function preamb(date){const a=pd('2026-11-02'),d=pd(date);const days=Math.round((d-a)/864e5);const wk=Math.floor(days/7);const pos={1:0,3:1,5:2}[d.getDay()];return(((wk*3+pos)%6)+6)%6}
// Enseñanzas en orden sobre jueves y domingos (sin domingos de transmisión).
// Las «fijas» (pin) se quedan en su fecha y no se corren; las demás llenan las fechas libres en orden.
function teachMap(){const m={},fixed=new Set();
  for(const t of state.teachings)if(t.pin&&t.pin>=state.teachStart&&!m[t.pin]&&!state.trans.some(x=>x.date===t.pin)&&[4,0].includes(pd(t.pin).getDay())){m[t.pin]=t;fixed.add(t.id)}
  const rest=state.teachings.filter(t=>!fixed.has(t.id));let i=0;const d=pd(state.teachStart);let g=0;
  while(i<rest.length&&g<2000){const s=ds(d),w=d.getDay();
    if((w===4||w===0)&&!state.trans.some(t=>t.date===s)&&!m[s]){m[s]=rest[i];i++}
    d.setDate(d.getDate()+1);g++}
  return m}
const isPinned=t=>{if(!t.pin)return false;const tm=teachMap();return !!(tm[t.pin]&&tm[t.pin].id===t.id)};
// Regla: la enseñanza del día que predica David queda fija en su fecha (no se corre si se agrega una transmisión)
function autoPinDavid(){let ch=false;const tm=teachMap();for(const d in tm){if(d<today)continue;const t=tm[d];if(!t.pin&&!t.unpinned&&davidDay(d)){t.pin=d;t.pinAuto=1;ch=true}}return ch}
const transOn=date=>state.trans.find(t=>t.date===date);
const leipOn=date=>state.leipzig.find(l=>l.date===date);
const yList=a=>a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' y '+a[a.length-1];
const fmt=s=>{const d=pd(s);return `${DOWS[d.getDay()]} ${d.getDate()} ${MESS[d.getMonth()]}`};

function why(p,s,date,as,slots){
  if(!p.roles.includes(s.role)&&!(s.altRole&&p.roles.includes(s.altRole))) return 'no tiene esta labor';
  if(s.onlyPastor&&!p.pastor) return 'solo el pastor';
  if(s.noPastor&&p.pastor) return 'el pastor no hace esta parte';
  if(s.excl&&s.excl.includes(p.id)) return 'no va en la puerta este día';
  if(s.only&&!s.only.includes(p.id)) return 'semana de Leipzig: esta parte la hace '+s.only.map(i=>(person(i)||{name:i}).name).join(' o ');
  if(p.noSlots&&p.noSlots.includes(s.k)) return 'no hace esta parte';
  if(p.introNotWith&&s.tag==='trI'&&as.pul===p.introNotWith) return 'la introducción de púlpito la tiene '+((person(p.introNotWith)||{}).name||'');
  if(p.maxOne&&slots.some(o=>o.k!==s.k&&as[o.k]===p.id)) return 'solo hace una labor por culto';
  if(!p.days.includes(pd(date).getDay())) return 'no sirve este día de la semana';
  if(p.blocked.includes(date)) return 'marcó la fecha como no disponible';
  {const dw=pd(date).getDay();if(p.freeAlab&&(dw===1||dw===3||dw===5)){const mon=pd(mondayOf(date));
    const others=[0,2,4].map(i=>ds(new Date(mon.getTime()+i*864e5))).filter(o=>o!==date);
    const busy=o=>{const oa=GEN&&GENYM===o.slice(0,7)?GEN[o]:(state.schedules[o.slice(0,7)]||{})[o];return !!(oa&&Object.values(oa).includes(p.id))};
    if(others.every(busy))return 'necesita un día de alabanza libre esa semana'}}
  if(p.leipzig&&leipOn(date)) return 'viaja a Leipzig';
  for(const o of slots){if(o.k!==s.k&&as[o.k]===p.id&&!combo(s,o)) return 'ya está en '+o.l.toLowerCase()}
  return '';
}

function generate(ym){let best=null,bs=1e9;
  for(let i=0;i<40;i++){const r=genOnce(ym);let e=0;for(const d in r)e+=slotsAt(d).filter(s=>!r[d][s.k]).length;if(e<bs){bs=e;best=r}if(!e)break}
  state.schedules[ym]=best;save()}
/* Los días de alabanza (lun/mié/vie) en que David no tiene labor, a Gabriela le aparece «Alabanza»: ella va, sin labor. */
const ALABSWAP={free:'david',give:'gabriela',k:'sonido'};
function freeAlabDays(){const F=person(ALABSWAP.free);if(!F)return[];const out=[];
  for(const ym in state.schedules)for(const d in state.schedules[ym]){const w=pd(d).getDay();if((w===1||w===3||w===5)&&!Object.values(state.schedules[ym][d]||{}).includes(F.id))out.push(d)}
  return out.sort()}
function alabSwap(sched,ym,from){const out=[],F=person(ALABSWAP.free),G=person(ALABSWAP.give);if(!F||!G||!sched)return out;
  const weeks={};for(const d of monthDates(ym)){const w=pd(d).getDay();if((w===1||w===3||w===5)&&(!from||d>=from))(weeks[mondayOf(d)]=weeks[mondayOf(d)]||[]).push(d)}
  for(const ds_ of Object.values(weeks)){
    if(ds_.some(d=>sched[d]&&sched[d][ALABSWAP.k]===G.id&&!Object.values(sched[d]).includes(F.id)))continue;
    for(const d of ds_){const as=sched[d]=sched[d]||{};if(Object.values(as).includes(F.id))continue;
      const slots=slotsAt(d),s=slots.find(z=>z.k===ALABSWAP.k);if(!s)continue;const prev=as[s.k];if(prev===G.id)break;
      const others={...as};delete others[s.k];if(why(G,s,d,others,slots))continue;
      as[s.k]=G.id;out.push({d,prev});break}}
  return out}
let GEN=null,GENYM=null;
function genOnce(ym){
  const sched={},cnt={};GEN=sched;GENYM=ym;
  for(const date of monthDates(ym)){
    const dow=pd(date).getDay(),slots=slotsAt(date),as={},byK=Object.fromEntries(slots.map(s=>[s.k,s]));
    const score=(p,s)=>{const c=cnt[p.id]||{t:0};let v=(c[s.area]||0)*10+c.t*2+Math.random()*3;
      v+=Object.values(as).filter(x=>x===p.id).length*6;
      if(state.fixed[s.k]&&state.fixed[s.k][dow]===p.id) v-=1000;
      if(s.prefer){const i=s.prefer.indexOf(p.id);if(i>=0)v-=(s.prefer.length-i)*500}
      if(p.pref&&p.pref[s.area]&&!p.pref[s.area].includes(dow)) v+=40;
      if(p.freeAlab&&(dow===1||dow===3)) v+=60;
      if(p.predPref&&p.predPref[ym]===date&&/_pred$/.test(s.k)) v-=150;
      v+=pen(p,s,dow);return v};
    const cands=s=>state.people.filter(p=>!why(p,s,date,as,slots)).sort((a,b)=>score(a,s)-score(b,s));
    for(const k of ORDER){const s=byK[k];if(!s)continue;
      if(s.pair){const s2=byK[s.pair];
        for(const p of cands(s)){as[k]=p.id;const q=cands(s2).find(x=>x.sex===p.sex);if(q){as[s2.k]=q.id;break}delete as[k]}
        continue}
      if(k.endsWith('_test')){const pp=person(as[k.replace('test','pred')]);if(pp&&!why(pp,s,date,as,slots)){as[k]=pp.id;continue}}
      const c=cands(s)[0];if(c)as[k]=c.id}
    for(const[k,pid]of Object.entries(as)){cnt[pid]=cnt[pid]||{t:0};const a=byK[k].area;cnt[pid][a]=(cnt[pid][a]||0)+1;cnt[pid].t++}
    sched[date]=as}
  GEN=null;return sched;
}
if(!Object.keys(state.schedules).length&&state.people.length){generate(defaultMonth())}
if(!state.entFix){let hit=false;for(const id of ['carlos','alfonso','armando']){const x=person(id);if(x)x.roles=x.roles.filter(r=>r!=='entrega')}
for(const ym in state.schedules)for(const d in state.schedules[ym]){const as=state.schedules[ym][d];if(['carlos','alfonso','armando'].includes(as.ent)){delete as.ent;hit=true;const sl=slotsAt(d),s=sl.find(z=>z.k==='ent');const c=state.people.filter(p=>!why(p,s,d,as,sl))[0];if(c)as.ent=c.id}}
state.entFix=1;save()}
function refill(ym,date,k){const as=state.schedules[ym][date],sl=slotsAt(date),s=sl.find(z=>z.k===k);
  const pr=(s.pair||s.pairOf)?person(as[s.pair||s.pairOf]):null;
  const n=id=>Object.values(state.schedules[ym]).reduce((a,v)=>a+Object.values(v).filter(z=>z===id).length,0);
  const pf=x=>s.prefer&&s.prefer.includes(x.id)?s.prefer.indexOf(x.id)-99:0;
  const dw=pd(date).getDay(),sc=x=>pf(x)*1000+pen(x,s,dw)+n(x.id)*10;
  const c=state.people.filter(x=>!why(x,s,date,as,sl)&&(!pr||pr.sex===x.sex)).sort((a,b)=>sc(a)-sc(b));
  if(c.length){as[k]=c[0].id;return true}return false}
function fixDate(date){const ym=date.slice(0,7);const S=state.schedules[ym];if(!S||!S[date])return;const as=S[date],sl=slotsAt(date);
  for(const k in as)if(!sl.some(z=>z.k===k))delete as[k];
  for(const s of sl)if(s.only&&s.only.length===1){const id=s.only[0];for(const k in as)if(as[k]===id&&k!==s.k)delete as[k]}
  const keys=[...ORDER.flatMap(k=>{const s=sl.find(z=>z.k===k);return s?(s.pair?[k,s.pair]:[k]):[]})];
  for(const k of keys){const s=sl.find(z=>z.k===k),p=person(as[k]);if(p&&why(p,s,date,as,sl))delete as[k]}
  for(const k of keys)if(!as[k])refill(ym,date,k);
  for(const k of ['grd1','grd2','grd3'])if(sl.some(z=>z.k===k)&&!as[k])forceGrd(ym,date,k)}
/* Guardar ofrendas tiene prioridad: si nadie está libre, se toma a una principal o reemplazo disponible y se la libera de otras labores. */
function forceGrd(ym,date,k,exclude){const as=state.schedules[ym][date],sl=slotsAt(date),s=sl.find(z=>z.k===k);
  const used=new Set(['grd1','grd2','grd3'].map(x=>as[x]).filter(Boolean));
  const clash=p=>sl.filter(o=>o.k!==k&&as[o.k]===p.id&&(!combo(s,o)||p.maxOne));
  const c=state.people.filter(p=>!used.has(p.id)&&p.id!==exclude&&!why(p,s,date,{},sl)).sort((a,b)=>pen(a,s,0)-pen(b,s,0)||clash(a).length-clash(b).length);
  const p=c[0];if(!p)return null;
  const freed=clash(p).map(o=>o.k);for(const f of freed)delete as[f];
  as[k]=p.id;for(const f of freed)refill(ym,date,f);return{p,freed}}
function migrate(){let ch=false;
  if(!state.davidFix){const d=person('david');
    if(d){d.days=d.days.filter(x=>x!==1);d.freeAlab=true;
      for(const ym in state.schedules){const S=state.schedules[ym];
        for(const date of Object.keys(S).sort())if(pd(date).getDay()===1)for(const k in S[date])if(S[date][k]==='david'){delete S[date][k];refill(ym,date,k)}
        for(const date of Object.keys(S).sort()){if(pd(date).getDay()!==3)continue;const fri=ds(new Date(pd(date).getTime()+2*864e5));
          if(!S[fri])continue;const hasD=x=>Object.values(S[x]).includes('david');if(!hasD(date)||!hasD(fri))continue;
          let best=null;
          for(const day of [date,fri]){const snap=JSON.stringify(S[day]);const ks=Object.keys(S[day]).filter(k=>S[day][k]==='david');ks.forEach(k=>delete S[day][k]);
            const ok=ks.filter(k=>refill(ym,day,k)).length;const res=JSON.stringify(S[day]);S[day]=JSON.parse(snap);
            if(!best||ok-ks.length>best.score)best={day,res,score:ok-ks.length}}
          S[best.day]=JSON.parse(best.res)}}}
    state.davidFix=1;ch=true}
  if(!state.leipFix){if(state.leipzig.length===1&&/ejemplo/.test(state.leipzig[0].teaching||''))state.leipzig=[];
    for(const d of ['2026-11-14','2026-11-28'])if(!state.leipzig.some(l=>l.date===d))state.leipzig.push({id:uid(),date:d,teaching:''});
    for(const d of ['2026-11-12','2026-11-26','2026-11-22'])fixDate(d);state.leipFix=1;ch=true}
  if(!state.pubFix){state.published=state.published||{};for(const ym in state.schedules)if(ym<='2026-11')state.published[ym]=Date.now();state.avReqs=state.avReqs||{};state.pubFix=1;ch=true}
  if(!state.phoneFix){for(const x of state.people)delete x.birthday;state.phoneFix=1;ch=true}
  if(!state.lateFix){for(const x of state.people)delete x.late;state.lateFix=1;ch=true}
  if(!state.grdFix){const t=person('tomasa');if(t&&t.name==='Tomasa')t.name='Tomasa P.';const mr=person('marion');if(mr&&mr.name==='Marion')mr.name='Marion D.';for(const id of ['gabriela','denisse']){const x=person(id);if(x&&!x.roles.includes('guardar_sup'))x.roles.push('guardar_sup')}
    for(const ym in state.schedules)for(const d of Object.keys(state.schedules[ym]).sort())if([0,4].includes(pd(d).getDay()))fixDate(d);state.grdFix=1;ch=true}
  if(!state.gabyAlabUndo){let r=null;try{r=SESSION&&realMe()}catch(e){}if(r&&r.admin){
      if(state.gabyAlab){const re=/^Ya no te toca sonido el \S+ (\d+) (\w+): lo hace Gabriela\.$/;
        for(const n of state.notifs.slice()){const m=re.exec(n.text||'');if(!m||!n.to||!n.to[0])continue;const mi=MESS.indexOf(m[2]);if(mi<0)continue;
          const d=`${pd(today).getFullYear()}-${pad(mi+1)}-${pad(+m[1])}`,as=(state.schedules[d.slice(0,7)]||{})[d];
          if(as&&as.sonido==='gabriela'){as.sonido=n.to[0];notify([n.to[0]],`Corrección: el sonido del ${fmt(d)} sigue siendo tuyo. Disculpa el aviso anterior.`);notify(['gabriela'],`Corrección: el ${fmt(d)} no te toca sonido. Ese día solo vas a la alabanza.`)}}}
      state.gabyAlab=1;state.gabyAlabUndo=1;ch=true}}
  if(!state.ruleFix3){const a=person('aicardo');if(a)a.days=[0];const g=person('gabriela');if(g){g.noSlots=[...new Set([...(g.noSlots||[]),'en_test','de_test'])];g.maxOne=true;g.introNotWith='david'}
    for(const ym in state.schedules)for(const d of Object.keys(state.schedules[ym]).sort())fixDate(d);state.ruleFix3=1;ch=true}
  if(!state.roxFix){const r=person('roxana');if(r){r.avoidSlots=['de_intro'];r.avoidDays=[4];r.favorSlots=['de_pred','de_test']}state.roxFix=1;ch=true}
  if(!state.davidFix2){const d=person('david');
    if(d){if(!d.days.includes(1))d.days.push(1);if(!d.blocked.includes('2026-11-02'))d.blocked.push('2026-11-02');
      for(const ym in state.schedules){const S=state.schedules[ym];
        for(const date of Object.keys(S).sort()){const sl=slotsAt(date);for(const s of sl)if(!S[date][s.k])refill(ym,date,s.k)}}}
    state.davidFix2=1;ch=true}
  return ch}
if(migrate())save();

/* ---------- vistas ---------- */
const ICON={
 mis:'<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 13l2 2 4-4"/></svg>',
 cal:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2"/></svg>',
 disp:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5"/></svg>',
 hor:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11M15 9v11"/></svg>',
 ens:'<svg viewBox="0 0 24 24"><path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z"/><path d="M12 6v13.5"/></svg>',
 per:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3 19c.9-3 3.2-4.5 6-4.5s5.1 1.5 6 4.5M15.5 14.6c2.6-.3 4.6.9 5.5 3.9"/></svg>'
};
ICON.aj='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
const CALI=ICON.cal;
const canSeeAll=p=>p.admin||p.pastor||p.roles.includes('pulpito');
function tabsFor(p){const t=[['mis','Labores'],['cal','Calendario']];if(p.roles&&p.roles.length&&avPending(p).length)t.push(['disp','Mis días']);
  if(canSeeAll(p))t.push(['hor','Horario']);
  if(p.admin||p.pastor||p.roles.includes('pulpito')||p.roles.some(r=>r.startsWith('trad')))t.push(['ens',p.admin||p.pastor?'Pastor':'Predicaciones']);
  if(p.admin)t.push(['per','Personas']);return t}

function authView(){const m=ui.authMode||'login';const msg=ui.authMsg?`<div class="banner ${ui.authOk?'ok':'warnbn'}">${esc(ui.authMsg)}</div>`:'';
  const head=`<div class="wrap"><div class="top"><div class="brand">Labores Berlín<small>Pistoriusstraße 114 · Berlín</small></div></div>`;
  if(m==='newpass')return head+`<h2>Nueva contraseña</h2>${msg}<div class="card"><label class="field">Contraseña nueva${pwIn('new-password',false)}</label><button class="btn" data-a="auth-newpass">Guardar contraseña</button></div></div>`;
  const em=`<label class="field">Correo<input id="au-email" type="email" autocomplete="email" required value="${esc(ui.authEmail||'')}"></label>`;
  if(m==='signup')return head+`<div class="authbox">
   <div class="authtag">Primera vez</div><h2 style="margin-top:6px">Crear tu cuenta</h2>
   <ol class="steps"><li>Escribe el <b>correo que le diste al administrador</b>.</li><li>Elige una contraseña de <b>al menos 6 caracteres</b>.</li></ol>${msg}
   <form class="card signup" id="auth-form" data-mode="signup">${em}<label class="field">Elige tu contraseña${pwIn('new-password',true)}</label>
   <label class="chk" style="margin:4px 0 12px"><input type="checkbox" id="au-priv" required> <span>He leído y acepto el <button type="button" class="linkbtn" data-a="priv-open" style="font-size:inherit;min-height:0;padding:0">aviso de privacidad</button></span></label>
   <button class="btn" type="submit" style="width:100%">Crear cuenta</button></form>
   <p class="authalt">¿Ya tienes cuenta? <button class="linkbtn" data-a="auth-mode" data-v="login">Entrar</button></p></div></div>`;
  if(m==='reset')return head+`<div class="authbox"><h2>Recuperar contraseña</h2><p class="lead">Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.</p>${msg}
   <form class="card" id="auth-form" data-mode="reset">${em}<button class="btn" type="submit" style="width:100%">Enviar correo</button></form>
   <p class="authalt"><button class="linkbtn" data-a="auth-mode" data-v="login">Volver a entrar</button></p></div></div>`;
  return head+`<div class="authbox"><img class="authlogo" src="icon-192.png" alt="" width="64" height="64"><h2 style="text-align:center;margin-top:10px">Bienvenido</h2>
   <p class="lead" style="text-align:center">Entra con tu correo y contraseña para ver tus labores.</p>${msg}
   <form class="card" id="auth-form" data-mode="login">${em}<label class="field">Contraseña${pwIn('current-password',true)}</label>
   <button class="btn" type="submit" style="width:100%">Entrar</button>
   <button class="linkbtn" type="button" data-a="auth-mode" data-v="reset" style="display:block;margin:14px auto 2px">Olvidé mi contraseña</button></form>
   <div class="authsep"><span>¿Primera vez aquí?</span></div>
   <button class="btn ghost" data-a="auth-mode" data-v="signup" style="width:100%">Crear cuenta</button>
   <p class="authalt"><button class="linkbtn" data-a="priv-open" style="font-size:14px;font-weight:500">Aviso de privacidad</button></p></div></div>`}
const AUTHERR=e=>{const t=(e&&e.message||'').toLowerCase();if(t.includes('invalid login'))return'Correo o contraseña incorrectos.';if(t.includes('not confirmed'))return'Primero confirma tu correo: revisa tu bandeja de entrada.';if(t.includes('already registered'))return'Ese correo ya tiene cuenta. Usa "Ya tengo cuenta".';if(t.includes('password'))return'La contraseña debe tener al menos 6 caracteres.';return'No se pudo completar. Revisa tu conexión e intenta de nuevo.'};
function pwIn(ac,req){return `<span class="pwrap"><input id="au-pass" type="password" autocomplete="${ac}" minlength="6"${req?' required':''}><button type="button" class="pweye" data-pw aria-label="Mostrar contraseña">Ver</button></span>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pw]');if(!b)return;e.preventDefault();e.stopPropagation();const i=$('au-pass');if(!i)return;const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Ocultar':'Ver';b.setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña')},true);
document.addEventListener('submit',async e=>{if(e.target.id!=='auth-form')return;e.preventDefault();const m=e.target.dataset.mode,email=$('au-email').value.trim(),pass=$('au-pass')?$('au-pass').value:'';ui.authEmail=email;ui.authMsg='';ui.authOk=false;
  let r;if(m==='login')r=await SB.auth.signInWithPassword({email,password:pass});
  else if(m==='signup'){try{localStorage.setItem('lb-priv',window.PRIV_V+'|'+Date.now()+'|'+email.toLowerCase())}catch(e){}r=await SB.auth.signUp({email,password:pass,options:{emailRedirectTo:location.origin+location.pathname}});if(!r.error){ui.authOk=true;ui.authMsg='Te enviamos un correo. Ábrelo y toca el enlace para confirmar tu cuenta.'}}
  else{r=await SB.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(!r.error){ui.authOk=true;ui.authMsg='Listo. Revisa tu correo para crear una contraseña nueva.'}}
  if(r&&r.error){ui.authMsg=AUTHERR(r.error)}render()});
function render(){if(ui.flash&&ui.flashFor!==ui.flash){ui.flashFor=ui.flash;clearTimeout(ui.flashT);ui.flashT=setTimeout(()=>{ui.flash=null;ui.flashFor=null;try{render()}catch(e){}},5000)}if(window.__MOVED)return;
  const p=me();
  if((ui.goN||ui.goQ)&&READY&&p&&!ui.gating){const n=ui.goN&&state.notifs.find(x=>x.id===ui.goN),g=ui.goQ||(n?goFor(n,p):null);ui.goN=null;ui.goQ=null;if(n&&!n.read.includes(state.me)){n.read.push(state.me);save()}if(g){setTimeout(()=>nGo(g),0)}}
  if(READY&&p&&(p.admin||p.pastor)&&!ui.viewAs&&autoPinDavid())save();
  if(ui.trA&&READY&&p&&(p.pastor||p.admin)){const a=ui.trA;ui.trA=null;trAnswer(ui.trQ,a);save()}
  if(!SESSION||ui.authMode==='newpass'){$('app').innerHTML=authView()+(ui.priv?privSheet():'');return}
  if(!READY){$('app').innerHTML=`<div class="wrap"><div class="top"><div class="brand">Labores Berlín<small>Pistoriusstraße 114 · Berlín</small></div></div><div class="card empty-state">Cargando tus labores…</div></div>`;return}
  if(!p){$('app').innerHTML=`<div class="wrap"><div class="top"><div class="brand">Labores Berlín<small>Pistoriusstraße 114 · Berlín</small></div><button class="who" data-a="logout">Salir</button></div>
    <h2>Tu correo aún no está registrado</h2><p class="lead">Entraste como <b>${esc(SESSION.user.email)}</b>, pero ese correo no está asignado a ningún hermano. Pide al administrador que lo agregue en Personas y vuelve a entrar.</p></div>`;return}
  appBadge(p);
  const tabs=tabsFor(p);if(ui.tab!=='aj'&&!tabs.some(t=>t[0]===ui.tab))ui.tab='mis';
  {const r=realMe();if(r&&!privOk(r)){let pend='';try{pend=localStorage.getItem('lb-priv')||''}catch(e){}const pe=pend.split('|');if(pe[0]===window.PRIV_V&&(!pe[2]||pe[2]===((SESSION&&SESSION.user.email)||'').toLowerCase())){r.privacy={v:window.PRIV_V,ts:+pend.split('|')[1]||Date.now()};try{localStorage.removeItem('lb-priv')}catch(e){}save()}}}
  const gate=!ui.viewAs&&!privOk(realMe());
  let body;try{body=gate?privGate(p):{mis:DESK()?vDash:vMis,cal:vCal,disp:vDisp,hor:vHor,ens:vEns,per:vPer,aj:vAj}[ui.tab](p)}catch(e){console.error(e);body=`<div class="card" style="margin-top:10px"><b>Algo falló al mostrar esta pantalla.</b><div class="info" style="margin:6px 0 10px">Avísale al administrador. Detalle: ${esc(String(e&&e.message||e))}</div><button class="btn sm" data-a="upd">Recargar</button></div>`}
  const dash=DESK()&&ui.tab==='mis'&&!gate;
  $('app').innerHTML=`<div class="wrap ${(ui.tab==='hor'&&ui.view==='grid')||(ui.tab==='cal'&&ui.mv==='equipo')?'wide':''} ${dash?'dash':''}"><div class="top"><div class="brand">Labores Berlín<small>Pistoriusstraße 114</small></div>
    ${hdr(p)}</div>${ui.viewAs?`<div class="viewas">Viendo como <b>${esc(p.name)}</b><button class="linkbtn" data-a="logout">Volver a mi cuenta</button></div>`:''}
    ${ui.upd?`<div class="banner ok" style="display:flex;align-items:center;justify-content:space-between;gap:10px">Hay una versión nueva (${esc(ui.upd)}).<button class="btn sm" data-a="upd">Actualizar</button></div>`:''}${ui.toast?`<div class="banner warnbn">${esc(ui.toast)}</div>`:''}<div class="banner ${SYNC==='ok'?'':'warnbn'}" ${SYNC==='ok'?'hidden':''}>${{ok:'',loading:'Conectando…',slow:'La conexión está lenta. Lo que ves puede no estar al día.',local:'Sin conexión: los cambios quedan solo en este aparato.',error:'No se pudo guardar. Revisa la conexión a internet.'}[SYNC]}</div><div class="pg">${body}</div></div>
    <nav class="tabs" ${gate?'hidden':''}><div class="sbrand"><img src="icon-192.png" alt="" width="40" height="40"><div>Labores Berlín<small>Pistoriusstraße 114</small></div></div>${tabs.map(([k,l])=>{const b=k==='mis'?pendingFor(p).length+myMeets(p).filter(m=>!m.rsvp[p.id]).length+introPend(p).length:0;return `<button data-a="tab" data-v="${esc(k)}" ${ui.tab===k?'aria-current="page"':''}>${ICON[k]}${l}${b?`<span class="bdg">${b}</span>`:''}</button>`}).join('')}<button class="sonly" data-a="tab" data-v="aj" ${ui.tab==='aj'?'aria-current="page"':''}>${ICON.aj}Ajustes</button><div class="sfoot"><i></i>Versión ${APPV}</div></nav>${ui.priv?privSheet():''}${ui.flash?`<div class="toast" role="status">${esc(ui.flash)}</div>`:''}${ui.menu?menuSheet(p):''}${ui.edit&&ui.tab==='hor'&&p.admin?pickSheet():''}${ui.mrow&&ui.tab==='hor'?mrowSheet(p):''}${ui.hmenu&&ui.tab==='hor'&&p.admin?hmenuSheet():''}${ui.bell?bellSheet(p):''}`;
}
const $=id=>document.getElementById(id);
/* Número rojo en el ícono de la app instalada: avisos sin leer + cosas por hacer (reemplazos, reuniones, introducción). */
let BADGE=-1;function appBadge(p){if(ui.viewAs||!('setAppBadge' in navigator))return;const n=unreadFor(p)+pendingFor(p).length+introPend(p).length;if(n===BADGE)return;BADGE=n;
  try{(n?navigator.setAppBadge(n):navigator.clearAppBadge()).catch(()=>{})}catch(e){}}
const chip=(area,label)=>`<span class="chip" style="--c:var(${AREAC[area]})">${esc(label)}</span>`;

const SHORT={pulpito:'Púlpito',puerta:'Puerta',sonido:'Sonido',trad:'Traduc.',ofr:'Ofrend.',mic:'Micróf.'};
function weeksOf(ym){const w={};for(const d of monthDates(ym))(w[mondayOf(d)]=w[mondayOf(d)]||[]).push(d);return w}
function myAreas(p){const s=new Set(p.roles.filter(r=>r!=='entrega').map(r=>ROLEAREA[r]));if(p.pastor)s.add('pulpito');return['pulpito','puerta','sonido','trad','ofr','mic'].filter(a=>s.has(a))}
function myItems(p){
  const items={};const add=d=>(items[d]=items[d]||{slots:[],notes:[]});
  const isPul=p.roles.includes('pulpito')||p.pastor, isTrad=p.roles.some(r=>r.startsWith('trad'));
  for(const ym in state.schedules)if(canSeeMonth(p,ym))for(const date in state.schedules[ym]){
    const as=state.schedules[ym][date],w=pd(date).getDay();
    for(const s of slotsAt(date))if(as[s.k]===p.id)add(date).slots.push(s);
  }
  for(const t of state.trans)if(isPul)add(t.date).notes.push({l:'Transmisión internacional',h:svcGone(t.date)?'Ya pasó.':t.link?`<div class="pre">${linkify(t.link)}</div>`:'<span class="fv empty">Aún sin datos (enlace y hora)</span>'});
  if(p.pastor&&p.roles.includes('pulpito')){const tm=teachMap();for(const d in tm){if(!canSeeMonth(p,d.slice(0,7))||transOn(d)||davidDay(d))continue;const it=add(d);it.attend=true;it.preach=true}}
  if(p.id===ALABSWAP.give)for(const d of freeAlabDays()){if(canSeeMonth(p,d.slice(0,7))&&!(items[d]&&items[d].slots.length)){const it=add(d);it.attend=true;it.notes.unshift({l:'Alabanza',h:'Ese día vas tú a la alabanza. No tienes labor.'})}}
  for(const m of myMeets(p))add(m.date).notes.push({l:'Reunión',h:`<div class="tv">${esc(m.title)}</div>${m.time?`<div class="sub2">${esc(m.time)}</div>`:''}`});
  for(const l of state.leipzig)add(l.date).notes.push({l:'Visita a Leipzig',h:`<div class="tv">${esc(l.teaching||'Predicación por definir')}</div>${p.leipzig?'<div class="sub2">Viajas este día</div>':(l.going||[]).includes(p.id)?'<div class="sub2">Vas a ir</div>':''}${seesLzGoing(p)?`<div class="sub2">${lzGoingLine(l)}</div>`:''}${fichaRows('l',l,lzLangs(p))}${lzLangs(p).length&&l.date>=today?linkRep('l',l,l.date,lzLangs(p),null):''}`});
  return items;
}
/* ---- Tarjeta de un día (diseño «primero lo que te toca hacer»):
   arriba, en dorado, lo que prepara esta persona según su labor; debajo, la información del culto en secciones. ---- */
const ckRow=(st,label,val,btn)=>`<div class="ck"><span class="dot ${st==='todo'?'need':st}" aria-hidden="true">${st==='done'?'✓':st==='todo'?'!':''}</span><div class="ckm"><div class="fl2">${label}</div>${val}</div>${btn||''}</div>`;
const penBtn=(k,lbl)=>`<button class="pen big" data-a="ne-edit" data-v="${esc(k)}" aria-label="${esc(lbl)}">${PENCIL}</button>`;
const todoBox=(title,body)=>`<div class="todo"><div class="tl">${title}</div>${body}</div>`;
const isec=(l,h,c)=>`<div class="isec">${l?`<div class="il${c?' '+c:''}">${l}</div>`:''}${h}</div>`;
// Fichas de interpretación como filas: ✓ si está el enlace, «!» si todavía no está
function fichaRows(kind,t,langs){if(!t||!langs.length)return'';return `<div class="fichs">${langs.map(l=>t[LINKF[l]]?`<div>${xlink(t[LINKF[l]],`Ficha en ${LANGN[l]}`)}</div>`:`<div class="fv empty">Ficha en ${LANGN[l]}: todavía no está</div>`).join('')}</div>`}
// Lo que puso quien da la introducción (para quien predica y los intérpretes)
function introInfo(d,ip,test=true){const x=introOf(d);
  return `<div class="tv">${ip?esc(ip.name):'Sin asignar'}</div><div class="kv"><span>Tema</span>${esc(INTROT[introTema(d)])}</div>`+
    `<div class="kv"><span>Cita bíblica</span>${x.cita?esc(x.cita):'<i>todavía no la puso</i>'}</div>`+
    (test?`<div class="kv"><span>Testimonio</span>${x.link?xlink(x.link,'Ver el testimonio'):x.noLink?'No hay testimonio':'<i>todavía no lo puso</i>'}</div>`:'')}
// Quien da la introducción: cita (obligatoria), testimonio (opcional) y tema sugerido
/* Recordatorio para quien da la introducción, solo el mismo día: falta la cita o el enlace del testimonio.
   El testimonio no es obligatorio: con «No tengo testimonio» deja de recordarse. */
function introPend(p){if(!p)return[];const out=[],end=today;
  for(const ym in state.schedules){if(!canSeeMonth(p,ym))continue;for(const d in state.schedules[ym]){
    if(d<today||d>end||svcGone(d)||transOn(d)||![4,0].includes(pd(d).getDay())||state.schedules[ym][d].pul!==p.id)continue;
    const x=introOf(d),cita=!x.cita,link=!x.link&&!x.noLink;if(cita||link)out.push({d,cita,link})}}
  return out.sort((a,b)=>a.d<b.d?-1:1)}
function introNag(p){return introPend(p).slice(0,1).map(x=>{const falta=[x.cita&&'la cita bíblica',x.link&&'el enlace del testimonio (si tienes)'].filter(Boolean).join(' y ');
  return `<div class="card nag"><span class="rdot" aria-hidden="true"></span><div style="flex:1;min-width:0"><b>Tu introducción del ${DOW[pd(x.d).getDay()].toLowerCase()} ${fmt(x.d).replace(/^\S+\s/,'')}</b><div class="sub2">Todavía no has puesto ${falta}.</div>
    <button class="btn sm" data-a="ic-go" data-v="${esc(x.d+'|'+(x.cita?'ic':'it'))}" style="margin-top:10px">${x.cita?'Poner la cita':'Poner el enlace'}</button></div></div>`}).join('')}
function introTodo(d){const x=introOf(d),kc='ic|'+d,kl='it|'+d;
  const cita=ui.edName===kc?`<div class="fl2" style="margin-top:8px">Cita bíblica que leerás</div>${nameEd('ic',d,x.cita||'','Por ejemplo: Juan 3:16')}`
    :ckRow(x.cita?'done':'todo','Cita bíblica que leerás',x.cita?`<div class="fv">${esc(x.cita)}</div>`:'<div class="fv empty">Falta ponerla</div>',penBtn(kc,x.cita?'Cambiar la cita':'Poner la cita'));
  const tes=ui.edName===kl?`<div class="fl2" style="margin-top:8px">Testimonio (si tienes)</div>${linkEd('it',d,x.link,'Pega aquí el enlace del testimonio')}`
    :ckRow(x.link?'done':x.noLink?'opt':'todo','Testimonio (si tienes)',x.link?xlink(x.link,'Ver el testimonio'):x.noLink?'<div class="fv empty">Sin testimonio</div>':'<div class="fv empty">Falta el enlace</div>',penBtn(kl,x.link?'Cambiar el enlace':'Poner el enlace'));
  return todoBox('Tu introducción',cita+tes+`<div class="tsec"><div class="fl2">Tema sugerido</div><div class="tv">${esc(INTROT[introTema(d)])}</div></div><div class="help">Los intérpretes ven la cita y el testimonio para prepararse.</div>`)}
function itemCard(d,it,tm){const w=pd(d).getDay(),dd=pd(d);const[sn,st]=SVC[w];
  const as=schedOf(d)||{},has=f=>it.slots.some(f),todo=[],info=[];
  const t=tm[d],tr=transOn(d),dday=davidDay(d);
  const preacher=dday?person(as.predica):state.people.find(x=>x.pastor&&x.roles.includes('pulpito'));
  const isIntro=(w===4||w===0)&&has(s=>s.k==='pul')&&!tr;
  const preaching=it.preach||has(s=>s.k==='predica');
  const isTrad=has(s=>s.area==='trad');
  // 1. Lo que prepara esta persona
  if(preaching&&t)todo.push(todoBox('Tu predicación',`<div class="big2">${esc(t.title)}</div>`));
  if(isIntro)todo.push(introTodo(d));
  if(has(s=>s.k==='pul_ini'||s.k==='pul_fin'))info.push(isec('Preámbulo sugerido',`<div class="tv">${esc(PREAMB[preamb(d)])}</div>`,'gold'));
  if((w===2||w===6)&&has(s=>s.k==='pul')){const x=preEB(d);info.push(isec('Preámbulo sugerido',`<div class="tv">${esc(x[0])}</div><div class="sub2">${esc(x[1])}</div>`,'gold'))}
  if(w===0&&tr&&has(s=>s.k==='pul')){const x=preTR(d);todo.push(todoBox('Preámbulo sugerido',`<div class="big2">${esc(x[0])}</div><div class="sub2">${esc(x[1])}</div>`))}
  const trIntro=has(s=>s.area==='trad'&&/_intro$/.test(s.k)),trPred=has(s=>s.area==='trad'&&/_(pred|test)$/.test(s.k));
  if(trIntro&&(w===4||w===0)&&!tr)todo.push(todoBox('Interpretas la introducción',introInfo(d,person(as.pul))));
  const trP=has(s=>s.area==='trad'&&/_pred$/.test(s.k)),trT=has(s=>s.area==='trad'&&/_test$/.test(s.k)),xi=introOf(d);
  if(trPred&&(w===4||w===0)&&t)todo.push(todoBox(trP&&trT?'Interpretas la predicación y los testimonios':trT?'Interpretas los testimonios':'Interpretas la predicación',`<div class="big2">${esc(t.title)}</div><div class="sub2">Predica: ${preacher?esc(preacher.name):'sin asignar'}</div>`+fichaRows('t',t,tradLangs(me()))+linkRep('t',t,d,tradLangs(me()),dday?preacher:null)));
  for(const s of it.slots)if(s.pair||s.pairOf){const o=person(as[s.pair||s.pairOf]),n=(s.l.match(/pareja \d/)||['pareja'])[0];info.push(isec(`Tu pareja (${n})`,`<div class="tv">${o?esc(o.name):'<i>Sin asignar todavía</i>'}</div>`))}
  // 2. Información del culto
  if((w===4||w===0)&&t&&!preaching&&has(s=>s.area==='pulpito'||s.area==='trad')){
    if(!trPred)info.unshift(isec('Enseñanza del culto',`<div class="tv">${esc(t.title)}</div><div class="sub2">Predica: ${preacher?esc(preacher.name):'sin asignar'}</div>`+(isTrad?fichaRows('t',t,tradLangs(me())):'')));
    if(trPred&&!trIntro&&!tr)info.push(isec('Introducción',introInfo(d,person(as.pul),false)))}
  for(const n of it.notes)info.push(typeof n==='string'?isec('',n):isec(n.l,n.h));
  return `<div class="card mine v2" data-day="${esc(d)}"><div class="dbox"><b>${dd.getDate()}</b><span>${MESS[dd.getMonth()]}</span></div><div style="min-width:0">
    <div class="svc">${DOW[w]} · ${it.slots.length||it.attend?sn:'Aviso'} <small>${it.slots.length||it.attend?st:''}</small></div>
    ${it.slots.length?`<div class="chips">${it.slots.map(s=>chip(s.area,s.l)).join('')}</div>`:''}</div>
    ${todo.length||info.length?`<div class="cbody">${todo.join('')}${info.length?`<div class="infos">${info.join('')}</div>`:''}</div>`:''}
    ${it.slots.length&&d>=today?`<div class="cbody">${actions(d,it)}</div>`:''}</div>`}
/* ---- avisos y reemplazos ---- */
const schedOf=d=>(state.schedules[d.slice(0,7)]||{})[d];
const snapDays=dates=>{const o={};for(const d of dates)o[d]={...(schedOf(d)||{})};return o};
/* Después de un cambio del admin (Leipzig, volver a generar, quitar persona): avisa a quien entra y a quien sale.
   Solo meses publicados y cultos que no pasaron; un solo aviso por persona. Devuelve a cuántos se avisó. */
function schedDiffNotify(before){const per={};
  for(const d in before){const ym=d.slice(0,7);if(!isPub(ym)||d<today||svcGone(d))continue;const a=before[d]||{},b=schedOf(d)||{};
    const when=`el ${DOW[pd(d).getDay()].toLowerCase()} ${fmt(d).replace(/^\S+\s/,'')}`;
    for(const k of new Set([...Object.keys(a),...Object.keys(b)])){if(a[k]===b[k])continue;const s=slotOf(d,k),lbl=s?s.l:k;
      if(b[k])(per[b[k]]=per[b[k]]||{in:[],out:[]}).in.push(`${lbl} ${when}`);
      if(a[k])(per[a[k]]=per[a[k]]||{in:[],out:[]}).out.push(`${lbl} ${when}`)}}
  let n=0;for(const id in per){const x=per[id],parts=[];if(x.in.length)parts.push('ahora te toca '+x.in.join('; '));if(x.out.length)parts.push('ya no te toca '+x.out.join('; '));
    const txt=`Cambio en el horario: ${parts.join('. Y ')}.`;n+=notify([id],txt,{push:{title:'Cambio en tu horario',body:txt.replace(/^Cambio en el horario: /,'')}})}
  return n}
const admins=()=>state.people.filter(x=>x.admin).map(x=>x.id);
function svcPeople(d,pred){const as=schedOf(d)||{},out=[];for(const s of slotsAt(d))if(as[s.k]&&pred(s))out.push(as[s.k]);return out}
function notify(to,text,extra){const ids=[...new Set(to)].filter(i=>i&&i!==state.me&&person(i)&&!person(i).deleted);if(!ids.length)return 0;const nid=uid();state.notifs.unshift({id:nid,ts:Date.now(),to:ids,text,read:[],by:state.me,...(extra&&extra.push?(({push,...r})=>r)(extra):(extra||{}))});pushOut(ids,extra&&extra.push?extra.push.title:'Labores Berlín',extra&&extra.push?extra.push.body:text,'/?n='+nid);state.notifs=state.notifs.slice(0,300);return ids.length}
function candFor(d,k,from,asIn){const slots=slotsAt(d),s=slots.find(z=>z.k===k),as={...(asIn||schedOf(d)||{})};delete as[k];
  const partner=(s.pair||s.pairOf)?person(as[s.pair||s.pairOf]):null;
  return state.people.filter(x=>x.id!==from&&!why(x,s,d,as,slots)&&(!partner||partner.sex===x.sex))}
const slotOf=(d,k)=>slotsAt(d).find(z=>z.k===k);
function emptyLbl(d,k,def){return state.reqs.some(r=>r.date===d&&r.k===k&&r.status==='open')?'Buscando reemplazo':def}
function actions(d,it){const real=it.slots.filter(s=>s.k);
  if(ui.panel&&ui.panel.d===d){
    if(ui.panel.t==='out')return `<div class="panel"><b>¿Seguro que no puedes ir?</b><ul class="pl">${real.map(s=>{const c=candFor(d,s.k,state.me);return `<li>${esc(s.l)}: ${c.length?`se pregunta a ${c.map(x=>esc(x.name)).join(', ')}`:'<b>no hay nadie disponible</b>, se avisa al administrador'}</li>`}).join('')}</ul>
      <div class="inline"><button class="btn warnb sm" data-a="out-yes" data-v="${esc(d)}">Sí, pedir reemplazo</button><button class="btn ghost sm" data-a="panel-x">Cancelar</button></div>
      <div class="info" style="margin-top:6px">El primero que acepte queda asignado. Tu equipo, los de púlpito y el administrador reciben el aviso.</div></div>`;
    return `<div class="panel"><label class="field" style="margin-bottom:8px">Mensaje para el equipo<textarea id="late-msg" rows="2" placeholder="Por ejemplo: llego unos 15 minutos tarde"></textarea></label>
      <div class="inline"><button class="btn sm" data-a="late-yes" data-v="${esc(d)}">Enviar aviso</button><button class="btn ghost sm" data-a="panel-x">Cancelar</button></div>
      <div class="info" style="margin-top:6px">Lo recibe tu equipo de ese culto, los de púlpito y el administrador.</div></div>`}
  return `<div class="acts">${real.length?`<button class="btn ghost sm" data-a="out-open" data-v="${esc(d)}">No puedo ir</button>`:''}<button class="btn ghost sm" data-a="late-open" data-v="${esc(d)}">Llego tarde</button></div>`}
function outReq(d){const p=me(),as=schedOf(d);if(!as)return;
  const mine=slotsAt(d).filter(s=>as[s.k]===p.id);
  for(const s of mine)delete as[s.k];
  if(!p.blocked.includes(d))p.blocked.push(d);
  for(const s of mine){
    if(s.tag==='grd'){const r=forceGrd(d.slice(0,7),d,s.k,p.id);
      if(r){notify([r.p.id],`Te toca guardar las ofrendas el ${fmt(d)}: reemplazas a ${p.name.replace(/\.$/,'')}.${r.freed.length?' Se te liberó de: '+r.freed.map(k=>slotOf(d,k).l.toLowerCase()).join(', ')+'.':''}`);
        notify([...svcPeople(d,z=>z.area==='ofr'||z.area==='pulpito'),...admins()],`${r.p.name} reemplaza a ${p.name} guardando las ofrendas el ${fmt(d)}.`);
        state.reqs.push({id:uid(),date:d,k:s.k,from:p.id,cands:[],declined:[],status:'done',by:r.p.id,ts:Date.now()})}
      else notify(admins(),`${p.name} no puede guardar las ofrendas el ${fmt(d)} y no hay reemplazo disponible.`);
      continue}
    const c=candFor(d,s.k,p.id,as);
    state.reqs.push({id:uid(),date:d,k:s.k,from:p.id,cands:c.map(x=>x.id),declined:[],status:c.length?'open':'none',ts:Date.now()});
    notify([...svcPeople(d,z=>z.area===s.area||z.area==='pulpito'),...admins()],`${p.name} no puede ir el ${fmt(d)} (${s.l}). ${c.length?`Se pregunta a ${c.length} ${c.length===1?'persona':'personas'} si pueden reemplazar.`:'No hay nadie disponible: el administrador debe asignar a alguien.'}`)}
  ui.flash=mine.length?'Listo. Se está buscando reemplazo y tu equipo ya fue avisado.':null}
function accept(id){const r=state.reqs.find(x=>x.id===id),p=me();if(!r||r.status!=='open')return;
  const as=schedOf(r.date),s=slotOf(r.date,r.k),slots=slotsAt(r.date);
  if(as[r.k]){r.status='done';ui.flash='Otra persona ya tomó este puesto. Gracias.';return}
  const no=why(p,s,r.date,as,slots);if(no){ui.flash='No puedes tomar este puesto: '+no+'.';return}
  as[r.k]=p.id;r.status='done';r.by=p.id;const from=person(r.from);
  notify([r.from,...svcPeople(r.date,z=>z.area===s.area||z.area==='pulpito'),...admins()],`${p.name} reemplaza a ${from?from.name:'un hermano'} el ${fmt(r.date)} (${s.l}).`);
  ui.flash=`Gracias. Quedaste asignado el ${fmt(r.date)} en ${s.l.toLowerCase()}.`}
function decline(id){const r=state.reqs.find(x=>x.id===id);if(!r)return;r.declined.push(state.me);
  if(r.cands.every(c=>r.declined.includes(c))){r.status='none';const from=person(r.from),s=slotOf(r.date,r.k);
    notify(admins(),`Nadie pudo reemplazar a ${from?from.name:'un hermano'} el ${fmt(r.date)} (${s.l}). Asigna a alguien en el horario.`)}}
function late(d,msg){const p=me(),as=schedOf(d)||{},mine=slotsAt(d).filter(s=>as[s.k]===p.id);
  const areas=new Set(mine.map(s=>s.area));if(p.roles.includes('guardar'))areas.add('ofr');
  const what=mine.length?mine.map(s=>s.l).join(', '):(p.roles.includes('guardar')?'Ofrendas · guardan':'sin labor asignada');
  const n=notify([...svcPeople(d,z=>areas.has(z.area)||z.area==='pulpito'),...admins()],`${p.name} llega tarde al culto del ${fmt(d)} (${what})${msg?': «'+msg+'»':'.'} ¿Alguien puede ayudar mientras llega?`,{help:true,from:p.id,date:d});
  ui.flash=`Aviso enviado a ${n} ${n===1?'persona':'personas'}.`}
function ago(ts){const m=Math.round((Date.now()-ts)/6e4);if(m<1)return'ahora';if(m<60)return`hace ${m} min`;const h=Math.round(m/60);if(h<24)return`hace ${h} h`;const d=new Date(ts);return`${d.getDate()} ${MESS[d.getMonth()]}`}
function pendingFor(p){return state.reqs.filter(r=>r.status==='open'&&r.date>=today&&r.cands.includes(p.id)&&!r.declined.includes(p.id))}
const DOWN=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function nDate(n){if(n.date)return n.date;if(n.go&&n.go.d)return n.go.d;const t=(n.text||'').toLowerCase(),b=new Date(n.ts||Date.now());
  let m=/\b(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b/.exec(t);
  if(m){const mi=MESS.indexOf(m[2]);let y=b.getFullYear();if(mi<b.getMonth()-6)y++;return `${y}-${pad(mi+1)}-${pad(+m[1])}`}
  m=new RegExp('\\b('+DOWN.join('|')+') (\\d{1,2})\\b').exec(t);
  if(m){const x=new Date(b.getFullYear(),b.getMonth(),b.getDate(),12);for(let i=0;i<40;i++){if(x.getDate()===+m[2])return ds(x);x.setDate(x.getDate()+1)}}
  return null}
const nLive=n=>{const d=nDate(n);return !(d&&svcGone(d))};
function unreadFor(p){return state.notifs.filter(n=>n.to.includes(p.id)&&!n.read.includes(p.id)&&nLive(n)).length}
function msgIn(n){if(!n.msg&&!/dejó un mensaje/.test(n.text))return'';const m=n.msg?(state.msgs||[]).find(x=>x.id===n.msg):null;
  return m?`<div class="pre" style="margin:6px 0 2px;padding:8px 10px;border-left:3px solid var(--gold);background:rgba(255,255,255,.04);border-radius:6px">${linkify(m.text)}</div>`:`<small style="font-style:italic">${n.msg?'Este mensaje ya fue borrado.':'Este mensaje ya no está disponible.'}</small>`}
/* ---- Tocar un aviso lleva al lugar donde se hace lo que pide ---- */
function goFor(n,p){if(n.go)return n.go;const t=(n.text||'').toLowerCase();
  if(/introducci/.test(t)&&/cita/.test(t)){const it=myItems(p);const d=Object.keys(it).sort().find(x=>x>=today&&!svcGone(x)&&[4,0].includes(pd(x).getDay())&&it[x].slots.some(s=>s.k==='pul')&&!introOf(x).cita);return {tab:'mis',d,ed:d?'ic':null,label:'Poner la cita'}}
  if(/corrigi[oó] la ficha/.test(t))return {tab:'mis',d:n.date,label:'Ver la ficha'};
  if(/ficha/.test(t)&&/pesta[nñ]a pastor/.test(t))return {tab:'ens',label:'Ir a Pastor'};
  if(/transmisi[oó]n/.test(t)&&/¿hay/.test(t))return {tab:'mis',label:'Responder'};
  if(/leipzig/.test(t)&&/(invitaci|yo ir)/.test(t))return {tab:'mis',lz:1,label:'Responder'};
  if(/disponibilidad/.test(t))return /cerrada/.test(t)&&p.admin?{tab:'hor',label:'Ver horario'}:{tab:'disp',label:'Marcar mis días'};
  if(/reuni[oó]n/.test(t))return {tab:'mis',label:'Ver reunión'};
  if(/mensaje|→/.test(t))return {tab:'mis',label:'Ver mensaje'};
  return {tab:'mis',d:n.date,label:'Ver'}}
function nGo(g){ui.bell=false;ui.menu=false;ui.tab=g.tab||'mis';if(g.tab==='hor'&&g.month)ui.month=g.month;
  if(g.ed&&g.d)ui.edName=g.ed+'|'+g.d;render();
  const sel=g.lz?'.lzinv':g.d?`[data-day="${esc(g.d)}"]`:g.tab==='mis'&&/Responder/.test(g.label||'')?'.trask':null;
  setTimeout(()=>{const el=sel&&document.querySelector(sel);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('flashc');setTimeout(()=>el.classList.remove('flashc'),2200);const inp=el.querySelector('#ne-in');if(inp)inp.focus({preventScroll:true})}else scrollTo(0,0)},60)}
function nItem(n,p,un){const who=person(n.from||n.by),g=goFor(n,p);return `<div class="li nitem ${un?'unread':''}" style="align-items:flex-start;gap:10px" data-a="n-go" data-v="${esc(n.id)}" role="button" tabindex="0">${who?avatar(who,36):''}<div class="main">${esc(n.msg||!/Míralo en Labores\.$/.test(n.text)?n.text:n.text.replace(/\. Míralo en Labores\.$/,':'))}${msgIn(n)}<small>${ago(n.ts)}</small><span class="ncta">${esc(g.label||'Ver')} ›</span>${n.help?(n.helper?`<small><b>${esc((person(n.helper)||{}).name||'')}</b> ayuda mientras llega.</small>`:(n.date>=today?`<button class="btn sm" style="margin-top:6px" data-a="help" data-v="${esc(n.id)}">Yo ayudo</button>`:'')):''}</div></div>`}
const APPV = '9.4';
/* Actualización sola: al volver a la app (o cada 30 min) revisa si hay versión nueva. */
async function checkUpd(auto){try{const j=await (await fetch('version.json?t='+Date.now(),{cache:'no-store'})).json();if(!j.v||j.v===APPV)return;
  let tried='';try{tried=sessionStorage.getItem('lb-upd')||''}catch(e){}
  const typing=document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if(auto&&!typing&&tried!==j.v){try{sessionStorage.setItem('lb-upd',j.v)}catch(e){}location.reload();return}
  if(ui.upd!==j.v){ui.upd=j.v;render()}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkUpd(true)});
setInterval(()=>checkUpd(false),30*60e3);setTimeout(()=>checkUpd(true),4000);
function avatar(p,sz){const ini=(p.name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return p.photo?`<img class="ava" src="${esc(p.photo)}" alt="" style="width:${sz}px;height:${sz}px">`:`<span class="ava ini" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.4)}px">${esc(ini)}</span>`}
const BELL='<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>';
function hdr(p){const un=unreadFor(p);
  return `<div class="hdr"><button class="hb" data-a="bell" aria-label="Notificaciones${un?`, ${un} sin leer`:''}">${BELL}${un?`<span class="hbd">${un>9?'9+':un}</span>`:''}</button>
    <button class="hb menu" data-a="menu" aria-label="Menú">${avatar(p,30)}<svg class="dots" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg></button></div>`}
function menuSheet(p){return `<div class="scrim" data-a="sheet-x"></div><div class="pop menu-pop" role="menu">
  <div class="pophead">${avatar(p,40)}<div><b>${esc(p.name)}</b><small>${esc(ui.viewAs?(p.email||''):(SESSION&&SESSION.user.email)||'')}</small></div></div>
  <button role="menuitem" data-a="tab" data-v="aj">Ajustes</button>
  <button role="menuitem" data-a="priv-open">Aviso de privacidad</button>
  ${ui.viewAs?'<button role="menuitem" data-a="logout">Volver a mi cuenta</button>':'<button role="menuitem" data-a="logout">Salir</button>'}</div>`}
function bellSheet(p){const ns=state.notifs.filter(n=>n.to.includes(p.id)).slice(0,60),hl=ui.bellNew||[];
  return `<div class="scrim" data-a="sheet-x"></div><div class="pop bell-pop"><div class="dayhead"><b>Notificaciones</b><button class="x" data-a="sheet-x" aria-label="Cerrar">✕</button></div>
  <div class="bell-list">${ns.length?ns.map(n=>nItem(n,p,hl.includes(n.id))).join(''):'<div class="info" style="padding:14px 0">No tienes notificaciones.</div>'}</div></div>`}
function vAj(p){const em=ui.viewAs?(p.email||''):(SESSION&&SESSION.user.email)||'';
  return `<button class="linkbtn" data-a="tab" data-v="${esc(ui.prevTab||'mis')}" style="margin-bottom:6px">‹ Volver</button><h2>Ajustes</h2>
  <div class="card"><div class="phrow">${avatar(p,84)}<div class="inline" style="flex-direction:column;align-items:flex-start;gap:6px">
     <label class="btn ghost sm" style="cursor:pointer">${p.photo?'Cambiar foto':'Agregar foto de perfil'}<input type="file" accept="image/*" hidden id="ph-in" data-c="photo"></label>
     ${p.photo?'<button class="linkbtn" data-a="photo-del" style="font-size:15px">Quitar foto</button>':''}</div></div>
   <label class="field" style="margin-top:14px">Nombre<input id="me-name" type="text" value="${esc(p.name)}" data-c="me-name"></label>
   <label class="field">Número de teléfono<input id="me-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+49 …" value="${esc(p.phone||'')}" data-c="me-phone"></label>
   <label class="field">Correo<input type="email" value="${esc(em)}" disabled></label>
   <div class="info" style="margin-top:-4px">El correo solo lo puede cambiar el administrador.</div>
   <div class="info" style="margin-top:10px">Labores: <b>${p.roles.map(r=>ROLES[r]).join(', ')||'ninguna todavía'}</b></div></div>
  ${calCard(p)}
  <h3>Privacidad</h3><div class="card">
   <button class="linkbtn" data-a="priv-open">Leer el aviso de privacidad</button>
   ${p.privacy?`<div class="info">Lo aceptaste el ${fmt(ds(new Date(p.privacy.ts)))}.</div>`:''}
   ${ui.viewAs?'':`<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line)"><button class="linkbtn" data-a="del-ask" style="color:var(--warn)">Borrar mi cuenta</button>${ui.delAsk?delBox():''}</div>`}</div>
  ${p.admin&&!ui.viewAs?privDocsCard():''}
  <p class="ver">Labores Berlín · versión ${APPV}</p>`}
const PRIV_LINKS=[['Registro de actividades (Verzeichnis von Verarbeitungstätigkeiten)','https://claude.ai/artifact/UzDqQAZR4exa7RwshiHuje'],['Contrato de Supabase (DPA) · ya incluido en sus condiciones','https://supabase.com/legal/dpa'],['Contrato de Cloudflare (DPA)','https://www.cloudflare.com/dpa']];
function privDocsCard(){const ds_=state.privDocs||[];
  return `<h3>Documentos de privacidad · solo administrador</h3><div class="card">
   ${PRIV_LINKS.map(([l,u])=>`<div class="li"><div class="main"><a href="${u}" target="_blank" rel="noopener" style="color:var(--navy);font-weight:600">${esc(l)}</a></div></div>`).join('')}
   ${ds_.map(d=>`<div class="li"><div class="main"><button class="pdfl dl" data-a="dlpdf" data-v="pd|${esc(d.id)}|de">${esc(d.name)}</button><small>Guardado el ${fmt(ds(new Date(d.ts)))}</small></div><button class="x" data-a="pd-del" data-v="${esc(d.id)}" aria-label="Quitar">✕</button></div>`).join('')}
   ${ui.upl==='pd'?'<div class="info">Subiendo…</div>':AS?`<label class="btn ghost sm" style="cursor:pointer;margin-top:10px">Guardar un PDF aquí<input type="file" accept="application/pdf" hidden data-c="pd-up"></label>`:''}
   ${ui.uplMsg?`<div class="info" style="color:var(--warn)">${esc(ui.uplMsg)}</div>`:''}
   <div class="info" style="margin-top:8px">Solo tú ves esta sección. Guarda aquí los PDF (por ejemplo el contrato de Cloudflare descargado o el registro en PDF).</div></div>`}
const PENCIL='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>';
const EXT='<svg class="ext" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
const xlink=(href,txt)=>`<a class="xl" href="${esc(href)}" target="_blank" rel="noopener">${txt}${EXT}</a>`;
const linkPair=(kind,t,langs)=>`<div class="fich2">${langs.map(l=>{const k=kind+'|'+t.id+'|'+l,v=t[LINKF[l]],L=`Ficha en ${LANGN[l]}`;
  if(ui.edName===k)return `<div class="frow ed"><span class="fl2">${L}</span>${linkEd(kind,t.id+'|'+l,v)}</div>`;
  return v?`<div class="frow">${xlink(v,L)}<button class="pen" data-a="ne-edit" data-v="${esc(k)}" aria-label="Cambiar el enlace de la ${esc(L.toLowerCase())}">${PENCIL}</button></div>`
    :`<div class="frow"><span class="fmiss"><span class="rdot sm" aria-hidden="true"></span>${L}: falta</span><button class="btn ghost sm" data-a="ne-edit" data-v="${esc(k)}">Agregar enlace</button></div>`}).join('')}</div>`;
const doneTog=(kind,t)=>`<button class="sw" role="switch" aria-checked="${!!t.done}" data-a="f-done" data-v="${esc(kind)}|${esc(t.id)}" style="margin-top:4px"><span class="swl">${t.done?'Fichas subidas a Drive':'Fichas sin subir'}</span><span class="swt"><span class="swk"></span></span></button>`;
function fichasCard(){const F=state.fichas||{};
  return `<h3>Carpetas de fichas (Drive)</h3><div class="card"><div class="info" style="margin:0 0 6px">Cada intérprete ve el enlace de su idioma en la enseñanza que le toca.</div>
   <div class="fich"><span class="fl">Alemán</span><div class="fc" style="display:block">${linkEd('fx','de',F.de)}</div><span class="fl">Inglés</span><div class="fc" style="display:block">${linkEd('fx','en',F.en)}</div></div></div>`}
const davidDay=d=>!!(d&&slotsAt(d).some(z=>z.k==='predica'));
/* ---- Introducción: cita bíblica y testimonio (los pone quien da la introducción; los ven los intérpretes) ---- */
const introOf=d=>(state.intro||{})[d]||{};
function introView(d){const x=introOf(d);return (x.cita?`<br><b>Cita bíblica:</b> ${esc(x.cita)}`:'')+(x.link?`<br><b>Testimonio:</b> ${xlink(x.link,'Ver el testimonio')}`:'')}
function introEdit(d){const x=introOf(d);
  return `<div class="introed"><div class="fl">Cita bíblica que leerás</div>${nameEd('ic',d,x.cita||'','Agrega la cita, por ejemplo: Juan 3:16')}
    <div class="fl">Enlace del testimonio <span>(si tienes)</span></div>${linkEd('it',d,x.link,'Pega aquí el enlace del testimonio','<small>Sin enlace</small>')}
    <div class="fl-help">Los intérpretes lo ven para prepararse.</div></div>`}
function linkEd(kind,id,val,ph,empty){const k=kind+'|'+id;
  if(ui.edName===k)return `<div class="inline" style="gap:6px;margin:6px 0;flex-wrap:nowrap"><input id="ne-in" type="url" inputmode="url" value="${esc(val||'')}" placeholder="${esc(ph||'Pega aquí el enlace de Drive')}" style="flex:1;min-width:0"><button class="btn sm" data-a="ne-save" data-v="${esc(k)}">Guardar</button><button class="x" data-a="ne-x" aria-label="Cancelar">✕</button></div>`;
  return `<div class="nrow" style="margin-top:4px">${val?xlink(val,'Abrir el enlace'):(empty||'<small style="color:var(--warn)">Sin enlace</small>')}<button class="pen" data-a="ne-edit" data-v="${esc(k)}" aria-label="${val?'Editar enlace':'Agregar enlace'}">${PENCIL}</button></div>`}
// Acciones de cada enseñanza, junto al lápiz: mover (grupo) y quitar (aparte, en rojo)
const IC_UP='<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',IC_DN='<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',IC_DEL='<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
const IC_PIN='<svg viewBox="0 0 24 24"><path d="M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5zM12 14v6"/></svg>';
function tActs(t,mov){const id=t.id,pin=isPinned(t),i=mov.indexOf(t),n=mov.length;return `<div class="tacts"><button class="ta pin ${pin?'on':''}" data-a="t-pin" data-v="${esc(id)}" aria-pressed="${pin}" aria-label="${pin?'Soltar: que se corra con las demás':'Fijar en esta fecha'}" title="${pin?'Fija en esta fecha':'Fijar en esta fecha'}">${IC_PIN}</button><div class="tseg" role="group" aria-label="Mover"><button class="ta" data-a="t-up" data-v="${esc(id)}" aria-label="Subir" ${!pin&&i>0?'':'disabled'}>${IC_UP}</button><button class="ta" data-a="t-down" data-v="${esc(id)}" aria-label="Bajar" ${!pin&&i>=0&&i<n-1?'':'disabled'}>${IC_DN}</button></div><button class="ta del" data-a="t-del" data-v="${esc(id)}" aria-label="Quitar enseñanza">${IC_DEL}</button></div>`}
function nameEd(kind,id,val,ph,bold){const k=kind+'|'+id;
  if(ui.edName===k)return `<div class="inline" style="gap:6px;margin:4px 0;flex-wrap:nowrap"><input id="ne-in" type="text" value="${esc(val)}" placeholder="${esc(ph||'Escribe el nombre')}" style="flex:1;min-width:0" data-k="${esc(k)}"><button class="btn sm" data-a="ne-save" data-v="${esc(k)}">Guardar</button><button class="x" data-a="ne-x" aria-label="Cancelar">✕</button></div>`;
  return `<div class="nrow">${bold?`<b>${esc(val||ph)}</b>`:`<small>${esc(val||ph)}</small>`}<button class="pen" data-a="ne-edit" data-v="${esc(k)}" aria-label="Editar nombre">${PENCIL}</button></div>`}
document.addEventListener('keydown',e=>{if(e.target.id!=='ne-in')return;if(e.key==='Enter'){e.preventDefault();const b=document.querySelector('[data-a=ne-save]');b&&b.click()}else if(e.key==='Escape'){const b=document.querySelector('[data-a=ne-x]');b&&b.click()}});
/* ---- Privacidad ---- */
const privOk=p=>!!(p&&p.privacy&&p.privacy.v===window.PRIV_V);
function privSheet(){const L=ui.privLang||'es';
  return `<div class="scrim" data-a="priv-x"></div><div class="sheet doc" role="dialog" aria-label="Aviso de privacidad"><div class="dayhead"><div class="filters" style="margin:0"><button class="f" data-a="priv-lang" data-v="es" aria-pressed="${L==='es'}">Español</button><button class="f" data-a="priv-lang" data-v="de" aria-pressed="${L==='de'}">Deutsch</button></div><button class="x" data-a="priv-x" aria-label="Cerrar">✕</button></div>
  <div class="pklist privtxt">${(window.PRIV||{})[L]||''}</div></div>`}
function privGate(p){return `<div class="card" style="margin-top:8px"><h2 style="margin-top:0">Aviso de privacidad</h2>
  <p>Para seguir usando la app, lee y acepta cómo se guardan y usan tus datos. Solo se usan para organizar las labores del grupo de Berlín.</p>
  <button class="linkbtn" data-a="priv-open">Leer el aviso de privacidad</button>
  <label class="chk" style="margin:12px 0"><input type="checkbox" id="priv-chk"> <span>He leído y acepto el aviso de privacidad.</span></label>
  ${ui.privErr?`<div class="info" style="color:var(--warn);margin:-4px 0 8px">Marca la casilla para continuar.</div>`:''}
  <button class="btn" data-a="priv-accept" style="width:100%">Aceptar y continuar</button>
  <div class="info" style="margin-top:14px">¿No estás de acuerdo? Puedes <button class="linkbtn" data-a="del-ask" style="font-size:14px">borrar tu cuenta</button>.</div>
  ${ui.delAsk?delBox():''}</div>`}
function delBox(){return `<div class="confirm" style="display:block;margin-top:10px"><b>¿Borrar tu cuenta?</b><div style="margin:6px 0 10px">Se eliminan tu correo, teléfono, foto y disponibilidad, y se te quita de las labores que vienen. No se puede deshacer.</div>
  ${ui.delErr?`<div class="info" style="color:var(--warn);margin-bottom:8px">${esc(ui.delErr)}</div>`:''}
  <div class="inline"><button class="btn warnb sm" data-a="del-yes" ${ui.delBusy?'disabled':''}>${ui.delBusy?'Borrando…':'Sí, borrar mi cuenta'}</button><button class="btn ghost sm" data-a="del-no">Cancelar</button></div></div>`}
function avisos(p,noN){let h='';
  if(ui.flash){h+=`<div class="banner ok">${esc(ui.flash)}</div>`;ui.flash=null}
  const rq=pendingFor(p);
  if(rq.length)h+=`<div class="list" style="margin-bottom:14px">${rq.map(r=>{const f=person(r.from),s=slotOf(r.date,r.k);return `<div class="card ask" style="display:flex;gap:12px;align-items:flex-start">${f?avatar(f,44):''}<div style="flex:1;min-width:0"><div class="info" style="margin:0 0 4px">Piden reemplazo</div><b>${esc(f?f.name:'Un hermano')}</b> no puede ir el <b>${fmt(r.date)}</b> · ${esc(s.l)}. ¿Puedes ir tú?
    <div class="inline" style="margin-top:10px"><button class="btn sm" data-a="acc" data-v="${esc(r.id)}">Sí, yo voy</button><button class="btn ghost sm" data-a="dec" data-v="${esc(r.id)}">No puedo</button></div></div></div>`}).join('')}</div>`;
  const ns=noN?[]:state.notifs.filter(n=>n.to.includes(p.id)&&!n.read.includes(p.id)&&nLive(n)).slice(0,8);
  if(ns.length){const un=ns.filter(n=>!n.read.includes(p.id)).length;
    h+=`<h3 style="margin-top:4px">Avisos${un?` <span class="tag">${un} ${un===1?'nuevo':'nuevos'}</span>`:''}</h3><div class="card">${ns.map(n=>nItem(n,p,!n.read.includes(p.id))).join('')}
    ${un?`<button class="btn ghost sm" data-a="readall" style="margin-top:8px">Marcar como leídos</button>`:''}</div>`}
  return h}
function monthNav(){const[y,m]=ui.cm.split('-').map(Number);return `<div class="mnav" style="margin:6px 0 12px"><button class="ib" data-a="cm" data-v="-1" aria-label="Mes anterior">‹</button><b>${MES[m-1]} ${y}</b><button class="ib" data-a="cm" data-v="1" aria-label="Mes siguiente">›</button></div>`}
/* ---- reuniones por equipo ---- */
const invitees=m=>m.areas.includes('all')?state.people.map(x=>x.id):[...new Set(m.areas.flatMap(teamIds))];
const teamLbl=m=>m.areas.includes('all')?'Todos los equipos':m.areas.map(a=>AREAN[a]).join(', ');
const myMeets=p=>state.meets.filter(m=>m.date>=today&&invitees(m).includes(p.id)).sort((a,b)=>(a.date+a.time)<(b.date+b.time)?-1:1);
function meetHead(m){const f=person(m.from),d=pd(m.date);return `<div class="msgfrom">${esc(m.title)}</div>
  <div class="info" style="margin-top:2px">${DOW[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}${m.time?' · '+esc(m.time):''} · ${esc(teamLbl(m))}</div>
  <div class="info">Convoca: <b>${esc(f?f.name:'')}</b></div>
  ${m.place?`<div class="pre" style="margin-top:6px">${linkify(m.place)}</div>`:''}${m.notes?`<div class="pre info" style="margin-top:4px">${linkify(m.notes)}</div>`:''}`}
function misMeets(p){const ms=myMeets(p);if(!ms.length)return'';
  return `<h3 style="margin-top:4px">Reuniones</h3><div class="list">${ms.map(m=>{const r=m.rsvp[p.id];return `<div class="card">${meetHead(m)}
    <div class="rsvp"><button class="tog" data-a="rsvp" data-v="${esc(m.id)}|yes" aria-pressed="${r==='yes'}">Asisto</button><button class="tog" data-a="rsvp" data-v="${esc(m.id)}|no" aria-pressed="${r==='no'}">No puedo</button></div></div>`}).join('')}</div>`}
function meetBlock(p){const ms=state.meets.filter(m=>m.date>=today).sort((a,b)=>(a.date+a.time)<(b.date+b.time)?-1:1);let h='';
  if(ui.meet){const d=ui.md;h+=`<div class="panel" style="margin-top:12px"><b>Convocar reunión</b>
    <label class="field" style="margin-top:8px">Título<input id="md-title" type="text" value="${esc(d.title)}" placeholder="Por ejemplo: Reunión del equipo de puerta" data-c="md" data-v="title"></label>
    <div class="inline" style="margin-bottom:10px"><label class="field" style="margin:0">Fecha<input id="md-date" type="date" min="${today}" value="${esc(d.date)}" data-c="md" data-v="date"></label><label class="field" style="margin:0">Hora<input id="md-time" type="time" value="${esc(d.time)}" data-c="md" data-v="time"></label></div>
    <div class="info">Equipos convocados</div><div class="checks">${[['all','Todos los equipos'],...Object.entries(AREAN)].map(([k,l])=>`<label><input type="checkbox" id="md-a-${k}" data-c="md-area" data-v="${esc(k)}" ${d.areas.includes(k)?'checked':''}>${l}</label>`).join('')}</div>
    <label class="field">Lugar o link<textarea id="md-place" rows="2" placeholder="En la iglesia, o pega el link de la videollamada" data-c="md" data-v="place">${esc(d.place)}</textarea></label>
    <label class="field">Detalles (opcional)<textarea id="md-notes" rows="2" data-c="md" data-v="notes">${esc(d.notes)}</textarea></label>
    ${ui.mdErr?`<div class="info" style="color:var(--warn);margin-bottom:8px">${esc(ui.mdErr)}</div>`:''}
    <div class="inline"><button class="btn sm" data-a="md-send">Enviar convocatoria</button><button class="btn ghost sm" data-a="md-x">Cancelar</button></div></div>`}
  else h+=`<button class="btn ghost sm" data-a="md-open" style="margin-top:12px">Convocar reunión</button>`;
  if(ms.length)h+=`<div class="list" style="margin-top:10px">${ms.map(m=>{const inv=invitees(m),yes=inv.filter(i=>m.rsvp[i]==='yes'),no=inv.filter(i=>m.rsvp[i]==='no'),pend=inv.filter(i=>!m.rsvp[i]);const nm=a=>a.map(i=>esc((person(i)||{}).name||'')).join(', ')||'—';
    return `<div class="card">${meetHead(m)}<div class="info" style="margin-top:8px"><b>${yes.length}</b> asisten · <b>${no.length}</b> no pueden · <b>${pend.length}</b> sin responder</div>
      ${ui.mOpen===m.id?`<div class="note"><b>Asisten:</b> ${nm(yes)}</div><div class="note"><b>No pueden:</b> ${nm(no)}</div><div class="note"><b>Sin responder:</b> ${nm(pend)}</div>`:''}
      <div class="inline" style="margin-top:8px"><button class="btn ghost sm" data-a="m-open" data-v="${esc(m.id)}">${ui.mOpen===m.id?'Ocultar respuestas':'Ver respuestas'}</button>
      ${m.from===p.id||p.admin?(ui.mDel===m.id?`<button class="btn warnb sm" data-a="m-del-yes" data-v="${esc(m.id)}">Sí, cancelar reunión</button><button class="btn ghost sm" data-a="m-del-no">No</button>`:`<button class="btn ghost sm" data-a="m-del" data-v="${esc(m.id)}">Cancelar reunión</button>`):''}</div></div>`}).join('')}</div>`;
  return h}
/* ---- notificaciones al celular ---- */
function pushOut(ids,title,body,url){if(!SESSION||!ids||!ids.length)return;try{SB.functions.invoke('push',{body:{mode:'send',to:ids,title,body,url}}).catch(()=>{})}catch(e){}}
const pushOk=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window&&window.CFG&&CFG.vapid;
const isStandalone=()=>(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
function b64u(s){const p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/'),r=atob(b),a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a}
async function ensureSub(ask){if(!pushOk())return false;const me_=realMe();if(!me_)return false;
  if(ask){const perm=await Notification.requestPermission();if(perm!=='granted'){ui.subMsg=perm==='denied'?'Las notificaciones quedaron bloqueadas. Puedes activarlas en los ajustes del navegador para este sitio.':'';render();return false}}
  else if(Notification.permission!=='granted')return false;
  try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(CFG.vapid)});
    const j=sub.toJSON();const{error}=await SB.from('push_subs').upsert({endpoint:j.endpoint,person_id:me_.id,sub:j});if(error)throw error;
    ui.subOk=true;ui.subMsg='';render();return true}catch(e){ui.subMsg='No se pudieron activar las notificaciones. Intenta de nuevo.';render();return false}}
function pushCard(){if(!pushOk()||ui.subOk)return'';
  if(isIOS()&&!isStandalone())return'';
  if(Notification.permission==='granted')return'';
  return `<div class="card" style="margin-bottom:14px"><b>Activa las notificaciones</b>
   <div class="info" style="margin-top:4px">Te avisamos cuando te pidan un reemplazo, cuando haya un mensaje de púlpito o una reunión, y la noche antes de cada labor.</div>
   ${ui.subMsg?`<div class="info" style="color:var(--warn);margin-top:6px">${esc(ui.subMsg)}</div>`:''}
   ${Notification.permission==='denied'?`<div class="note" style="margin-top:8px"><b>Las notificaciones están bloqueadas para esta app.</b> Para activarlas:<ol class="steps" style="margin:6px 0 0">${isIOS()?'<li>Abre <b>Ajustes</b> <i>(Einstellungen)</i> del iPhone → <b>Notificaciones</b> <i>(Mitteilungen)</i> → <b>Labores</b> → activa <b>Permitir notificaciones</b> <i>(Mitteilungen erlauben)</i>.</li>':'<li>Si la abriste en Chrome: toca el ícono a la izquierda de la dirección (🔒 o ⚙) → <b>Permisos</b> <i>(Berechtigungen)</i> → <b>Notificaciones</b> <i>(Benachrichtigungen)</i> → <b>Permitir</b> <i>(Zulassen)</i>.</li><li>Si la tienes instalada: mantén presionado el ícono de Labores → <b>Información de la app</b> <i>(App-Info)</i> → <b>Notificaciones</b> <i>(Benachrichtigungen)</i> → actívalas.</li>'}<li>Vuelve a abrir la app.</li></ol></div>`:'<button class="btn sm" data-a="push-on" style="margin-top:8px">Activar notificaciones</button>'}</div>`}
function installHint(){const sa=window.matchMedia&&matchMedia('(display-mode: standalone)').matches||navigator.standalone;let hidden=ui.hideInstall;try{hidden=hidden||localStorage.getItem('lb-noinstall')==='1'}catch(e){}
  if(sa||hidden)return'';const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  return `<div class="card" style="margin-bottom:14px"><div class="dayhead"><b>Instala la app en tu celular</b><button class="x" data-a="install-x" aria-label="Cerrar">✕</button></div>
   <div class="info" style="margin-top:4px">${INSTALL?'Así la abres con un toque y recibes los avisos.':ios?'En el navegador toca <b>Compartir</b> <i>(Teilen)</i>, el cuadrado con la flecha, y luego <b>Agregar a pantalla de inicio</b> <i>(Zum Home-Bildschirm)</i>. Si no lo ves, toca primero <b>Más</b> <i>(Mehr)</i>. En iPhone, las notificaciones solo funcionan con la app instalada.':'En el menú del navegador (⋮) toca <b>Instalar app</b> <i>(App installieren)</i> o <b>Agregar a pantalla de inicio</b> <i>(Zum Startbildschirm hinzufügen)</i>.'}</div>
   ${INSTALL?'<button class="btn sm" data-a="install" style="margin-top:8px">Instalar</button>':''}</div>`}
/* ---- borrador y publicación ---- */
function autoDraft(){const r=realMe();if(!r||!r.admin)return;
  for(const ym of Object.keys(state.avReqs||{})){const av=state.avReqs[ym];
    if(today>av.deadline&&!state.schedules[ym]&&!av.autoGen){generate(ym);av.autoGen=Date.now();ui.month=ym;ui.toast=`Se generó el borrador de ${MES[+ym.slice(5,7)-1]} con la disponibilidad de todos. Revísalo en Horario y publícalo.`;save()}}}
const isPub=ym=>!!(state.published&&state.published[ym]);
const canSeeMonth=(p,ym)=>!!(p&&p.admin)||isPub(ym);
const servers=()=>state.people.filter(x=>x.roles&&x.roles.length).map(x=>x.id);
function pubBar(m){if(!state.schedules[ui.month])return'';
  if(isPub(ui.month))return `<div class="info" style="margin-top:10px">Publicado: todos ven el horario de ${MES[m-1]}. <button class="btn ghost sm" data-a="unpublish">Volver a borrador</button></div>`;
  return `<div class="confirm" style="margin-top:10px"><span><b>Borrador.</b> Los hermanos todavía no ven el horario de ${MES[m-1]}. Ajusta lo que necesites y publícalo.</span><button class="btn sm" data-a="publish">Publicar horario</button></div>`}
/* ---- pedir disponibilidad ---- */
const AVDAY=15;
const avOf=ym=>(state.avReqs||{})[ym];
function avAdmin(m){const av=avOf(ui.month);const mes=MES[m-1];
  if(!av){if(ui.avAsk){const def=(()=>{const d=pd(ui.month+'-01');d.setDate(d.getDate()-6);const t=ds(d);return t<today?today:t})();
      return `<div class="panel" style="margin-top:10px"><b>Pedir disponibilidad de ${mes}</b><div class="info" style="margin:4px 0 8px">A todos los que sirven les llega un aviso para marcar los días que no pueden.</div>
        <div class="inline"><label class="field" style="margin:0">Responder hasta<input id="av-deadline" type="date" min="${today}" value="${def}"></label></div>
        <div class="inline" style="margin-top:10px"><button class="btn sm" data-a="av-send">Enviar pedido</button><button class="btn ghost sm" data-a="av-x">Cancelar</button></div></div>`}
    return `<div style="margin-top:10px"><button class="btn ghost sm" data-a="av-ask">Pedir disponibilidad de ${mes}</button></div>`}
  const all=servers(),done=all.filter(i=>av.done&&av.done[i]),pend=all.filter(i=>!(av.done&&av.done[i]));
  return `<div class="card" style="margin-top:10px"><div class="dayhead"><b>Disponibilidad de ${mes}</b><span class="info" style="margin:0">hasta el ${fmt(av.deadline)}</span></div>
    <div class="info" style="margin-top:4px"><b>${done.length} de ${all.length}</b> ya respondieron.</div>
    ${ui.avList?`<div class="note"><b>Faltan:</b> ${pend.map(i=>esc((person(i)||{}).name||'')).join(', ')||'nadie'}</div>`:''}
    <div class="inline" style="margin-top:8px"><button class="btn ghost sm" data-a="av-list">${ui.avList?'Ocultar':'Ver quién falta'}</button>${pend.length?'<button class="btn sm" data-a="av-remind">Recordar a los que faltan</button>':''}</div></div>`}
function avAll(m){const mes=MES[m-1],av=avOf(ui.month);
  if(!ui.avAll)return `<div style="margin-top:8px"><button class="btn ghost sm" data-a="av-all">Ver quién no puede en ${mes}</button></div>`;
  const ppl=state.people.filter(x=>x.roles&&x.roles.length&&(ui.area==='all'||myAreas(x).includes(ui.area))).sort((a,b)=>a.name.localeCompare(b.name));
  const dates=monthDates(ui.month),blk=x=>x.blocked.filter(d=>d.slice(0,7)===ui.month).sort();
  const tabs=`<div class="filters" style="margin:8px 0"><button class="f" data-a="av-mode" data-v="p" aria-pressed="${ui.avMode!=='d'}">Por persona</button><button class="f" data-a="av-mode" data-v="d" aria-pressed="${ui.avMode==='d'}">Por fecha</button></div>`;
  let body;
  if(ui.avMode==='d'){const rows=dates.map(d=>[d,ppl.filter(x=>x.blocked.includes(d))]).filter(r=>r[1].length);
    body=rows.length?rows.map(([d,xs])=>`<div class="li"><div class="main"><b>${DOWS[pd(d).getDay()]} ${pd(d).getDate()}</b><small>${xs.map(x=>esc(x.name)).join(', ')}</small></div><span class="tag">${xs.length}</span></div>`).join(''):`<div class="info">Nadie marcó fechas en ${mes}.</div>`;
    body+=`<div class="info" style="margin-top:8px">Aquí salen solo las fechas marcadas. Los días de la semana que cada uno no sirve están en «Por persona».</div>`}
  else body=ppl.map(x=>{const off=[1,2,3,4,5,6,0].filter(w=>!x.days.includes(w)),b=blk(x),ok=av&&av.done&&av.done[x.id];
    return `<div class="li"><div class="main"><b>${esc(x.name)}</b>${av?`<span class="info" style="margin:0 0 0 6px;display:inline">${ok?'· respondió':'· <b>falta</b>'}</span>`:''}
      <small>${b.length?`No puede: ${b.map(d=>DOWS[pd(d).getDay()]+' '+pd(d).getDate()).join(', ')}`:'Sin fechas marcadas'}</small>
      ${off.length?`<small>Nunca: ${off.map(w=>DOWS[w]).join(', ')}</small>`:''}${x.predPref&&x.predPref[ui.month]?`<small>Prefiere traducir la predicación: ${DOWS[pd(x.predPref[ui.month]).getDay()]} ${pd(x.predPref[ui.month]).getDate()}</small>`:''}</div></div>`}).join('')||'<div class="info">No hay nadie en esta área.</div>';
  return `<div class="card" style="margin-top:10px"><div class="dayhead"><b>Quién no puede en ${mes}</b><button class="x" data-a="av-all" aria-label="Cerrar">✕</button></div>
    <div class="info" style="margin-top:2px">${ui.area==='all'?'Todas las áreas':'Área: '+AREAN[ui.area]} · cambia el área con los filtros de abajo.</div>${tabs}${body}</div>`}
function calCard(p){return `<h3>Mi calendario</h3><div class="card">${calBody(p)}</div>`}
const calHidden=()=>{try{return localStorage.getItem('lb-calhide')==='1'}catch(e){return!!ui.calHide}};
function calBanner(p){if(ui.calHide||calHidden())return'';
  return `<div class="card" style="margin:6px 0 14px"><div class="dayhead"><b>Lleva tus labores a tu calendario</b><button class="x" data-a="cal-hide" aria-label="Cerrar">✕</button></div><div style="margin-top:4px">${calBody(p)}</div><div class="info" style="margin-top:8px">Si lo cierras, lo encuentras después en <b>Ajustes</b> (${DESK()?'menú de la izquierda':'toca tu foto arriba a la derecha'}).</div></div>`}
function calBody(p){const c=ui.cal,ios=isIOS()||/Macintosh/.test(navigator.userAgent);
  let h=`<div class="info" style="margin:0">Tus labores y reuniones aparecen solas en tu calendario${ios?'':' de Google'} y se actualizan si cambia el horario (puede tardar unas horas).</div>`;
  if(!c)h+=`<button class="btn sm" data-a="cal-get" style="margin-top:10px">Conectar con mi calendario</button>${ui.calErr?`<div class="info" style="color:var(--warn)">${esc(ui.calErr)}</div>`:''}`;
  else{const w=c.me.replace(/^https:/,'webcal:');
    const goog=`<button class="btn sm" data-a="cal-copy" data-v="${esc(c.me)}" style="margin-top:10px">${ui.calCopied===c.me?'¡Enlace copiado!':'Copiar mi enlace'}</button>
      <div class="info" style="margin-top:10px">Google solo deja agregarlo <b>desde una computadora</b>. Se hace <b>una sola vez</b>: después se actualiza solo cada mes y aparece en tu celular.</div>
      <ol class="steps" style="margin-top:8px"><li>Toca <b>Copiar mi enlace</b> y mándatelo (por WhatsApp o correo) para abrirlo en la computadora.</li><li>En la computadora entra a <b>calendar.google.com</b> con la misma cuenta de Google de tu celular.</li><li>A la izquierda, junto a <b>Otros calendarios</b> <i>(Weitere Kalender)</i>, toca <b>+</b> → <b>Desde URL</b> <i>(Per URL)</i>.</li><li>Pega el enlace y toca <b>Agregar calendario</b> <i>(Kalender hinzufügen)</i>.</li><li>En tu celular, en Google Calendar: ☰ → <b>Ajustes</b> <i>(Einstellungen)</i> → «Mis labores · Berlín» → activa <b>Sincronizar</b> <i>(Synchronisieren)</i>.</li></ol>`;
    h+=ios?`<a class="btn sm" href="${esc(w)}" style="margin-top:10px">Agregar al Calendario del iPhone</a>
      <ol class="steps" style="margin-top:12px"><li>Toca <b>Agregar al Calendario del iPhone</b>.</li><li>Toca <b>Suscribirse</b> <i>(Abonnieren)</i> y luego <b>OK</b>.</li><li>Tus labores aparecen en la app <b>Calendario</b> <i>(Kalender)</i>.</li></ol>
     <div class="info" style="margin-top:6px">Así queda en la app <b>Calendario</b> del iPhone.</div>
      <button class="linkbtn" data-a="cal-g" style="font-size:15px;margin-top:4px;display:block">${ui.calG?'Ocultar los pasos de Google Calendar':'¿Usas Google Calendar? Ver cómo agregarlo'}</button>${ui.calG?`<div style="margin-top:6px;padding-top:4px;border-top:1px dashed var(--line)">${goog}</div>`:''}`:goog;}
  return h}
function predPick(p,ym,dates){const ok=dates.filter(d=>!p.blocked.includes(d)&&slotsAt(d).some(z=>/_pred$/.test(z.k)&&p.roles.includes(z.role)));if(!ok.length)return'';
  const cur=(p.predPref||{})[ym]||'';
  return `<label class="field" style="margin-top:12px">Fecha en que prefieres traducir la predicación <span class="info" style="display:inline;margin:0">(opcional)</span>
    <select data-c="pred-pref" data-v="${esc(ym)}"><option value="">Me da igual</option>${ok.map(d=>`<option value="${d}" ${d===cur?'selected':''}>${fmt(d)}</option>`).join('')}</select></label>
    <div class="info" style="margin-top:-6px">Si se puede, te ponemos la predicación ese día. Si no, otro día.</div>`}
function misAv(p){if(!p.roles||!p.roles.length)return'';let h='';
  for(const ym of Object.keys(state.avReqs||{}).sort()){const av=avOf(ym);if(ym<today.slice(0,7)||today>av.deadline)continue;const mes=MES[+ym.slice(5,7)-1];const done=av.done&&av.done[p.id];
    if(ui.avOpen===ym){const dates=monthDates(ym),lead=(pd(dates[0]).getDay()+6)%7,n=dates.filter(d=>p.blocked.includes(d)).length;
      h+=`<div class="card" style="margin-bottom:14px"><b>Tu disponibilidad de ${mes}</b><div class="info" style="margin:4px 0 10px">Presiona los días que <b>no puedes</b> servir. Los días que dejes sin presionar quedan disponibles.</div>
        <div class="cal">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=>`<span class="h">${x}</span>`).join('')}${'<span></span>'.repeat(lead)}${dates.map(d=>`<button class="tog avd" data-a="avday" data-v="${esc(d)}" aria-pressed="${p.blocked.includes(d)}" aria-label="${fmt(d)}">${pd(d).getDate()}</button>`).join('')}</div>
        <div class="info" style="margin-top:8px">${n?`No puedes ${n} ${n===1?'día':'días'}.`:'Puedes todos los días.'}</div>
        ${predPick(p,ym,dates)}
        <div class="inline" style="margin-top:10px"><button class="btn sm" data-a="av-done" data-v="${esc(ym)}">Enviar mi disponibilidad</button><button class="btn ghost sm" data-a="av-close">Cerrar</button></div></div>`;continue}
    if(done){h+=`<div class="info" style="margin-bottom:12px">Enviaste tu disponibilidad de ${mes}. <button class="btn ghost sm" data-a="av-open" data-v="${esc(ym)}">Cambiar</button></div>`;continue}
    h+=`<div class="card ask" style="margin-bottom:14px"><b>Disponibilidad de ${mes}</b><div class="info" style="margin-top:4px">Marca los días que no puedes servir${today<=av.deadline?` antes del <b>${fmt(av.deadline)}</b>`:''}.</div>
      <button class="btn sm" data-a="av-open" data-v="${esc(ym)}" style="margin-top:8px">Marcar mis días</button></div>`}
  return h}
/* ---- Invitación a Leipzig: desde el miércoles antes, cada uno marca «Yo iré»; los de púlpito ven quiénes van ---- */
const seesLzGoing=p=>!!p&&(p.admin||p.pastor||(p.roles||[]).includes('pulpito'));
function lzGoing(l){const ids=[...new Set([...state.people.filter(x=>x.leipzig&&!x.deleted).map(x=>x.id),...(l.going||[])])];return ids.map(person).filter(Boolean)}
function lzGoingLine(l){const g=lzGoing(l);return g.length?`<b>Van (${g.length}):</b> ${g.map(x=>esc(x.name)).join(', ')}`:'Todavía nadie dijo que va.'}
function lzInvite(p){const l=state.leipzig.filter(x=>x.date>=today&&!svcGone(x.date)).sort((a,b)=>a.date<b.date?-1:1)[0];if(!l)return'';
  const from=pd(l.date);from.setDate(from.getDate()-3);if(today<ds(from))return'';
  const go=(l.going||[]).includes(p.id),trav=!!p.leipzig;
  return `<div class="card lzinv"><div class="dkeye" style="color:var(--gold)">Invitación</div><b class="lzt">Visita a Leipzig · ${DOWL(l.date)}</b>
    <div class="info" style="margin-top:4px">Predicación: ${esc(l.teaching||'por definir')}</div>
    ${trav?'<div class="note" style="margin-top:8px">Tú viajas ese día.</div>':go?`<div class="inline" style="margin-top:10px"><span class="lzok">✓ Vas a Leipzig</span><button class="btn ghost sm" data-a="lz-go" data-v="${esc(l.id)}|0">Ya no puedo ir</button></div>`:`<div class="inline" style="margin-top:10px"><button class="btn sm" data-a="lz-go" data-v="${esc(l.id)}|1">Yo iré</button></div>`}
    ${seesLzGoing(p)?`<div class="note" style="margin-top:10px">${lzGoingLine(l)}</div>`:''}</div>`}
/* ---- ¿Hay transmisión el domingo? (lo responde el pastor desde la notificación o aquí) ---- */
// Las transmisiones siempre son en domingo: se agrega al próximo domingo que no tenga una
function trFree(){const x=pd(nextSun());let d=ds(x);while(svcGone(d)||state.trans.some(t=>t.date===d)){x.setDate(x.getDate()+7);d=ds(x)}return d}
const nextSun=()=>{const x=pd(today);x.setDate(x.getDate()+((7-x.getDay())%7));return ds(x)};
function trAnswer(d,a){if(!d||svcGone(d)){ui.trQ=null;ui.flash='Ese domingo ya pasó: no se cambió nada.';return}state.transNo=(state.transNo||[]).filter(x=>x!==d);
  if(a==='si'){if(!state.trans.some(t=>t.date===d))state.trans.push({id:uid(),date:d,link:'',note:''});ui.flash=`Anotado: hay transmisión el ${fmt(d)}. Cuando tengas el enlace, agrégalo en la pestaña Pastor.`}
  else{state.trans=state.trans.filter(t=>t.date!==d);state.transNo.push(d);ui.flash=`Anotado: no hay transmisión el ${fmt(d)}.`}
  ui.trQ=null}
function trAsk(p){if(!(p.pastor||p.admin))return'';const w=pd(today).getDay();const d=ui.trQ||((w===5||w===6)?nextSun():null);if(!d||d<today)return'';
  const yes=state.trans.some(t=>t.date===d),no=(state.transNo||[]).includes(d);if((yes||no)&&!ui.trQ)return'';
  return `<div class="card trask"><b>¿Hay transmisión internacional el ${fmt(d)}?</b>${yes||no?`<div class="info" style="margin-top:4px">Ya respondiste: <b>${yes?'sí hay':'no hay'}</b>. Puedes cambiarlo.</div>`:'<div class="info" style="margin-top:4px">Si la hay, ese día no se da introducción y el tema pasa al siguiente culto.</div>'}
    <div class="inline" style="margin-top:10px"><button class="btn sm" data-a="tr-ans" data-v="${esc(d)}|si">Sí, hay transmisión</button><button class="btn ghost sm" data-a="tr-ans" data-v="${esc(d)}|no">No hay</button></div></div>`}
function vMis(p){const nag=introNag(p),top=trAsk(p)+lzInvite(p)+misAv(p)+avisos(p)+misMeets(p)+misMsgs(p);return `<h2>Hola, ${esc(p.name.split(' ')[0])}</h2>`+nag+installHint()+pushCard()+top+(top||nag?'<h3>Tus labores</h3>':'')+misList(p)}
/* ---- vista de escritorio (PC): panel de inicio ---- */
const DESK=()=>!!(window.matchMedia&&matchMedia('(min-width:1024px)').matches);
if(window.matchMedia){const mq=matchMedia('(min-width:1024px)');const f=()=>{try{if(quiet())render()}catch(e){}};mq.addEventListener?mq.addEventListener('change',f):mq.addListener(f)}
const DOWL=d=>{const x=pd(d);return `${DOW[x.getDay()]}, ${x.getDate()} de ${MES[x.getMonth()]}`};
const ARROW='<svg viewBox="0 0 24 24" class="arw"><path d="M9 6l6 6-6 6"/></svg>';
function dkNextTeach(){const tm=teachMap();const d=Object.keys(tm).sort().find(x=>x>=today&&!svcGone(x)&&!transOn(x));return d?{d,t:tm[d]}:null}
function dkAgenda(p){const off=ui.dkWeek||0;const mon=pd(mondayOf(today));mon.setDate(mon.getDate()+off*7);
  const days=[...Array(7)].map((_,i)=>{const x=new Date(mon);x.setDate(x.getDate()+i);return ds(x)});
  const sel=ui.dkDay&&days.includes(ui.dkDay)?ui.dkDay:(days.find(d=>!svcGone(d))||days[0]);
  const items=myItems(p);const tm=teachMap();
  const strip=days.map(d=>{const x=pd(d),it=items[d],mine=it&&it.slots.length,ev=it&&!mine&&(it.notes.length||it.attend);
    return `<button class="dkday ${d===today?'today':''} ${svcGone(d)?'past':''}" data-a="dk-day" data-v="${esc(d)}" aria-pressed="${d===sel}"><span>${DOWS[x.getDay()]}</span><b>${x.getDate()}</b><i class="${svcGone(d)?'':mine?'on':ev?'ev':''}"></i></button>`}).join('');
  const it=items[sel];const w=pd(sel).getDay(),[sn,st]=SVC[w];
  let det=`<div class="dkdet-h"><b>${DOWL(sel)}</b><span>${esc(sn)} · ${st}${transOn(sel)?' · Transmisión':''}${leipOn(sel)?' · Visita a Leipzig':''}</span></div>`;
  if(svcGone(sel))det+=`<div class="info" style="margin:6px 0 0">Este culto ya pasó.</div>`;
  else if(it&&(it.slots.length||it.notes.length||it.attend))det+=`<div class="dkmine">${itemCard(sel,it,tm)}</div>`;
  else det+=`<div class="info" style="margin:6px 0 0">No tienes labores este día.</div>`;
  const as=svcGone(sel)?null:schedOf(sel);
  if(as&&canSeeMonth(p,sel.slice(0,7))){const rows=slotsAt(sel).filter(s=>as[s.k]).map(s=>{const x=person(as[s.k]);return `<div class="dkrow"><span class="lbl"><i class="dot" style="--c:var(${AREAC[s.area]})"></i>${esc(s.l)}</span><b ${as[s.k]===p.id?'class="me"':''}>${esc(x?x.name:'—')}</b></div>`}).join('');
    if(rows)det+=`<div class="dkteam"><div class="dksub">Quién sirve ese día</div><div class="dkrows">${rows}</div></div>`}
  const first=pd(days[0]),last=pd(days[6]);
  return `<section class="card dkcard"><div class="dkhead"><div><h4>Agenda de la semana</h4><small>${first.getDate()} de ${MES[first.getMonth()]} — ${last.getDate()} de ${MES[last.getMonth()]}</small></div>
    <div class="mnav"><button class="ib" data-a="dk-week" data-v="-1" aria-label="Semana anterior">‹</button>${off?`<button class="btn ghost sm" data-a="dk-week" data-v="0">Hoy</button>`:''}<button class="ib" data-a="dk-week" data-v="1" aria-label="Semana siguiente">›</button></div></div>
    <div class="dkstrip">${strip}</div><div class="dkdet">${det}</div>
    <div class="dklegend"><span><i class="on"></i>Tienes labor</span><span><i class="ev"></i>Aviso o evento</span><button class="linkbtn" data-a="tab" data-v="cal">Calendario completo</button></div></section>`}
function dkAvAdmin(p){if(!p.admin)return'';const ks=Object.keys(state.avReqs||{}).filter(k=>k>=today.slice(0,7)).sort();const ym=ks.find(k=>today<=avOf(k).deadline)||ks[ks.length-1];if(!ym)return'';
  const av=avOf(ym),all=servers(),done=all.filter(i=>av.done&&av.done[i]),pend=all.filter(i=>!(av.done&&av.done[i])),mes=MES[+ym.slice(5,7)-1];
  return `<section class="card dkcard ${pend.length&&today<=av.deadline?'dkwarn':''}"><h4>Disponibilidad de ${mes}</h4>
    <div class="dkbig"><b>${done.length} de ${all.length}</b> ya la enviaron</div><div class="info">${today<=av.deadline?'Responden hasta el '+fmt(av.deadline):'El plazo terminó el '+fmt(av.deadline)}</div>
    ${pend.length?`<div class="note"><b>Faltan:</b> ${pend.map(i=>esc((person(i)||{}).name||'')).join(', ')}</div>`:''}
    <div class="inline" style="margin-top:10px">${pend.length&&today<=av.deadline?`<button class="btn sm" data-a="av-remind" data-v="${esc(ym)}">Recordar a los que faltan</button>`:''}<button class="btn ghost sm" data-a="dk-hor" data-v="${esc(ym)}">Ver horario</button></div></section>`}
function dkTeach(p){const n=dkNextTeach();if(!n)return'';const as=schedOf(n.d)||{},pr=davidDay(n.d)?person(as.predica):state.people.find(x=>x.pastor&&x.roles.includes('pulpito')),ip=person(as.pul);
  const langs=p.admin||p.pastor?['de','en']:tradLangs(p);
  return `<section class="card dkcard dkteach"><div class="dkeye">Próxima enseñanza · ${fmt(n.d)}</div><h4 class="dkt">${esc(n.t.title)}</h4>
    <div class="dkrows"><div class="dkrow"><span class="lbl">Predica</span><b>${pr?esc(pr.name):'—'}</b></div><div class="dkrow"><span class="lbl">Introducción</span><b>${ip?esc(ip.name):'sin asignar'}</b></div></div>
    <div class="info" style="margin-top:8px"><b>Tema de la introducción:</b> ${esc(INTROT[introTema(n.d)])}${introView(n.d)}</div>${pdfLink('t',n.t,langs)}
    ${tabsFor(p).some(t=>t[0]==='ens')?`<button class="linkbtn" data-a="tab" data-v="ens" style="margin-top:6px">Ver todas las enseñanzas</button>`:''}</section>`}
function dkNotifs(p){const ns=state.notifs.filter(n=>n.to.includes(p.id)&&nLive(n)).slice(0,4);
  return `<section class="card dkcard"><div class="dkhead"><h4>Avisos</h4><button class="linkbtn" data-a="bell">Ver todos</button></div>
    ${ns.length?`<div class="dknot">${ns.map(n=>nItem(n,p,!n.read.includes(p.id))).join('')}</div>${ns.some(n=>!n.read.includes(p.id))?'<button class="btn ghost sm" data-a="readall" style="margin-top:8px">Marcar como leídos</button>':''}`:'<div class="info">Sin avisos.</div>'}</section>`}
function dkQuick(p){const L={cal:'Ver calendario',disp:'Mis días para servir',hor:'Horario del mes',ens:p.admin||p.pastor?'Enseñanzas (pastor)':'Predicaciones',per:'Personas'};
  const it=tabsFor(p).filter(t=>t[0]!=='mis').map(([k])=>`<button class="dkq" data-a="tab" data-v="${esc(k)}">${ICON[k]}<span>${L[k]}</span>${ARROW}</button>`).join('');
  return `<section class="card dkcard"><h4>Accesos rápidos</h4><div class="dkql">${it}<button class="dkq" data-a="tab" data-v="aj">${ICON.aj}<span>Ajustes y mi calendario</span>${ARROW}</button></div></section>`}
function vDash(p){const items=myItems(p);for(const d in items)if(svcGone(d))delete items[d];
  const fut=Object.keys(items).sort().filter(d=>items[d].slots.length);
  const un=unreadFor(p),ask=introPend(p).length+pendingFor(p).length+myMeets(p).filter(m=>!m.rsvp[p.id]).length+Object.keys(state.avReqs||{}).filter(ym=>{const av=avOf(ym);return ym>=today.slice(0,7)&&today<=av.deadline&&!(av.done&&av.done[p.id])&&p.roles&&p.roles.length}).length;
  const h=new Date().getHours(),hi=h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches';const td=pd(today);
  const areas=myAreas(p);
  const top=introNag(p)+trAsk(p)+lzInvite(p)+misAv(p)+avisos(p,true)+misMeets(p)+misMsgs(p);
  const stat=(n,t,s,a,v)=>`<button class="card dkstat" data-a="${a}" data-v="${esc(v||'')}"><div class="dkst-n">${n}</div><div><b>${t}</b><small>${s}</small></div>${ARROW}</button>`;
  return `<div class="dkgrid"><div class="dkmain">
    <section class="card dkhero"><div><div class="dkeye">Mi espacio · Labores Berlín</div><h1>${hi}, ${esc(p.name.split(' ')[0])}</h1>
      <p>Tus labores, avisos y fechas de servicio en un mismo lugar.</p>
      <div class="chips">${p.admin?'<span class="chip" style="--c:var(--navy)">Administración</span>':''}${p.pastor?'<span class="chip" style="--c:var(--gold)">Pastor</span>':''}${areas.map(a=>chip(a,AREAN[a])).join('')}</div></div>
      <div class="dkdate">${CALI}<span>${DOW[td.getDay()]}, ${td.getDate()} de ${MES[td.getMonth()]}<br>de ${td.getFullYear()}</span></div></section>
    <div class="dkstats">${stat(fut.length,'Próximas labores',fut.length?'La próxima: '+fmt(fut[0]):'Aún no tienes asignadas','dk-go','dk-lab')}${stat(un,'Avisos sin leer',un?'Toca para leerlos':'Estás al día','bell')}${stat(ask,'Por responder',ask?'Reemplazos, reuniones o disponibilidad':'Nada pendiente','dk-go','dk-ask')}</div>
    ${dkAgenda(p)}
    ${top?`<section id="dk-ask" class="dkblock"><h4 class="dksec">Necesita tu atención</h4>${top}</section>`:''}
    <section id="dk-lab" class="dkblock"><h4 class="dksec">Mis próximas labores</h4>${misList(p)}</section>
  </div><aside class="dkside">${dkNotifs(p)}${dkTeach(p)}${dkAvAdmin(p)}${dkQuick(p)}</aside></div>`}
/* ---- mensajes por equipo ---- */
function teamIds(area){return state.people.filter(x=>area==='all'||x.roles.some(r=>ROLEAREA[r]===area)||(area==='pulpito'&&x.pastor)).map(x=>x.id)}
function msgsFor(p,ym){const a=myAreas(p);return state.msgs.filter(m=>m.month===ym&&(m.area==='all'||a.includes(m.area)||m.from===p.id))}
function msgCard(m,del){const f=person(m.from),[y,mo]=m.month.split('-').map(Number);
  return `<div class="card"><div class="dayhead"><span class="msgfrom">${esc(f?f.name:'Púlpito')}${f&&f.pastor?' · Pastor':''}</span>${del?`<button class="x" data-a="msg-del" data-v="${esc(m.id)}" aria-label="Borrar mensaje">✕</button>`:''}</div><div class="dayhead"><span class="info" style="margin:0;display:flex;align-items:center;gap:6px"><i class="dot" style="--c:var(${m.area==='all'?'--gold':AREAC[m.area]})"></i>${m.area==='all'?'Para todos':'Equipo de '+AREAN[m.area].toLowerCase()} · ${MES[mo-1]}</span></div>
    <div class="pre" style="margin-top:8px">${linkify(m.text)}</div></div>`}
function misMsgs(p){const ms=[...new Set([today.slice(0,7),defaultMonth()])].flatMap(ym=>msgsFor(p,ym));
  return ms.length?`<h3 style="margin-top:4px">Mensajes del mes</h3><div class="list">${ms.map(m=>msgCard(m,false)).join('')}</div>`:''}
function msgBlock(p){const ms=state.msgs.filter(m=>m.month===ui.month),mo=+ui.month.slice(5,7);let h='';
  if(ui.compose)h+=`<div class="panel" style="margin-top:12px"><b>Mensaje para ${MES[mo-1]}</b>
    <label class="field" style="margin-top:8px">Para<select id="msg-area"><option value="all">Todos los equipos</option>${Object.entries(AREAN).map(([k,l])=>`<option value="${k}">Equipo de ${l.toLowerCase()}</option>`).join('')}</select></label>
    <label class="field">Mensaje<textarea id="msg-text" rows="4" placeholder="Un mensaje de ánimo o las instrucciones del mes"></textarea></label>
    <div class="inline"><button class="btn sm" data-a="msg-send">Enviar</button><button class="btn ghost sm" data-a="msg-x">Cancelar</button></div></div>`;
  else h+=`<button class="btn ghost sm" data-a="msg-open" style="margin-top:12px">Escribir mensaje a un equipo</button>`;
  if(ms.length)h+=`<div class="list" style="margin-top:10px">${ms.map(m=>msgCard(m,m.from===p.id||p.admin)).join('')}</div>`;
  return h}
function vCal(p){
  const tabs=[['cal','Mi mes']];if(myAreas(p).length)tabs.push(['equipo','Mi equipo']);
  if(!tabs.some(t=>t[0]===ui.mv))ui.mv='cal';
  const h=`<h2>Calendario</h2>${calBanner(p)}${tabs.length>1?`<div class="filters" style="padding:4px 0 6px">${tabs.map(([k,l])=>`<button class="f" data-a="mv" data-v="${esc(k)}" aria-pressed="${ui.mv===k}">${l}</button>`).join('')}</div>`:''}`;
  return h+(ui.mv==='equipo'?misTeam:misCal)(p);
}
function misCal(p){
  const items=myItems(p),tm=teachMap(),dates=monthDates(ui.cm);
  if(!ui.sel||ui.sel.slice(0,7)!==ui.cm)ui.sel=dates.find(d=>d>=today&&items[d]&&items[d].slots.length)||dates.find(d=>items[d])||null;
  const lead=(pd(dates[0]).getDay()+6)%7;
  let h=monthNav()+`<div class="cal">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=>`<span class="h">${x}</span>`).join('')}${'<span></span>'.repeat(lead)}`;
  for(const d of dates){const it=items[d];const areas=it?[...new Set(it.slots.map(s=>s.area))]:[];
    h+=`<button class="cd ${areas.length?'':'free'} ${d===today?'today':''}" data-a="selday" data-v="${esc(d)}" aria-pressed="${ui.sel===d}"><b>${pd(d).getDate()}${it&&it.notes.length?'<i class="nt"></i>':''}</b>${areas.slice(0,2).map(a=>`<span class="lab" style="--c:var(${AREAC[a]})">${SHORT[a]}</span>`).join('')+(it&&it.attend?'<span class="lab" style="--c:var(--gold)">Alabanza</span>':'')}${areas.length>2?`<span class="more">+${areas.length-2}</span>`:''}</button>`}
  h+='</div>';
  const n=dates.filter(d=>items[d]&&items[d].slots.length).length;
  h+=`<div class="info" style="margin:10px 0">${n?`${n} ${n===1?'día':'días'} con labor este mes. Toca un día para ver el detalle.`:'No tienes labores este mes.'}</div>`;
  if(ui.sel)h+=items[ui.sel]?itemCard(ui.sel,items[ui.sel],tm):`<div class="card info">${fmt(ui.sel)}: no tienes labor este día.</div>`;
  return h;
}
function misTeam(p){
  const sched=canSeeMonth(p,ui.cm)?state.schedules[ui.cm]:null;const areas=myAreas(p);
  const grids=GRIDS.filter(g=>g.role?p.roles.includes(g.role):(g.areas||[g.area]).some(a=>areas.includes(a)));
  const mm=msgsFor(p,ui.cm);
  let h=monthNav()+(mm.length?`<div class="list" style="margin-bottom:12px">${mm.map(m=>msgCard(m,false)).join('')}</div>`:'')+`<p class="lead">El horario completo de ${grids.map(g=>g.title.toLowerCase()).join(', ')}. Tu nombre está resaltado.</p>`;
  if(!sched)return h+`<div class="card empty-state">El horario de este mes todavía no está publicado.</div>`;
  return h+gridView(weeksOf(ui.cm),sched,{grids,ro:true,me:p.id});
}
function misList(p){
  const items=myItems(p);const tm=teachMap();
  for(const d in items)if(svcGone(d))delete items[d];
  const dates=Object.keys(items).sort();
  const upcoming=dates.filter(d=>items[d].slots.length).length;
  let h=`<p class="lead">${upcoming?`Tienes ${upcoming} ${upcoming===1?'culto':'cultos'} con labor en las próximas semanas.`:'No tienes labores asignadas todavía.'}</p>`;
  if(!dates.length)return h+`<div class="card empty-state">Cuando se publique el horario del mes, tus labores aparecen aquí.</div>`;
  h+='<div class="list">'+dates.map(d=>itemCard(d,items[d],tm)).join('');
  return h+'</div>';
}

/* Mis días: 1) días de la semana (fijo, todos los meses); 2) un calendario por mes para tocar las fechas en que no puedo.
   Entre el 15 y el cierre, arriba del calendario sale el pedido del admin con «Enviar mi disponibilidad». */
function avPending(p){return Object.keys(state.avReqs||{}).sort().filter(ym=>{const av=avOf(ym);return ym>=today.slice(0,7)&&today<=av.deadline})}
function vDisp(p){
  const order=[1,2,3,4,5,6,0],cur=today.slice(0,7);
  if(!ui.dm||ui.dm<cur){const pend=avPending(p).filter(ym=>!(avOf(ym).done&&avOf(ym).done[p.id]));ui.dm=pend[0]||cur}
  const ym=ui.dm,mes=MES[+ym.slice(5,7)-1],Mes=mes[0].toUpperCase()+mes.slice(1),y=ym.slice(0,4);
  const dates=monthDates(ym),lead=(pd(dates[0]).getDay()+6)%7,wk=d=>!p.days.includes(pd(d).getDay()),nw=dates.filter(wk).length,n=dates.filter(d=>wk(d)||p.blocked.includes(d)).length;
  const lock=isPub(ym)||Object.keys(state.schedules[ym]||{}).length>0;
  const av=avOf(ym),open=!lock&&av&&today<=av.deadline&&p.roles&&p.roles.length,done=av&&av.done&&av.done[p.id];
  const req=open?(done?`<div class="avok">✓ Enviaste tu disponibilidad de ${mes}. Si cambias algo, se guarda solo.</div>`
    :`<div class="card ask" style="margin:0 0 12px"><b>Te piden tu disponibilidad de ${mes}</b><div class="info" style="margin-top:4px">Toca abajo los días que <b>no puedes</b> y después «Enviar». Antes del <b>${fmt(av.deadline)}</b>.</div></div>`):'';
  return `<h2>Mis días para servir</h2><p class="lead">El horario de cada mes se arma con esto.</p>
  <h3>1 · Mis días de la semana</h3><div class="info" style="margin:-4px 0 8px">Vale para todos los meses.</div><div class="card">${order.map(w=>{const on=p.days.includes(w);return `<div class="drow"><div class="dname"><b>${DOW[w]}</b><small>${SVC[w][0]} · ${SVC[w][1]}</small></div>
     <button class="sw" role="switch" aria-checked="${on}" data-a="day" data-v="${esc(w)}" aria-label="${DOW[w]}: ${on?'puedo':'no puedo'}"><span class="swl">${on?'Puedo':'No puedo'}</span><span class="swt"><span class="swk"></span></span></button></div>`}).join('')}</div>
  <h3>2 · Fechas en que no puedo</h3>${lock?`<div class="card ask" style="margin:0 0 12px"><b>El horario de ${mes} ya está hecho</b><div class="info" style="margin-top:4px">Aquí ya no se puede cambiar. Si no puedes ir a una labor, avisa desde su tarjeta con <b>«No puedo ir»</b> para que se busque reemplazo.</div><button class="btn sm" data-a="tab" data-v="mis" style="margin-top:10px">Ir a Labores</button></div>`:req}<div class="card${lock?' locked':''}">
   <div class="mnav" style="margin:0 0 10px;justify-content:space-between"><button class="ib" data-a="dm" data-v="-1" aria-label="Mes anterior" ${ym<=cur?'disabled':''}>‹</button><b>${Mes} ${y}</b><button class="ib" data-a="dm" data-v="1" aria-label="Mes siguiente">›</button></div>
   ${lock?'':`<div class="info" style="margin:0 0 10px">Toca los días que <b>no puedes</b> servir. Los demás quedan disponibles.</div>`}
   <div class="cal">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=>`<span class="h">${x}</span>`).join('')}${'<span></span>'.repeat(lead)}${dates.map(d=>wk(d)?`<button class="tog avd wk${d<today?' past':''}" aria-pressed="true" aria-label="${fmt(d)}: no puedes (por tus días de la semana)" disabled>${pd(d).getDate()}</button>`:`<button class="tog avd" data-a="avday" data-v="${esc(d)}" aria-pressed="${p.blocked.includes(d)}" aria-label="${fmt(d)}" ${d<today||lock?'disabled':''}>${pd(d).getDate()}</button>`).join('')}</div>
   <div class="info" style="margin-top:8px">${n?`En ${mes} no puedes ${n} ${n===1?'día':'días'}${nw?` (${nw} por tus días de la semana, en gris; se cambian arriba)`:''}.`:`En ${mes} puedes todos los días.`}</div>
   ${open?predPick(p,ym,dates):''}
   ${open&&!done?`<button class="btn" data-a="av-done" data-v="${esc(ym)}" style="width:100%;margin-top:16px">Enviar mi disponibilidad de ${mes}</button>`:''}</div>`;
}

/* ---- panel del mes (filas) y menú ⋯ del horario ---- */
function monthPanel(p,m,RO){const ym=ui.month,mes=MES[m-1];
  const row=(k,ic,t,v)=>`<button class="mrow" data-a="mrow" data-v="${esc(k)}"><span class="mic">${ic}</span><span class="mt">${t}</span><span class="mv">${v}</span>${ARROW}</button>`;
  const ms=state.msgs.filter(x=>x.month===ym).length,mt=state.meets.filter(x=>x.date>=today).length;
  let r='';
  if(!RO){const av=avOf(ym),all=servers();const done=av?all.filter(i=>av.done&&av.done[i]).length:0;
    const no=state.people.filter(x=>x.roles&&x.roles.length&&x.blocked.some(d=>d.slice(0,7)===ym)).length;
    r+=row('av',MI.av,'Disponibilidad',av?`<b>${done} de ${all.length}</b> enviaron`:'Sin pedir');
    r+=row('no',MI.no,'Quién no puede',no?`<b>${no}</b> ${no===1?'persona':'personas'}`:'Nadie');}
  r+=row('msg',MI.msg,'Mensajes a equipos',ms?`<b>${ms}</b> ${ms===1?'enviado':'enviados'}`:'Ninguno');
  r+=row('meet',MI.meet,'Reuniones',mt?`<b>${mt}</b> ${mt===1?'próxima':'próximas'}`:'Ninguna');
  return `<div class="card mpanel"><div class="mph">${RO?'Del equipo':'Organización de '+mes}</div>${r}</div>`}
const MI={av:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4"/></svg>',
  no:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M6.5 6.5l11 11"/></svg>',
  msg:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  meet:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3 19c.9-3 3.2-4.5 6-4.5s5.1 1.5 6 4.5M15.5 14.6c2.6-.3 4.6.9 5.5 3.9"/></svg>'};
function mrowSheet(p){const m=+ui.month.slice(5,7),mes=MES[m-1],k=ui.mrow;
  const T={av:'Disponibilidad de '+mes,no:'Quién no puede en '+mes,msg:'Mensajes a equipos · '+mes,meet:'Reuniones'};
  let c='';
  if(k==='av'){ui.avList=true;c=avAdmin(m).replace(/<b>Disponibilidad de [^<]*<\/b>/,'').replace(/<button class="btn ghost sm" data-a="av-list">[^<]*<\/button>/,'').replace('class="card" style="margin-top:10px"','class="mrin"')}
  else if(k==='no'){ui.avAll=true;c=avAll(m).replace(/<button class="x" data-a="av-all"[^>]*>✕<\/button>/,'').replace(/<div class="dayhead"><b>Quién no puede en [^<]*<\/b><\/div>/,'').replace('class="card" style="margin-top:10px"','class="mrin"')}
  else if(k==='msg')c=msgBlock(p);
  else if(k==='meet')c=meetBlock(p);
  return `<div class="scrim" data-a="mrow-x"></div><div class="sheet mrsheet" role="dialog" aria-label="${esc(T[k]||'')}"><div class="dayhead"><b style="font-size:18px">${esc(T[k]||'')}</b><button class="x" data-a="mrow-x" aria-label="Cerrar">✕</button></div><div class="mrbody">${c}</div></div>`}
function hmenuSheet(){const pubd=isPub(ui.month),hasS=!!state.schedules[ui.month],mes=MES[+ui.month.slice(5,7)-1];
  const it=(a,t,sub,cls)=>`<button class="pk ${cls||''}" data-a="${a}"><span>${t}${sub?`<small style="display:block;color:var(--muted)">${sub}</small>`:''}</span></button>`;
  return `<div class="scrim" data-a="hmenu-x"></div><div class="sheet" role="dialog" aria-label="Opciones del horario"><div class="dayhead"><b style="font-size:18px">Horario de ${mes}</b><button class="x" data-a="hmenu-x" aria-label="Cerrar">✕</button></div><div class="pklist">
    ${hasS?(pubd?it('unpublish','Volver a borrador','Los hermanos dejan de ver el horario hasta que lo publiques de nuevo.'):it('publish','Publicar horario','Todos lo ven y les llega un aviso.')):''}
    ${hasS&&DL?it('pdf','Descargar PDF','El horario del mes para imprimir o enviar.'):''}
    ${hasS?it('regen','Volver a generar','Arma el horario de nuevo y reemplaza los cambios.','clear'):it('gen','Generar horario','')}</div></div>`}
function vHor(p){const RO=!p.admin;
  const[y,m]=ui.month.split('-').map(Number);const sched=canSeeMonth(p,ui.month)?state.schedules[ui.month]:null;
  const pubd=isPub(ui.month),hasS=!!state.schedules[ui.month];
  const pill=!RO&&hasS?`<button class="stpill ${pubd?'ok':'draft'}" data-a="hmenu" aria-label="Estado del horario: ${pubd?'publicado':'borrador'}"><i></i>${pubd?'Publicado':'Borrador'}</button>`:'';
  let h=`<div class="bar"><div class="hbar-l"><div class="mnav"><button class="ib" data-a="month" data-v="-1" aria-label="Mes anterior">‹</button><b>${MES[m-1]} ${y}</b><button class="ib" data-a="month" data-v="1" aria-label="Mes siguiente">›</button></div><span class="dkonly">${pill}</span></div>
    <div class="inline">${!RO&&hasS&&!pubd?'<button class="btn sm" data-a="publish">Publicar</button>':''}${sched&&DL?`<button class="btn ghost sm ${RO?'':'dkonly'}" data-a="pdf">Descargar PDF</button>`:''}${RO?'':!hasS?`<button class="btn sm" data-a="gen">Generar horario</button>`:''}${RO?'':`<button class="ib more" data-a="hmenu" aria-label="Más opciones">⋯</button>`}</div></div>${ui.pdfMsg?`<div class="info" style="margin-top:8px">${esc(ui.pdfMsg)}</div>`:''}
    ${pill?`<div class="stline"><span class="mbonly">${pill}</span><span class="info" style="margin:0">${pubd?'Todos ven el horario de '+MES[m-1]+'.':'Los hermanos todavía no lo ven. Ajusta y publícalo.'}</span></div>`:''}`;
  if(ui.regen)h+=`<div class="confirm">Se reemplazan todos los cambios de ${MES[m-1]}. <button class="btn warnb sm" data-a="gen">Sí, generar de nuevo</button><button class="btn ghost sm" data-a="regen-no">Cancelar</button></div>`;
  h+=monthPanel(p,m,RO);
  h+=`<div class="filters"><button class="f" data-a="view" data-v="grid" aria-pressed="${ui.view==='grid'}">Tabla</button><button class="f" data-a="view" data-v="cards" aria-pressed="${ui.view==='cards'}">Por día</button><span style="width:1px;background:var(--line);flex:none"></span>${[['all','Todo'],...Object.entries(AREAN)].map(([k,l])=>`<button class="f" data-a="area" data-v="${esc(k)}" aria-pressed="${ui.area===k}">${l}</button>`).join('')}</div>`;
  if(!sched)return h+`<div class="card empty-state" style="margin-top:12px">Todavía no hay horario para ${MES[m-1]}. ${RO?'El administrador lo publica pronto.':'Revisa que las enseñanzas, transmisiones y viajes a Leipzig estén cargados, y luego genera el horario.'}</div>`;
  let empties=0,conf=0;const tm=teachMap();const weeks={};
  for(const d of monthDates(ui.month))(weeks[mondayOf(d)]=weeks[mondayOf(d)]||[]).push(d);
  let body='';let n=0;
  for(const wk in weeks){n++;const ds_=weeks[wk];const a=pd(ds_[0]),b=pd(ds_[ds_.length-1]);
    const fut=ds_.filter(d=>!svcGone(d));if(!fut.length)continue;
    body+=`<div class="week">Semana ${n}<span>${a.getDate()} – ${b.getDate()} ${MESS[b.getMonth()]}</span></div><div class="list">`;
    for(const d of fut){const r=dayCard(d,sched[d]||{},tm);empties+=r.e;conf+=r.c;body+=r.h}
    body+='</div>'}
  if(!body)body=`<div class="card empty-state" style="margin-top:12px">Ya pasaron todos los cultos de ${MES[m-1]}.</div>`;
  if(ui.view==='grid')body=gridView(weeks,sched,RO?{ro:true,me:p.id}:{});
  const sum=empties||conf?`<div class="confirm" style="background:var(--warn-soft)">${empties?`${empties} ${empties===1?'puesto vacío':'puestos vacíos'}`:''}${empties&&conf?' · ':''}${conf?`${conf} con conflicto`:''}. Toca un nombre para cambiarlo.</div>`:`<div class="info" style="margin-top:10px">Todo cubierto y sin conflictos. Toca un nombre para cambiarlo.</div>`;
  return h+(RO?`<div class="info" style="margin-top:6px">Solo lectura. Los cambios los hace el administrador.</div>`:sum)+body;
}
function dayCard(d,as,tm){
  const w=pd(d).getDay(),slots=slotsAt(d),[sn,st]=SVC[w];let e=0,c=0;
  let info='';
  if(w===1||w===3||w===5)info=`Preámbulo sugerido: <b>${esc(PREAMB[preamb(d)])}</b>`;
  if(w===4||w===0){const t=transOn(d);info=t?`<b>Transmisión internacional</b>${t.link?'':' · falta la información'}`:tm[d]?`Enseñanza: <b>${esc(tm[d].title)}</b>`:'Enseñanza: <b>sin asignar</b>'}
  const lz=leipOn(d);
  let rows='';
  for(const s of slots){
    const pid=as[s.k],p=person(pid);let warn='';
    if(!p){e++;warn=''}else{warn=why(p,s,d,as,slots);
      if(!warn&&(s.pair||s.pairOf)){const o=person(as[s.pair||s.pairOf]);if(o&&o.sex!==p.sex)warn='pareja mixta'}
      if(warn)c++}
    if(ui.area!=='all'&&s.area!==ui.area)continue;
    const key=d+'|'+s.k;let right;
    if(!me().admin)right=`<span class="fixedn ${p&&p.id===state.me?'gn meh':''}">${p?esc(p.name):'—'}</span>`;
    else right=`<div style="min-width:0"><button class="pick ${p?'':'empty'}" data-a="edit" data-v="${esc(key)}">${p?esc(p.name):emptyLbl(d,s.k,'Sin asignar')}</button>${warn?`<span class="warn">${esc(warn)}</span>`:''}</div>`;
    rows+=`<div class="row"><span class="lbl"><i class="dot" style="--c:var(${AREAC[s.area]})"></i>${esc(s.l)}</span>${right}</div>`}
  if(!rows)return{h:'',e,c};
  return{e,c,h:`<div class="card"><div class="dayhead"><span class="t">${DOW[w]} ${pd(d).getDate()}</span><span class="s">${sn} · ${st}${lz?'<span class="tag gold">Leipzig</span>':''}</span></div>
    <div class="info">${info}</div><div class="rows">${rows}</div></div>`};
}

const DCOLS=[1,2,3,4,5,6,0];
const GRIDS=[
 {area:'pulpito',title:'Púlpito',cols:DCOLS.map(w=>[w,[1,3,5].includes(w)?['pul_ini','pul_fin']:w===4?['pul','predica']:['pul'],[1,3,5].includes(w)?'Inicia / finaliza':(w===2||w===6)?'Inicia y finaliza':'Introducción'])},
 {area:'puerta',title:'Puerta',cols:DCOLS.map(w=>[w,['puerta']])},
 {area:'sonido',title:'Equipo de sonido',cols:DCOLS.map(w=>[w,['sonido']])},
 {area:'trad',role:'trad_de',title:'Interpretación alemán',cols:[4,0].flatMap(w=>[['de_intro','Introducción'],['de_pred','Predicación'],['de_test','Testimonios']].map(([k,l])=>[w,[k],l]))},
 {area:'trad',role:'trad_en',title:'Interpretación inglés',cols:[['en_intro','Introducción'],['en_pred','Predicación'],['en_test','Testimonios']].map(([k,l])=>[0,[k],l])},
 // En pantalla, ofrendas y micrófonos van por separado (en el PDF siguen juntos)
 {area:'ofr',wide:true,title:'Ofrendas',cols:[[4,['ofr1','ofr2'],'Recogen'],[4,['ent'],'Entrega'],[4,['grd1','grd2','grd3'],'Guardan'],[0,['ofr1','ofr2','ofr3','ofr4'],'Recogen'],[0,['ent'],'Entrega'],[0,['grd1','grd2','grd3'],'Guardan']]},
 {area:'mic',title:'Micrófonos',cols:[[4,['mic1']],[0,['mic1','mic2']]]}
];
function gridHead(g){const rep=g.cols.some((c,i)=>i&&c[0]===g.cols[i-1][0]);
  if(!rep)return `<thead><tr><th>Semana</th>${g.cols.map(([w,,sub])=>`<th>${DOW[w]}${sub?`<small>${sub}</small>`:''}</th>`).join('')}</tr></thead>`;
  const grp=[];for(const c of g.cols){const l=grp[grp.length-1];if(l&&l.w===c[0])l.n++;else grp.push({w:c[0],n:1})}
  return `<thead><tr><th rowspan="2">Semana</th>${grp.map(x=>`<th colspan="${x.n}" style="text-align:center">${DOW[x.w]}</th>`).join('')}</tr><tr>${g.cols.map(c=>`<th style="font-weight:600">${c[2]||''}</th>`).join('')}</tr></thead>`}
// Una semana ya terminó cuando pasa el domingo a las 13:00 (si la fila no llega a domingo, cuando pasó su último culto)
function weekPast(list){const last=list[list.length-1],e=pd(last);if(e.getDay()===0){e.setHours(13,0,0,0);return Date.now()>=e.getTime()}return list.every(d=>svcGone(d))}
function gridView(weeks,sched,opt={}){
  let h='';
  for(const g of (opt.grids||GRIDS)){if(!opt.grids&&ui.area!=='all'&&!(g.areas||[g.area]).includes(ui.area))continue;
    h+=`<section class="gblock ${g.wide?'full':''}"><h3>${g.title}</h3><div class="gwrap"><table>${gridHead(g)}<tbody>`;
    let n=0;
    for(const wk in weeks){n++;const list=weeks[wk];const a=pd(list[0]),b=pd(list[list.length-1]);
      h+=`<tr class="${weekPast(list)?'past':''}"><th class="wk">Semana ${n}<small>${a.getDate()} – ${b.getDate()} ${MESS[b.getMonth()]}</small></th>`;
      for(const[w,keys]of g.cols){const d=list.find(x=>pd(x).getDay()===w);
        if(!d){h+='<td class="na">—</td>';continue}
        const as=sched[d]||{},slots=slotsAt(d);
        h+=`<td class="${svcGone(d)?'pastd':''}">${leipOn(d)?'<small class="lz">Visita Leipzig</small>':''}<div class="cn ${keys.length===4?'two':''}">${keys.map(k=>{const s=slots.find(z=>z.k===k);return s?(k==='predica'?'<small class="info" style="margin:2px 0 0">Predi.</small>':k==='pul'&&slots.some(z=>z.k==='predica')?'<small class="info" style="margin:2px 0 0">Intro.</small>':'')+gcell(d,s,as,slots,opt):''}).join('')}</div></td>`}
      h+='</tr>'}
    h+='</tbody></table></div></section>'}
  h=`<div class="grids">${h}</div>`;
  return h;
}
function gcell(d,s,as,slots,opt={}){const key=d+'|'+s.k,p=person(as[s.k]);
  if(opt.ro)return `<span class="gn ${p&&p.id===opt.me?'meh':''}">${p?esc(p.name):'—'}</span>`;
  let warn=p?why(p,s,d,as,slots):'';
  if(p&&!warn&&(s.pair||s.pairOf)){const o=person(as[s.pair||s.pairOf]);if(o&&o.sex!==p.sex)warn='pareja mixta'}
  return `<button class="pick g ${p?'':'empty'} ${warn?'bad':''}" data-a="edit" data-v="${esc(key)}" ${warn?`title="${esc(warn)}"`:''}>${p?esc(p.name):emptyLbl(d,s.k,'Vacío')}${warn?' · '+esc(warn):''}</button>`}
function pickSheet(){const[d,k]=ui.edit.split('|');const slots=slotsAt(d),s=slots.find(z=>z.k===k);if(!s)return'';
  const as=(state.schedules[d.slice(0,7)]||{})[d]||{},pid=as[k],others={...as};delete others[k];const ok=[],no=[];
  for(const x of state.people)if(x.roles.includes(s.role)||(s.altRole&&x.roles.includes(s.altRole))){const r=why(x,s,d,others,slots);(r?no:ok).push([x,r])}
  const it=(x,r)=>`<button class="pk ${x.id===pid?'on':''} ${r?'no':''}" data-a="assign" data-v="${esc(ui.edit)}|${esc(x.id)}"><span>${esc(x.name)}</span>${r?`<small>${esc(r)}</small>`:''}${x.id===pid?'<b>✓</b>':''}</button>`;
  return `<div class="scrim" data-a="pick-x"></div><div class="sheet" role="dialog" aria-label="Elegir persona"><div class="dayhead"><div><b>${esc(s.l)}</b><small class="info" style="display:block;margin:2px 0 0">${fmt(d)}</small></div><button class="x" data-a="pick-x" aria-label="Cerrar">✕</button></div>
   <div class="pklist">${pid?`<button class="pk clear" data-a="assign" data-v="${esc(ui.edit)}|">Dejar sin asignar</button>`:''}
   <div class="pkh">Disponibles</div>${ok.map(([x])=>it(x,'')).join('')||'<div class="info">Nadie disponible.</div>'}
   ${no.length?`<div class="pkh">Con conflicto</div>${no.map(([x,r])=>it(x,r)).join('')}`:''}</div></div>`}
function selectFor(d,s,as,slots){const key=d+'|'+s.k,pid=as[s.k],others={...as};delete others[s.k];const ok=[],no=[];
  for(const x of state.people)if(x.roles.includes(s.role)){const r=why(x,s,d,others,slots);(r?no:ok).push([x,r])}
  return `<select class="cell" id="sel-${key}" data-c="cell" data-v="${esc(key)}"><option value="">— Sin asignar</option><optgroup label="Disponibles">${ok.map(([x])=>`<option value="${esc(x.id)}" ${x.id===pid?'selected':''}>${esc(x.name)}</option>`).join('')}</optgroup>${no.length?`<optgroup label="Con conflicto">${no.map(([x,r])=>`<option value="${esc(x.id)}" ${x.id===pid?'selected':''}>${esc(x.name)} (${esc(r)})</option>`).join('')}</optgroup>`:''}</select>`}

/* ---- PDF ---- */
function saveBlob(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
const DL={save:async({filename,data})=>{saveBlob(filename,data);return{status:'saved'}}};
function buildPdf(ym){
  const{jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  const sched=state.schedules[ym]||{},weeks=weeksOf(ym),[y,m]=ym.split('-').map(Number),mes=MES[m-1];
  const nm=id=>{const p=person(id);return p?p.name:'—'};
  const dayIn=(list,w)=>list.find(x=>pd(x).getDay()===w);
  const g=(d,k)=>d?nm((sched[d]||{})[k]):'—';
  const rows=[];let n=0;for(const wk in weeks){n++;const l=weeks[wk],a=pd(l[0]),b=pd(l[l.length-1]);rows.push([`Semana ${n}: ${a.getDate()} – ${b.getDate()} ${MESS[b.getMonth()]}`,l])}
  const NAVY=[29,44,102];
  const base={theme:'grid',styles:{fontSize:8,cellPadding:1.2,halign:'center',valign:'middle',lineColor:[160,160,160],lineWidth:0.2,textColor:20},headStyles:{fillColor:[230,234,246],textColor:20,fontStyle:'bold',halign:'center'},margin:{left:10,right:10}};
  const header=sub=>{doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(...NAVY);doc.text(`Labores Berlín · ${mes[0].toUpperCase()+mes.slice(1)} ${y}`,10,12);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(90);doc.text(sub,287,12,{align:'right'})};
  const title=(t,yy)=>{doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...NAVY);doc.text(t,148.5,yy,{align:'center'})};
  const next=()=>doc.lastAutoTable.finalY+(doc.getNumberOfPages()>1?6:8);
  const W=[1,2,3,4,5,6,0],wkCol={0:{halign:'left',fontStyle:'bold',cellWidth:40}};
  // Hoja 1
  header('Púlpito · Sonido · Puerta');
  const pb=[];for(const[lab,l]of rows){const r1=[{content:lab,rowSpan:2},'Inicia'],r2=['Finaliza'];
    for(const w of W){const d=dayIn(l,w);if([1,3,5].includes(w)){r1.push(g(d,'pul_ini'));r2.push(g(d,'pul_fin'))}else if(d&&leipOn(d)){r1.push({content:g(d,'pul')+'\nVisita Leipzig',rowSpan:2})}else if(d&&slotsAt(d).some(z=>z.k==='predica')){r1.push(g(d,'pul'));r2.push('Predica: '+g(d,'predica'))}else r1.push({content:g(d,'pul'),rowSpan:2})}
    pb.push(r1,r2)}
  title('Púlpito · Alabanza / Introducción',20);
  doc.autoTable({...base,startY:22,head:[['Fecha','',...W.map(w=>DOW[w])]],body:pb,columnStyles:{...wkCol,1:{fontSize:7,textColor:100,cellWidth:15}}});
  for(const[k,t]of[['sonido','Equipo de sonido'],['puerta','Puerta']]){const yy=next();title(t,yy);
    doc.autoTable({...base,startY:yy+2,head:[['Fecha',...W.map(w=>DOW[w])]],body:rows.map(([lab,l])=>[lab,...W.map(w=>g(dayIn(l,w),k))]),columnStyles:wkCol})}
  const ev=[...state.trans.filter(t=>t.date.startsWith(ym)).map(t=>`Transmisión internacional: ${fmt(t.date)}`),...state.leipzig.filter(l=>l.date.startsWith(ym)).map(l=>`Visita a Leipzig: ${fmt(l.date)}${l.teaching?' ('+l.teaching+')':''}`)];
  if(ev.length){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(70);doc.text(ev.join('   ·   '),10,Math.min(next()-2,203))}
  // Hoja 2
  doc.addPage();header('Interpretación · Ofrendas · Micrófonos');
  base.styles={...base.styles,fontSize:7.2,cellPadding:0.7};
  const parts=['Introducción','Predicación','Testimonios'];
  title('Interpretación alemán',20);
  doc.autoTable({...base,startY:22,head:[[{content:'Fecha',rowSpan:2},{content:'Jueves',colSpan:3},{content:'Domingo',colSpan:3}],[...parts,...parts]],
    body:rows.map(([lab,l])=>{const t=dayIn(l,4),s=dayIn(l,0);return[lab,g(t,'de_intro'),g(t,'de_pred'),g(t,'de_test'),g(s,'de_intro'),g(s,'de_pred'),g(s,'de_test')]}),columnStyles:wkCol});
  let yy=next();title('Interpretación inglés',yy);
  doc.autoTable({...base,startY:yy+2,head:[[{content:'Fecha',rowSpan:2},{content:'Domingo',colSpan:3}],parts],
    body:rows.map(([lab,l])=>{const s=dayIn(l,0);return[lab,g(s,'en_intro'),g(s,'en_pred'),g(s,'en_test')]}),columnStyles:wkCol});
  yy=next();title('Ofrendas / Micrófonos',yy);
  const pair=(d,a,b)=>d?`${g(d,a)} / ${g(d,b)}`:'—';
  doc.autoTable({...base,startY:yy+2,head:[[{content:'Fecha',rowSpan:2},{content:'Jueves',colSpan:4},{content:'Domingo',colSpan:4}],['Ofrendas','Entrega','Micrófonos','Guardan','Ofrendas','Entrega','Micrófonos','Guardan']],
    body:rows.map(([lab,l])=>{const t=dayIn(l,4),s=dayIn(l,0),gd=d=>d?['grd1','grd2','grd3'].map(k=>g(d,k)).join('\n'):'—';return[lab,pair(t,'ofr1','ofr2'),g(t,'ent'),g(t,'mic1'),gd(t),s?pair(s,'ofr1','ofr2')+'\n'+pair(s,'ofr3','ofr4'):'—',g(s,'ent'),s?g(s,'mic1')+'\n'+g(s,'mic2'):'—',gd(s)]}),columnStyles:wkCol});
  return{doc,name:`Labores Berlin - ${mes} ${y}.pdf`};
}
async function savePdf(ym){
  if(!DL||!window.jspdf){ui.pdfMsg='La descarga del PDF no está disponible aquí.';render();return}
  ui.pdfMsg='Preparando el PDF…';render();
  try{const{doc,name}=buildPdf(ym);await DL.save({filename:name,data:doc.output('blob')});ui.pdfMsg=''}
  catch(e){ui.pdfMsg=e&&e.code==='declined'?'':'No se pudo descargar el PDF. Intenta de nuevo.'}
  render()}

/* Fichas de interpretación: una en alemán (campo pdf) y otra en inglés (campo pdfEn). */
const LANGF={de:'pdf',en:'pdfEn'},LINKF={de:'linkDe',en:'linkEn'},LANGN={de:'alemán',en:'inglés'};
/* ---- Intérpretes: avisar que falta la ficha o que el enlace no funciona (le llega al pastor, o a quien predica si no es el pastor) ---- */
// Reportes de fichas: el intérprete escribe qué pasa; le llega al pastor (o a quien predica); al corregir, le llega al intérprete.
const openReps=(kind,tid)=>(state.linkReps||[]).filter(r=>r.open&&r.kind===kind&&r.tid===tid);
function linkRep(kind,t,d,langs,owner){if(!t||!langs.length)return'';const k=kind+'|'+t.id;
  const mine=openReps(kind,t.id).filter(r=>r.by===state.me);
  let h=mine.map(r=>`<div class="repok">✓ Avisaste (${LANGN[r.lang]}): «${esc(r.note)}» · esperando corrección</div>`).join('');
  if(ui.repOpen!==k)return `<div class="rep">${h}<button class="linkbtn" data-a="rep-open" data-v="${esc(k)}">${langs.some(l=>t[LINKF[l]])?'Enlace erróneo o faltante':'Avisar que falta la ficha'}</button></div>`;
  const lg=ui.repLang&&langs.includes(ui.repLang)?ui.repLang:langs[0];
  return `<div class="rep">${h}<div class="repbox"><b style="font-size:15px">Enlace erróneo o faltante</b>
    ${langs.length>1?`<div class="inline" style="margin:8px 0 0">${langs.map(l=>`<button class="f" data-a="rep-lang" data-v="${esc(l)}" aria-pressed="${l===lg}">Ficha en ${LANGN[l]}</button>`).join('')}</div>`:`<div class="info" style="margin:4px 0 0">Ficha en ${LANGN[lg]}</div>`}
    <textarea id="rep-note" rows="3" placeholder="Cuéntale qué pasa. Por ejemplo: el enlace de inglés abre la ficha en alemán." style="margin-top:10px;width:100%"></textarea>
    <div class="info" style="margin:6px 0 0">Le llega ${owner?'a '+esc(owner.name.replace(/\.$/,'')):'al pastor'}. Cuando lo corrija, te avisamos.</div>
    <div class="inline" style="margin-top:12px"><button class="btn sm" data-a="rep-send" data-v="${esc(kind)}|${esc(t.id)}|${esc(lg)}|${esc(d)}|${esc(owner?owner.id:'')}">Enviar aviso</button><button class="btn ghost sm" data-a="rep-x">Cancelar</button></div></div></div>`}
// Al corregir el enlace (o al marcarlo como resuelto), se cierran los reportes y se avisa a quienes reportaron
function closeReps(kind,tid,lang,why){const rs=(state.linkReps||[]).filter(r=>r.open&&r.kind===kind&&r.tid===tid&&(!lang||r.lang===lang));if(!rs.length)return 0;
  const t=kind==='l'?state.leipzig.find(x=>x.id===tid):state.teachings.find(x=>x.id===tid);const nm=(me()||{}).name||'El pastor';
  for(const r of rs){r.open=false;r.fixedTs=Date.now();r.fixedBy=state.me;
    const what=kind==='l'?`la visita a Leipzig del ${fmt(r.d)}`:`«${t?t.title:''}» (${fmt(r.d)})`;
    const txt=`${nm} ${why||'corrigió'} la ficha en ${LANGN[r.lang]} de ${what}. Ya puedes abrirla.`;
    notify([r.by],txt,{push:{title:'Ficha corregida',body:txt}})}
  return rs.length}
function repsCard(p){if(!(p.admin||p.pastor))return'';const rs=(state.linkReps||[]).filter(r=>r.open);if(!rs.length)return'';
  return `<div class="card ask" style="margin:6px 0 12px"><b>Avisos de fichas (${rs.length})</b>${rs.map(r=>{const t=r.kind==='l'?state.leipzig.find(x=>x.id===r.tid):state.teachings.find(x=>x.id===r.tid);const who=person(r.by);
    return `<div class="repitem"><div><b>${r.kind==='l'?'Leipzig':esc(t?t.title:'')}</b> · ${fmt(r.d)} · ficha en ${LANGN[r.lang]}</div><div>«${esc(r.note)}»</div><small class="info">${esc(who?who.name:'')} · ${ago(r.ts)}</small><div class="inline" style="margin-top:8px"><button class="btn ghost sm" data-a="rep-done" data-v="${esc(r.id)}">Ya lo corregí</button></div></div>`}).join('')}
    <div class="info" style="margin-top:8px">Al cambiar el enlace con el lápiz, se marca solo como corregido y se le avisa a quien reportó.</div></div>`}
const pdfLink=(kind,t,langs=['de','en'])=>{const ls=t?langs.filter(l=>t[LINKF[l]]):[];if(!ls.length)return langs.length?`<div class="info" style="margin-top:6px">Ficha: todavía no está.</div>`:'';
  return `<div class="inline" style="margin-top:6px;flex-wrap:wrap">${ls.map(l=>xlink(t[LINKF[l]],`Ficha en ${LANGN[l]}`)).join('')}</div>`};
const tradLangs=p=>p?['de','en'].filter(l=>(p.roles||[]).includes('trad_'+l)):[];
// Leipzig: los que viajan ven las dos fichas (alemán e inglés); el resto del equipo de traducción, la de su idioma.
const lzLangs=p=>p&&p.leipzig?['de','en']:tradLangs(p);
const predLangs=(slots)=>[...new Set(slots.filter(s=>/_pred$/.test(s.k)).map(s=>s.k.slice(0,2)))];
const needLangs=d=>['de','en'];
const myLangs=(p,d)=>{const as=schedOf(d)||{};return[...new Set(slotsAt(d).filter(s=>s.area==='trad'&&as[s.k]===p.id).map(s=>s.k.slice(0,2)))]};
async function dlPdf(kv){const[kind,id,l='de']=kv.split('|');const t=pdfList(kind).find(x=>x.id===id),f=t&&t[LANGF[l]];if(!f)return;
  try{const{data:b,error}=await SB.storage.from('fichas').download(f.id);if(error)throw error;await DL.save({filename:f.name||'ficha.pdf',data:b});ui.toast=''}
  catch(e){ui.toast=e&&e.code==='declined'?'':'No se pudo descargar la ficha. Intenta de nuevo.'}render()}
const transOnDay=(p,d)=>{const as=schedOf(d)||{};return slotsAt(d).some(s=>s.area==='trad'&&as[s.k]===p.id)};
let AS=null;
function pdfCtl(kind,t){return `<div class="fich">${['de','en'].map(l=>{const f=t[LANGF[l]],k=t.id+'|'+l,L=LANGN[l][0].toUpperCase()+LANGN[l].slice(1);
  return `<span class="fl">${L}</span><div class="fc">${f?`<button class="pdfl dl" data-a="dlpdf" data-v="${esc(kind)}|${esc(t.id)}|${esc(l)}">${esc(f.name)}</button>${AS?`<button class="linkbtn" style="font-size:14px" data-a="pdfdel" data-v="${esc(kind)}|${esc(t.id)}|${esc(l)}">Quitar</button>`:''}`:ui.upl===k?'<span class="info" style="margin:0">Subiendo…</span>':AS?`<label class="btn ghost sm" style="cursor:pointer">Adjuntar<input type="file" accept="application/pdf" hidden id="pf-${t.id}-${l}" data-c="pdf" data-v="${esc(kind)}|${esc(t.id)}|${esc(l)}"></label>`:'<span class="info" style="margin:0">Sin ficha</span>'}</div>`}).join('')}</div>`}
const pdfList=kind=>kind==='l'?state.leipzig:kind==='pd'?(state.privDocs=state.privDocs||[]):state.teachings;
async function uploadPdf(kv,file){const[kind,id,l='de']=kv.split('|');const t=pdfList(kind).find(x=>x.id===id);if(!t||!file||!AS)return;
  if(file.type!=='application/pdf'){ui.uplMsg='La ficha debe ser un PDF.';render();return}
  ui.upl=id+'|'+l;ui.uplMsg='';render();
  try{const r=await AS.upload(file);const old=t[LANGF[l]];t[LANGF[l]]={id:r.id,name:file.name};save();if(old&&old.id!==r.id)AS.delete(old.id).catch(()=>{})}catch(e){ui.uplMsg=e&&e.code==='too_large'?'La ficha es muy grande (máximo 20 MB).':'No se pudo subir la ficha. Intenta de nuevo.'}
  ui.upl=null;render()}
function cronograma(p){const tm=teachMap(),it=[];const allT=p.admin||p.pastor||p.roles.includes('pulpito');const pastor=state.people.find(x=>x.pastor);
  for(const d in tm)if(!svcGone(d)){const as=schedOf(d)||{};const pr=slotsAt(d).some(z=>z.k==='predica')?person(as.predica):pastor;it.push({d,h:`<div class="big2">${esc(tm[d].title)}</div><div class="sub2">Predica: <b>${esc(pr?pr.name:'—')}</b></div>${pdfLink('t',tm[d],tradLangs(p))}${linkRep('t',tm[d],d,tradLangs(p),slotsAt(d).some(z=>z.k==='predica')?pr:null)}`,s:''})}
  for(const t of state.trans)if(!svcGone(t.date))it.push({d:t.date,h:'<b>Transmisión internacional</b>',s:t.link?`<div class="pre">${linkify(t.link)}</div>`:'Aún sin datos (enlace y hora).'});
  for(const l of state.leipzig)if(!svcGone(l.date))it.push({d:l.date,h:`<div class="il2">Visita a Leipzig</div><div class="big2">${esc(l.teaching||'Predicación por definir')}</div>${seesLzGoing(p)?`<div class="sub2">${lzGoingLine(l)}</div>`:''}${pdfLink('l',l,lzLangs(p))}${lzLangs(p).length?linkRep('l',l,l.date,lzLangs(p),null):''}`,s:''});
  it.sort((a,b)=>a.d<b.d?-1:1);
  if(!it.length)return'<div class="card empty-state">Todavía no hay predicaciones programadas.</div>';
  return `<div class="list">${it.map(x=>{const dd=pd(x.d),w=dd.getDay();return `<div class="card mine"><div class="dbox"><b>${dd.getDate()}</b><span>${MESS[dd.getMonth()]}</span></div><div style="min-width:0"><div class="svc">${DOW[w]} <small>${SVC[w][1]}</small></div><div style="margin-top:4px">${x.h}</div>${x.s?`<div class="info" style="margin-top:2px">${x.s}</div>`:''}</div></div>`}).join('')}</div>`}
function vEns(p){
  if(!(p.admin||p.pastor))return `<h2>Predicaciones</h2><p class="lead">Lo que se predica en los próximos jueves y domingos, las transmisiones y las visitas a Leipzig.</p>${cronograma(p)}`;
  const tm=teachMap();const dateOf={};for(const d in tm)dateOf[tm[d].id]=d;
  const pend=(()=>{const out=[];const w=pd(today).getDay(),sun=ds(new Date(pd(today).getTime()+((7-w)%7)*864e5)),thu=ds(new Date(pd(today).getTime()+((4-w+7)%7)*864e5));
    for(const d of [...new Set([thu,sun])].sort()){if(d<today||transOn(d))continue;const t=tm[d];if(!t){out.push(`${fmt(d)}: falta cargar la enseñanza`);continue}{const mf=needLangs(d).filter(l=>!t[LINKF[l]]);if(mf.length&&!davidDay(d))out.push(`${fmt(d)}: falta el enlace de la ficha en ${mf.map(l=>LANGN[l]).join(' y ')}`)}}
    for(const l of state.leipzig)if(l.date>=today&&l.date<=sun){const miss=[!l.teaching&&'el título',!l.linkDe&&'el enlace en alemán',!l.linkEn&&'el enlace en inglés'].filter(Boolean);if(miss.length)out.push(`Leipzig ${fmt(l.date)}: falta ${miss.join(', ')}`)}
    if(w>=5||w===0){if(!transOn(sun)&&w!==0)out.push(`¿Hay transmisión internacional el ${fmt(sun)}? Si la hay, agrégala abajo.`)}
    return out})();
  return `<h2>Pastor · enseñanzas y viajes</h2>${repsCard(me())}${dupSummary()}${pend.length?`<div class="card ask" style="margin:6px 0 12px"><b>Pendiente esta semana</b><ul class="steps" style="margin:6px 0 0">${pend.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="info" style="margin-top:6px">Los enlaces de las fichas deben estar a más tardar el miércoles.</div></div>`:''}<p class="lead">Las enseñanzas se reparten en orden entre jueves y domingos. Si un domingo hay transmisión internacional, las fechas se corren solas, menos las fijas (con el alfiler azul). La del día que predica David queda fija sola.</p>
  <h3>Enseñanzas en orden</h3>${ui.uplMsg?`<div class="banner warnbn">${esc(ui.uplMsg)}</div>`:''}<div class="card">
   <label class="field">Empiezan desde<input id="t-start" type="date" value="${esc(state.teachStart)}" data-c="t-start"></label>
   ${(()=>{const past=state.teachings.filter(t=>dateOf[t.id]&&svcGone(dateOf[t.id])),fut=state.teachings.filter(t=>!(dateOf[t.id]&&svcGone(dateOf[t.id]))).sort((a,b)=>(dateOf[a.id]||'9')<(dateOf[b.id]||'9')?-1:1);const mov=fut.filter(t=>!isPinned(t));
     const last=fut.length?dateOf[fut[fut.length-1].id]:'';
     let h=past.length?`<button class="mfold" data-a="t-past" aria-expanded="${!!ui.tPast}"><span><b>Ya pasaron</b> · ${past.length}</span><span class="chev">${ui.tPast?'▾':'▸'}</span></button>${ui.tPast?past.map(t=>`<div class="li"><div class="main" style="opacity:.6"><b>${esc(t.title)}</b><small>${fmt(dateOf[t.id])}</small></div></div>`).join(''):''}`:'';
     h+=fut.map((t,i)=>`<div class="li trow"><div class="main"><div class="thead">${nameEd('t',t.id,t.title,'',true)}</div><div class="tline"><span class="tdate">${dateOf[t.id]?DOW[pd(dateOf[t.id]).getDay()]+' '+fmt(dateOf[t.id]).replace(/^\S+\s/,''):'Sin fecha'}</span>${ui.edName==='t|'+t.id?'':tActs(t,mov)}</div>${isPinned(t)?`<div class="pinnote">Fija en esta fecha${davidDay(dateOf[t.id])?' (predica David)':''}: no se corre si se agrega una transmisión.</div>`:''}${dupWarn(t.id)}${ui.tDel===t.id?`<div class="confirm">¿Quitar esta enseñanza? Las que siguen se corren una fecha antes. <button class="btn warnb sm" data-a="t-del-ok" data-v="${esc(t.id)}">Sí, quitar</button><button class="btn ghost sm" data-a="t-del-no">Cancelar</button></div>`:''}${(()=>{const d=dateOf[t.id];if(!d)return'';return `<div class="sub2">Predica: <b>${davidDay(d)?esc((person((schedOf(d)||{}).predica)||{name:'David'}).name):esc((state.people.find(x=>x.pastor&&x.roles.includes('pulpito'))||{name:'Pastor'}).name)}</b></div>`})()}
     ${linkPair('tl',t,dateOf[t.id]?needLangs(dateOf[t.id]):['de','en'])}</div></div>`).join('')||'<div class="info" style="padding:8px 0">No hay enseñanzas por venir. Agrega las siguientes abajo.</div>';
     h+='<div class="tsep" role="separator"></div>';
     if(last)h+=`<div class="info" style="margin-top:0">Hay enseñanzas cargadas hasta el <b>${fmt(last)}</b>. Para seguir después, agrega más abajo y se acomodan solas en los siguientes jueves y domingos.</div>`;
     return h})()}
   <div class="inline" style="margin-top:10px"><input id="t-new" type="text" placeholder="Título de la enseñanza"><button class="btn sm" data-a="t-add">Agregar</button></div></div>
  <h3>Transmisiones internacionales</h3><div class="card">
   ${state.trans.filter(t=>!svcGone(t.date)).sort((a,b)=>a.date<b.date?-1:1).map(t=>ui.trEdit===t.id?`<div class="li" style="display:block"><b>${fmt(t.date)}</b><textarea id="tre-${t.id}" rows="5" style="margin-top:6px" data-c="tr-text" data-v="${esc(t.id)}">${esc(t.link)}</textarea><button class="btn sm" data-a="tr-done" style="margin-top:6px">Listo</button></div>`:`<div class="li"><div class="main"><b>${fmt(t.date)}</b><small class="pre">${t.link?linkify(t.link):'Sin información todavía'}${t.note?'\n'+esc(t.note):''}</small></div><button class="x" data-a="tr-edit" data-v="${esc(t.id)}">Editar</button><button class="x" data-a="tr-del" data-v="${esc(t.id)}" aria-label="Quitar">✕</button></div>`).join('')||'<div class="info">Ninguna programada.</div>'}${(()=>{const past=state.trans.filter(t=>svcGone(t.date)).sort((a,b)=>a.date<b.date?1:-1);return past.length?`<details class="trpast"><summary>Transmisiones pasadas (${past.length})</summary><div class="info" style="margin:6px 0 0">${past.map(t=>fmt(t.date)).join(' · ')}</div></details>`:''})()}
   <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px"><textarea id="tr-link" rows="4" placeholder="Información de la transmisión (opcional, la puedes poner después). Puedes pegar el link aquí."></textarea><button class="btn sm" data-a="tr-add" data-v="${esc(trFree())}" style="align-self:flex-start">Agregar transmisión del ${fmt(trFree())}</button></div>
   <div class="info" style="margin-top:6px">Este texto lo ven el pastor y los de púlpito en sus labores. Los links se pueden tocar.</div></div>
  <h3>Visitas a Leipzig</h3><div class="card">
   ${state.leipzig.filter(l=>!svcGone(l.date)).sort((a,b)=>a.date<b.date?-1:1).map(l=>`<div class="li trow"><div class="main"><div class="thead">${nameEd('lz',l.id,l.teaching||'','Predicación por definir',true)}</div><div class="tline"><span class="tdate">${DOW[pd(l.date).getDay()]} ${fmt(l.date).replace(/^\S+\s/,'')}</span>${ui.edName==='lz|'+l.id?'':`<div class="tacts"><button class="ta del" data-a="lz-del" data-v="${esc(l.id)}" aria-label="Quitar esta visita">${IC_DEL}</button></div>`}</div><div class="sub2">${lzGoingLine(l)}</div>${linkPair('ll',l,['de','en'])}</div></div>`).join('')||'<div class="info">Ninguna visita programada.</div>'}
   <div class="inline" style="margin-top:10px"><input id="lz-date" type="date" value="${esc(ui.lzD||'')}"><input id="lz-t" type="text" placeholder="Predicación que se dará (obligatorio)" value="${esc(ui.lzT||'')}" ${ui.lzErr?'class="bad"':''}><button class="btn sm" data-a="lz-add">Agregar</button></div>${ui.lzErr?`<div class="info" style="color:var(--warn);margin-top:6px">${esc(ui.lzErr)}</div>`:''}
   <div class="info" style="margin-top:6px">Viajan: ${esc(yList(state.people.filter(x=>x.leipzig&&!x.deleted).map(x=>x.name))||'nadie marcado').replace(/\.$/,'')}. Ese día no se les asigna nada en Berlín. Lo ven púlpito y traducción.</div></div>`;
}

// Búsqueda por nombre en Personas (sin tildes ni mayúsculas)
const normQ=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
function perFilter(){const q=normQ(ui.perQ||'');let n=0;document.querySelectorAll('.prow').forEach(r=>{const ok=!q||r.dataset.n.includes(q);r.hidden=!ok;if(ok)n++});const e=$('per-none');if(e)e.hidden=n>0}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='per-q'){ui.perQ=e.target.value;perFilter()}});
// Enseñanzas repetidas en el mismo mes (mismo título, sin importar tildes ni mayúsculas)
function dupDates(tid){const tm=teachMap();let d0=null,t0=null;for(const d in tm)if(tm[d].id===tid){d0=d;t0=tm[d]}if(!d0)return[];
  const k=normQ(t0.title);return Object.keys(tm).filter(d=>d!==d0&&d.slice(0,7)===d0.slice(0,7)&&normQ(tm[d].title)===k).sort()}
function dupWarn(tid){const ds_=dupDates(tid);return ds_.length?`<div class="dupw">⚠ Repetida este mes: también el ${ds_.map(fmt).join(' y el ')}</div>`:''}
function dupSummary(){const tm=teachMap(),seen=new Set(),out=[];for(const d of Object.keys(tm).sort()){if(d<today)continue;const t=tm[d],k=d.slice(0,7)+'|'+normQ(t.title);if(seen.has(k))continue;const ds_=dupDates(t.id);if(ds_.length){seen.add(k);out.push(`«${esc(t.title)}»: ${[d,...ds_].sort().map(fmt).join(' y ')}`)}}
  return out.length?`<div class="dupw" style="margin:6px 0 12px">⚠ Enseñanzas repetidas en el mismo mes:<br>${out.join('<br>')}<br><span style="font-weight:400">Cambia el título con el lápiz o muévelas con las flechas.</span></div>`:''}
function dupFlash(tid){const ds_=dupDates(tid);if(ds_.length){const t=state.teachings.find(x=>x.id===tid);ui.flash=`Ojo: «${t.title}» ya está el ${ds_.map(fmt).join(' y el ')}, en el mismo mes.`}}
const IC_EYE='<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
function vPer(){
  let h=`<h2>Personas</h2><p class="lead">${state.people.filter(z=>!z.deleted).length} colaboradores. Toca un nombre para editar sus labores.</p>`;
  const q=normQ(ui.perQ||'');
  h+=`<div class="psearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="per-q" type="search" placeholder="Buscar por nombre" value="${esc(ui.perQ||'')}" aria-label="Buscar por nombre" autocomplete="off"></div>`;
  h+='<div class="card">';
  for(const x of state.people.filter(z=>!z.deleted)){
    h+=`<div class="li prow" style="display:block" data-n="${esc(normQ(x.name))}" ${q&&!normQ(x.name).includes(q)?'hidden':''}>${x.id!==state.me?`<button class="peye" data-a="viewas" data-v="${esc(x.id)}" aria-label="Ver la app como ${esc(x.name)}" title="Ver la app como ${esc(x.name.split(' ')[0])}">${IC_EYE}<span>Ver</span></button>`:''}<button class="pbtn" data-a="open" data-v="${esc(x.id)}" style="display:flex;gap:12px;align-items:flex-start;width:100%;padding-right:${x.id!==state.me?'64px':'0'}">${avatar(x,44)}<div style="flex:1;min-width:0;text-align:left"><b>${esc(x.name)}</b>${x.admin?'<span class="tag gold">Admin</span>':''}${x.pastor?'<span class="tag gold">Pastor</span>':''}${x.phone?`<small class="info" style="display:block;margin-top:2px">${esc(x.phone)}</small>`:''}${x.deleted?'':`<small class="info" style="display:block">${x.privacy?'Privacidad aceptada el '+fmt(ds(new Date(x.privacy.ts))):'Privacidad: pendiente'}</small>`}
      <div class="chips" style="margin-top:4px">${x.roles.map(r=>chip(ROLEAREA[r],ROLES[r])).join('')||'<span class="info">Sin labores</span>'}</div></div></button>`;
    if(ui.open===x.id){h+=`<div style="margin-top:10px">
      <label class="field">Nombre<input id="pn-${x.id}" type="text" value="${esc(x.name)}" data-c="p-name" data-v="${esc(x.id)}"></label>
      <label class="field">Correo para entrar a la app<input id="pe-${x.id}" type="email" placeholder="correo@ejemplo.com" value="${esc(x.email||'')}" data-c="p-email" data-v="${esc(x.id)}"></label>
      <div class="inline" style="margin-bottom:10px"><label class="field" style="margin:0">Sexo<select id="ps-${x.id}" data-c="p-sex" data-v="${esc(x.id)}"><option value="M" ${x.sex==='M'?'selected':''}>Hombre</option><option value="F" ${x.sex==='F'?'selected':''}>Mujer</option></select></label>
      <label class="field" style="margin:0">Teléfono<input id="pb-${x.id}" type="tel" inputmode="tel" placeholder="+49 …" value="${esc(x.phone||'')}" data-c="p-phone" data-v="${esc(x.id)}"></label></div>
      <div class="info">Labores</div><div class="checks">${Object.entries(ROLES).map(([r,l])=>`<label><input type="checkbox" id="pr-${x.id}-${r}" data-c="p-role" data-v="${esc(x.id)}|${esc(r)}" ${x.roles.includes(r)?'checked':''}>${l}</label>`).join('')}</div>
      <div class="info">Permisos</div><div class="checks">${[['admin','Administrador'],['pastor','Pastor'],['leipzig','Viaja a Leipzig'],['freeAlab','Un día de alabanza libre por semana']].map(([f,l])=>`<label><input type="checkbox" id="pf-${x.id}-${f}" data-c="p-flag" data-v="${esc(x.id)}|${esc(f)}" ${x[f]?'checked':''}>${l}</label>`).join('')}</div>
      <div class="inline" style="margin-bottom:10px">${x.id!==state.me?`<button class="btn ghost sm" data-a="viewas" data-v="${esc(x.id)}">Ver la app como ${esc(x.name.split(' ')[0])}</button>`:''}</div>
      ${ui.delp===x.id?`<div class="confirm">¿Quitar a ${esc(x.name)}? Sale de sus próximas labores (se reasignan y se avisa a quien entra) y se borran sus datos. <button class="btn warnb sm" data-a="delp-yes" data-v="${esc(x.id)}">Sí, quitar</button><button class="btn ghost sm" data-a="delp-no">Cancelar</button></div>`:`<button class="btn ghost sm" data-a="delp" data-v="${esc(x.id)}" ${x.id===state.me?'disabled':''}>Quitar persona</button>`}
      </div>`}
    h+='</div>'}
  const nm=q?state.people.filter(z=>!z.deleted&&normQ(z.name).includes(q)).length:1;
  h+=`<div id="per-none" class="info" style="padding:12px 4px" ${nm?'hidden':''}>Nadie con ese nombre.</div>`;
  h+=`</div><h3>Invitar a una persona nueva</h3><div class="card"><div class="inline"><input id="np-name" type="text" placeholder="Nombre y apellido"><select id="np-sex"><option value="M">Hombre</option><option value="F">Mujer</option></select><button class="btn sm" data-a="addp">Agregar</button></div>
    <div class="info" style="margin-top:6px">Después abre su ficha y escribe su correo. Con ese correo la persona toca «Crear cuenta» en la app y entra.</div></div>`;
  return h;
}

/* ---------- acciones ---------- */
// «Ver como» otra persona: solo para mirar. Estas acciones no cambian nada guardado.
const VIEWOK=new Set(['dm','ic-go','logout','viewas','tab','month','area','view','mv','cm','selday','out-open','late-open','panel-x','pdf','dlpdf','msg-open','msg-x','md-x','m-open','m-del-no','av-list','av-all','priv-open','priv-x','priv-lang','cal-g','ne-x','t-past','upd','cal-hide','menu','n-go','rep-x','mrow','mrow-x','hmenu','hmenu-x','dk-day','dk-week','dk-go','dk-hor','bell','sheet-x','av-mode','av-open','av-close','regen-no','pick-x','open','delp-no','t-del-no','tr-done','install','install-x','push-on','cal-get','cal-copy','del-no','av-x']);
const viewOnly=()=>{ui.flash=`Estás viendo la app como ${(me()||{}).name||'otra persona'}: solo para mirar. Toca «Volver a mi cuenta» para hacer cambios.`;ui.panel=null;render()};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t||t.disabled)return;const a=t.dataset.a,v=t.dataset.v,p=me();
  if(ui.viewAs&&!VIEWOK.has(a)){viewOnly();return}
  if(ui.hmenu&&!['hmenu','hmenu-x'].includes(a))ui.hmenu=false;
  if(a==='tab'||a==='month'){ui.mrow=null}
  switch(a){
  case'logout':if(ui.viewAs){ui.viewAs=null;resolveMe();ui.tab='per';break}dropSub().finally(()=>SB.auth.signOut());return;
  case'viewas':ui.viewAs=v;resolveMe();ui.tab='mis';scrollTo(0,0);break;
  case'auth-mode':ui.authMode=v;ui.authMsg='';break;
  case'auth-newpass':{const pw=$('au-pass').value;SB.auth.updateUser({password:pw}).then(r=>{if(r.error){ui.authMsg=AUTHERR(r.error);ui.authOk=false}else{ui.authMode='login';ui.authMsg='';if(r.data&&r.data.user){SESSION={...SESSION,user:r.data.user};loadData()}}render()});return}
  case'push-on':ensureSub(true);return;
  case'install':if(INSTALL){INSTALL.prompt();INSTALL=null}return;
  case'install-x':ui.hideInstall=true;try{localStorage.setItem('lb-noinstall','1')}catch(e){}break;
  case'ic-go':{const[d,ed]=v.split('|');nGo({tab:'mis',d,ed});return}
  case'it-none':{state.intro=state.intro||{};const x=state.intro[v]=state.intro[v]||{};x.noLink=true;ui.flash='Listo: ya no se te recuerda el testimonio.';break}
  case'tab':if(v==='aj'&&ui.tab!=='aj')ui.prevTab=ui.tab;ui.menu=false;ui.bell=false;ui.tab=v;ui.edit=null;scrollTo(0,0);break;
  case'month':{const[y,m]=ui.month.split('-').map(Number);const d=new Date(y,m-1+(+v),1);ui.month=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;ui.regen=false;break}
  case'area':ui.area=v;break;
  case'view':ui.view=v;ui.edit=null;break;
  case'mv':ui.mv=v;break;
  case'cm':{const[y,m]=ui.cm.split('-').map(Number);const d=new Date(y,m-1+(+v),1);ui.cm=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;ui.sel=null;break}
  case'selday':ui.sel=v;ui.panel=null;break;
  case'out-open':ui.panel={d:v,t:'out'};break;
  case'late-open':ui.panel={d:v,t:'late'};break;
  case'panel-x':ui.panel=null;break;
  case'out-yes':outReq(v);ui.panel=null;break;
  case'late-yes':late(v,($('late-msg').value||'').trim());ui.panel=null;break;
  case'acc':t.disabled=true;refetch().catch(()=>{}).then(()=>{resolveMe();accept(v);save();render()});return;
  case'dec':decline(v);break;
  case'pdf':savePdf(ui.month);return;
  case'dlpdf':dlPdf(v);return;
  case'msg-open':ui.compose=true;break;
  case'msg-x':ui.compose=false;break;
  case'msg-send':{const txt=($('msg-text').value||'').trim(),area=$('msg-area').value;if(!txt)return;
    const mid=uid();state.msgs.push({id:mid,month:ui.month,area,text:txt,from:p.id,ts:Date.now()});
    notify(teamIds(area),`${p.name} dejó un mensaje para ${area==='all'?'todos':'el equipo de '+AREAN[area].toLowerCase()} (${MES[+ui.month.slice(5,7)-1]}):`,{msg:mid,push:{title:`${p.name} → ${area==='all'?'Todos los equipos':'Equipo de '+AREAN[area].toLowerCase()}`,body:txt.slice(0,240)}});ui.compose=false;break}
  case'msg-del':state.msgs=state.msgs.filter(m=>m.id!==v);break;
  case'help':{const n=state.notifs.find(x=>x.id===v);if(!n||n.helper)break;n.helper=p.id;
    notify([n.from],`${p.name} te ayuda mientras llegas el ${fmt(n.date)}.`);
    notify(n.to.filter(i=>i!==p.id),`${p.name} ayuda mientras llega ${(person(n.from)||{}).name||'el hermano'} (${fmt(n.date)}).`);ui.flash='Gracias. Se avisó que tú ayudas.';break}
  case'md-open':ui.meet=true;ui.mdErr='';ui.md={title:'',date:'',time:'',place:'',notes:'',areas:[]};break;
  case'md-x':ui.meet=false;break;
  case'md-send':{const d=ui.md;for(const f of ['title','date','time','place','notes']){const el=$('md-'+f);if(el&&el.value!==undefined)d[f]=el.value.trim()}
    if(!d.title||!d.date){ui.mdErr='Escribe el título y la fecha.';break}if(!d.areas.length){ui.mdErr='Elige al menos un equipo.';break}
    const m={id:uid(),...d,areas:[...d.areas],from:p.id,ts:Date.now(),rsvp:{}};state.meets.push(m);
    notify(invitees(m),`${p.name} convoca a reunión: ${m.title} · ${fmt(m.date)}${m.time?' '+m.time:''}. Confirma en Labores.`);ui.meet=false;ui.md=null;break}
  case'm-open':ui.mOpen=ui.mOpen===v?null:v;break;
  case'm-del':ui.mDel=v;break;
  case'm-del-no':ui.mDel=null;break;
  case'm-del-yes':{const m=state.meets.find(x=>x.id===v);if(m){notify(invitees(m),`Se canceló la reunión «${m.title}» del ${fmt(m.date)}.`);state.meets=state.meets.filter(x=>x.id!==v)}ui.mDel=null;break}
  case'rsvp':{const[id,val]=v.split('|');const m=state.meets.find(x=>x.id===id);if(m)m.rsvp[p.id]=val;break}
  case'readall':for(const n of state.notifs)if(n.to.includes(p.id)&&!n.read.includes(p.id))n.read.push(p.id);break;
  case'gen':{const ym=ui.month,old=JSON.parse(JSON.stringify(state.schedules[ym]||{})),before={};for(const d of monthDates(ym))before[d]=old[d]||{};
    generate(ym);for(const d in old)if(d<today||svcGone(d))state.schedules[ym][d]=old[d];
    const n=schedDiffNotify(before);ui.regen=false;ui.flash=isPub(ym)?`Horario generado de nuevo (los días que ya pasaron no cambian).${n?` Se avisó a ${n} ${n===1?'persona':'personas'} de sus cambios.`:''}`:'Horario generado de nuevo.';break}
  case'publish':{state.published=state.published||{};state.published[ui.month]=Date.now();const mes=MES[+ui.month.slice(5,7)-1];
    notify(servers(),`Ya está publicado el horario de ${mes}. Revisa tus labores.`,{push:{title:`Horario de ${mes}`,body:'Ya puedes ver tus labores del mes en la app.'}});break}
  case'unpublish':if(state.published)delete state.published[ui.month];break;
  case'av-ask':ui.avAsk=true;break;
  case'av-x':ui.avAsk=false;break;
  case'av-send':{const dl=($('av-deadline').value||'').trim();if(!dl)return;state.avReqs=state.avReqs||{};state.avReqs[ui.month]={deadline:dl,ts:Date.now(),done:{}};ui.avAsk=false;const mes=MES[+ui.month.slice(5,7)-1];
    notify(servers(),`Marca los días que no puedes servir en ${mes}, antes del ${fmt(dl)}. Está arriba en Labores.`,{push:{title:`Disponibilidad de ${mes}`,body:`Marca los días que no puedes antes del ${fmt(dl)}.`}});break}
  case'av-list':ui.avList=!ui.avList;break;
  case'av-all':ui.avAll=!ui.avAll;break;
  case'f-done':{const[kd,iv]=v.split('|');const x=(kd==='l'?state.leipzig:state.teachings).find(z=>z.id===iv);if(x)x.done=!x.done;break}
  case'pd-del':{const d=(state.privDocs||[]).find(x=>x.id===v);if(d){state.privDocs=state.privDocs.filter(x=>x.id!==v);if(AS&&d.pdf)AS.delete(d.pdf.id).catch(()=>{})}break}
  case'priv-open':ui.priv=true;ui.menu=false;break;
  case'priv-x':ui.priv=false;break;
  case'priv-lang':ui.privLang=v;break;
  case'priv-accept':{if(!($('priv-chk')||{}).checked){ui.privErr=true;break}const r=realMe();if(r){r.privacy={v:window.PRIV_V,ts:Date.now()}}ui.privErr=false;break}
  case'del-ask':ui.delAsk=true;ui.delErr='';break;
  case'del-no':ui.delAsk=false;break;
  case'del-yes':{{const r=realMe();if(r&&r.admin&&state.people.filter(x=>x.admin&&!x.deleted).length<2){ui.delErr='Eres el único administrador. Antes de borrar tu cuenta, nombra a otro administrador en Personas.';break}}ui.delBusy=true;ui.delErr='';render();SB.functions.invoke('push',{body:{mode:'delete-me'}}).then(r=>{ui.delBusy=false;if(r.error||!r.data||!r.data.ok){ui.delErr='No se pudo borrar la cuenta. Inténtalo de nuevo o escribe al administrador.';render();return}ui.delAsk=false;try{localStorage.clear()}catch(e){}SB.auth.signOut().finally(()=>{ui.authMsg='Tu cuenta y tus datos se borraron.';ui.authOk=true;render()})}).catch(()=>{ui.delBusy=false;ui.delErr='No se pudo borrar la cuenta. Revisa tu conexión.';render()});return}
  case'cal-g':ui.calG=!ui.calG;break;
  case'ne-edit':ui.edName=v;render();setTimeout(()=>{const i=$('ne-in');if(i){i.focus();i.select()}},30);return;
  case'ne-x':ui.edName=null;break;
  case'ne-save':{const[kd,iv,lg]=v.split('|');let val=(($('ne-in')||{}).value||'').trim();
    if(kd==='ic'||kd==='it'){if(kd==='it'&&val&&!/^https?:\/\//i.test(val))val='https://'+val;state.intro=state.intro||{};const x=state.intro[iv]=state.intro[iv]||{};const f=kd==='ic'?'cita':'link';if(val)x[f]=val;else delete x[f];if(!x.cita&&!x.link&&!x.noLink)delete state.intro[iv];ui.edName=null;break}
    if(kd==='fx'){if(val&&!/^https?:\/\//i.test(val))val='https://'+val;state.fichas=state.fichas||{};if(val)state.fichas[iv]=val;else delete state.fichas[iv];ui.edName=null;break}
    if(kd==='tl'||kd==='ll'){if(val&&!/^https?:\/\//i.test(val))val='https://'+val;const x=(kd==='tl'?state.teachings:state.leipzig).find(z=>z.id===iv),f=LINKF[lg||'de'];if(x){const before=x[f];if(val)x[f]=val;else delete x[f];if(val&&val!==before&&closeReps(kd==='tl'?'t':'l',iv,lg||'de','corrigió'))ui.flash='Enlace guardado. Se avisó a quien lo había reportado.'}ui.edName=null;break}
    if(!val){const i=$('ne-in');if(i){i.placeholder='El título no puede quedar vacío';i.classList.add('bad');i.focus()}return}if(kd==='lz'){const l=state.leipzig.find(x=>x.id===iv);if(l)l.teaching=val}else{const x=state.teachings.find(z=>z.id===iv);if(x&&val){x.title=val;dupFlash(iv)}}ui.edName=null;break}
  case't-past':ui.tPast=!ui.tPast;break;
  case'upd':location.reload();return;
  case'cal-hide':ui.calHide=true;try{localStorage.setItem('lb-calhide','1')}catch(e){}break;
  case'menu':ui.menu=!ui.menu;ui.bell=false;break;
  case'lz-go':{const[id,on]=v.split('|');const l=state.leipzig.find(x=>x.id===id);if(!l)break;l.going=(l.going||[]).filter(x=>x!==state.me);if(on==='1'){l.going.push(state.me);ui.flash=`Anotado: vas a Leipzig el ${fmt(l.date)}.`}else ui.flash='Anotado: ya no vas.';break}
  case'n-go':{const n=state.notifs.find(x=>x.id===v);if(!n)return;if(!ui.viewAs&&!n.read.includes(state.me)){n.read.push(state.me);save()}nGo(goFor(n,p));return}
  case'rep-open':ui.repOpen=v;ui.repLang=null;render();return;
  case'rep-lang':ui.repLang=v;{const n=($('rep-note')||{}).value;render();const x=$('rep-note');if(x&&n)x.value=n}return;
  case'rep-x':ui.repOpen=null;render();return;
  case'rep-send':{const[kind,id,l,d,ow]=v.split('|');const t=kind==='l'?state.leipzig.find(x=>x.id===id):state.teachings.find(x=>x.id===id);if(!t)return;
    const note=(($('rep-note')||{}).value||'').trim();if(!note){const x=$('rep-note');if(x){x.classList.add('bad');x.placeholder='Escribe qué pasa con el enlace';x.focus()}return}
    const to=ow?[ow]:state.people.filter(x=>x.pastor&&!x.deleted).map(x=>x.id);
    state.linkReps=state.linkReps||[];state.linkReps.push({id:uid(),kind,tid:id,lang:l,d,by:state.me,note,ts:Date.now(),open:true,to});ui.repOpen=null;
    const what=kind==='l'?`la visita a Leipzig del ${fmt(d)}`:`«${t.title}» (${fmt(d)})`;const txt=`${me().name} avisa sobre la ficha en ${LANGN[l]} de ${what}: «${note}». Corrígela en la pestaña Pastor.`;
    notify(to,txt,{push:{title:'Enlace erróneo o faltante',body:txt}});ui.flash='Listo, se avisó. Cuando lo corrijan te llega un aviso.';break}
  case'rep-done':{const r=(state.linkReps||[]).find(x=>x.id===v);if(!r)return;closeReps(r.kind,r.tid,r.lang,'corrigió');ui.flash='Listo, se avisó a quien reportó.';break}
  case'tr-ans':{const[d,a]=v.split('|');trAnswer(d,a);break}
  case'mrow':ui.mrow=v;if(v==='av'&&!avOf(ui.month))ui.avAsk=true;render();return;
  case'mrow-x':ui.mrow=null;ui.avAsk=false;ui.compose=false;ui.meet=false;render();return;
  case'hmenu':ui.hmenu=true;render();return;
  case'hmenu-x':ui.hmenu=false;render();return;
  case'dk-day':ui.dkDay=v;render();return;
  case'dk-week':ui.dkWeek=v==='0'?0:(ui.dkWeek||0)+(+v);ui.dkDay=null;render();return;
  case'dk-go':{const el=$(v);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return}
  case'dk-hor':ui.month=v;ui.tab='hor';scrollTo(0,0);render();return;
  case'bell':ui.menu=false;ui.bell=true;ui.bellNew=state.notifs.filter(n=>n.to.includes(p.id)&&!n.read.includes(p.id)).map(n=>n.id);if(!ui.viewAs)for(const n of state.notifs)if(ui.bellNew.includes(n.id))n.read.push(p.id);break;
  case'sheet-x':ui.menu=false;ui.bell=false;ui.bellNew=[];break;
  case'photo-del':delete p.photo;break;
  case'cal-get':ui.calErr='';SB.functions.invoke('push',{body:{mode:'caltoken'}}).then(r=>{if(r.error||!r.data||!r.data.me)ui.calErr='No se pudo crear el enlace. Inténtalo de nuevo.';else ui.cal=r.data;render()}).catch(()=>{ui.calErr='No se pudo crear el enlace. Revisa tu conexión.';render()});return;
  case'cal-copy':try{navigator.clipboard.writeText(v).then(()=>{ui.calCopied=v;render()})}catch(e){prompt('Copia este enlace:',v)}return;
  case'av-mode':ui.avMode=v;break;
  case'av-remind':{if(v)ui.month=v;const av=avOf(ui.month);if(!av)break;const mes=MES[+ui.month.slice(5,7)-1];const pend=servers().filter(i=>!(av.done&&av.done[i]));
    notify(pend,`Todavía falta tu disponibilidad de ${mes}. Márcala en Labores antes del ${fmt(av.deadline)}.`,{push:{title:`Falta tu disponibilidad de ${mes}`,body:`Márcala antes del ${fmt(av.deadline)}.`}});ui.toast=`Recordatorio enviado a ${pend.length} ${pend.length===1?'persona':'personas'}.`;break}
  case'av-open':ui.dm=v;ui.tab='disp';ui.avOpen=null;scrollTo(0,0);break;
  case'dm':{const[y,m]=(ui.dm||today.slice(0,7)).split('-').map(Number);const d=new Date(y,m-1+(+v),1);const nx=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;if(nx>=today.slice(0,7))ui.dm=nx;break}
  case'av-close':ui.avOpen=null;break;
  case'avday':if(isPub(v.slice(0,7))||Object.keys(state.schedules[v.slice(0,7)]||{}).length){ui.flash='Ese mes ya tiene horario: avisa con «No puedo ir» en tu labor.';break}p.blocked=p.blocked.includes(v)?p.blocked.filter(x=>x!==v):[...p.blocked,v];break;
  case'av-done':{const av=avOf(v);if(av){av.done=av.done||{};av.done[p.id]=Date.now()}ui.avOpen=null;ui.flash='Gracias. Tu disponibilidad quedó guardada.';break}
  case'regen':ui.regen=true;break;
  case'regen-no':ui.regen=false;break;
  case'edit':if(v&&/^\d{4}-\d\d-\d\d/.test(v)&&svcGone(v.slice(0,10)))return;if(!p.admin)return;ui.edit=v;break;
  case'pick-x':ui.edit=null;break;
  case'assign':{const[d,k,id]=v.split('|');const ym=d.slice(0,7);state.schedules[ym]=state.schedules[ym]||{};const as=state.schedules[ym][d]=state.schedules[ym][d]||{};const prev=as[k];if(id)as[k]=id;else delete as[k];ui.edit=null;
    // Avisar del cambio a la persona nueva y a la que salió (solo en meses publicados y fechas que no pasaron)
    if(prev!==id&&isPub(ym)&&d>=today){const s=slotOf(d,k),lbl=s?s.l:k,np0=person(id),op0=person(prev),nm=x=>x&&{...x,name:x.name.replace(/\.$/,'')},np=nm(np0),op=nm(op0),W=DOW[pd(d).getDay()].toLowerCase(),when=`el ${W} ${fmt(d).replace(/^\S+\s/,'')}`;
      if(np)notify([id],`Cambio en el horario: ahora te toca ${lbl} ${when}${op?` (en lugar de ${op.name})`:''}.`,{push:{title:'Te pusieron en una labor',body:`${lbl} ${when}${op?` · en lugar de ${op.name}`:''}`}});
      if(op)notify([prev],`Cambio en el horario: ya no te toca ${lbl} ${when}${np?`, ahora va ${np.name}`:''}.`,{push:{title:'Cambio en tu horario',body:`Ya no te toca ${lbl} ${when}${np?` · ahora va ${np.name}`:''}`}});
      const av=[np0,op0].filter(x=>x&&x.id!==state.me).map(x=>x.name);ui.flash=av.length?`Guardado. Se avisó a ${av.join(' y ')}.`:'Guardado.'}
    else if(prev!==id)ui.flash=!isPub(ym)?`Guardado. No se avisa a nadie porque el horario de ${MES[+ym.slice(5,7)-1]} todavía es borrador.`:'Guardado.';
    break}
  case'day':{const w=+v;p.days=p.days.includes(w)?p.days.filter(x=>x!==w):[...p.days,w];break}
  case'dayset':{const[w,on]=v.split('|').map(Number);p.days=p.days.filter(x=>x!==w);if(on)p.days.push(w);break}
  case'block':{const d=$('blk').value;if(d&&!p.blocked.includes(d))p.blocked.push(d);if(d)(ui.blkOpen=ui.blkOpen||{})[d.slice(0,7)]=true;break}
  case'blk-fold':(ui.blkOpen=ui.blkOpen||{})[v]=!ui.blkOpen[v];break;
  case'unblock':p.blocked=p.blocked.filter(x=>x!==v);break;
  case'open':ui.open=ui.open===v?null:v;ui.delp=null;break;
  case'delp':ui.delp=v;break;
  case'delp-no':ui.delp=null;break;
  case'delp-yes':{const x=person(v);if(!x)break;
    // Se marca como borrada (como «Borrar mi cuenta»): sale de las labores que vienen, deja de recibir avisos y se borran sus datos.
    const dates=[];for(const ym in state.schedules)for(const d in state.schedules[ym])if(d>=today&&!svcGone(d)&&Object.values(state.schedules[ym][d]||{}).includes(v))dates.push(d);
    const bf=snapDays(dates);
    SB.from('members').delete().eq('person_id',v).then(()=>{},()=>{});SB.from('push_subs').delete().eq('person_id',v).then(()=>{},()=>{});
    if(PRIVTBL)SB.from('private_info').delete().eq('person_id',v).then(()=>{},()=>{});delete PRIV[v];
    Object.assign(x,{name:'Persona eliminada',email:'',phone:'',roles:[],days:[],blocked:[],admin:false,pastor:false,leipzig:false,deleted:Date.now()});for(const f of ['photo','predPref','privacy','avoidSlots','favorSlots','avoidDays','noSlots','maxOne','introNotWith','freeAlab','pref'])delete x[f];
    for(const k in state.fixed||{})for(const w in state.fixed[k])if(state.fixed[k][w]===v)delete state.fixed[k][w];
    for(const d of dates){const ym=d.slice(0,7),as=state.schedules[ym][d];for(const k in as)if(as[k]===v){delete as[k];refill(ym,d,k)}}
    const n=schedDiffNotify(bf);ui.flash=`Persona quitada.${dates.length?` Sus labores de las próximas fechas se reasignaron${n?` y se avisó a ${n} ${n===1?'persona':'personas'}`:''}.`:''}`;ui.delp=null;ui.open=null;break}
  case'addp':{const n=$('np-name').value.trim();if(!n)return;const id=uid();state.people.push(P(id,n,$('np-sex').value,[]));ui.open=id;break}
  case't-add':{const n=$('t-new').value.trim();if(!n)return;const id=uid();state.teachings.push({id,title:n});dupFlash(id);break}
  case'pdfdel':{const[kd,iv,l='de']=v.split('|');const x=pdfList(kd).find(z=>z.id===iv),fk=LANGF[l];if(x&&x[fk]){const aid=x[fk].id;delete x[fk];if(AS)AS.delete(aid).catch(()=>{})}break}
  case't-del':ui.tDel=v;render();return;
  case't-del-ok':state.teachings=state.teachings.filter(t=>t.id!==v);ui.tDel=null;break;
  case't-del-no':ui.tDel=null;render();return;
  case't-up':case't-down':{const tm=teachMap(),dOf={};for(const d in tm)dOf[tm[d].id]=d;const mv=state.teachings.filter(t=>!isPinned(t)).sort((x,y)=>(dOf[x.id]||'9')<(dOf[y.id]||'9')?-1:1);const i=mv.findIndex(t=>t.id===v),j=a==='t-up'?i-1:i+1;if(i<0||j<0||j>=mv.length)return;
    const arr=state.teachings,ia=arr.indexOf(mv[i]),ib=arr.indexOf(mv[j]);[arr[ia],arr[ib]]=[arr[ib],arr[ia]];break}
  case't-pin':{const t=state.teachings.find(x=>x.id===v);if(!t)return;if(isPinned(t)){delete t.pin;delete t.pinAuto;t.unpinned=1;ui.flash='Soltada: ahora se corre con las demás.'}else{const tm=teachMap();const d=Object.keys(tm).find(k=>tm[k].id===v);if(!d)return;t.pin=d;delete t.unpinned;ui.flash=`Fija el ${fmt(d)}: ya no se corre.`}break}
  case'tr-add':{const d=v;if(!d)return;state.transNo=(state.transNo||[]).filter(x=>x!==d);state.trans.push({id:uid(),date:d,link:$('tr-link').value.trim(),note:''});break}
  case'tr-edit':ui.trEdit=v;break;
  case'tr-done':ui.trEdit=null;break;
  case'tr-del':state.trans=state.trans.filter(t=>t.id!==v);break;
  case'lz-add':{const d=$('lz-date').value,tt=$('lz-t').value.trim();if(!d||!tt){ui.lzErr=!d&&!tt?'Elige la fecha y escribe la predicación.':!d?'Elige la fecha.':'Escribe el título de la predicación.';ui.lzD=d;ui.lzT=tt;break}ui.lzErr='';ui.lzD='';ui.lzT='';state.leipzig.push({id:uid(),date:d,teaching:tt});
    const th=ds(new Date(pd(d).getTime()-2*864e5)),bf=snapDays([th,d]);fixDate(th);fixDate(d);const n=schedDiffNotify(bf);if(n)ui.flash=`Visita agregada. Se avisó a ${n} ${n===1?'persona':'personas'} de cambios en su labor.`;break}
  case'lz-del':{const l=state.leipzig.find(t=>t.id===v);state.leipzig=state.leipzig.filter(t=>t.id!==v);
    if(l){const th=ds(new Date(pd(l.date).getTime()-2*864e5)),bf=snapDays([th,l.date]);fixDate(th);fixDate(l.date);const n=schedDiffNotify(bf);if(n)ui.flash=`Visita quitada. Se avisó a ${n} ${n===1?'persona':'personas'} de cambios en su labor.`}break}
  default:return}
  save();render()});
document.addEventListener('change',e=>{const t=e.target.closest('[data-c]');if(!t)return;const c=t.dataset.c,v=t.dataset.v||'',p=me();
  if(ui.viewAs&&!['md','md-area'].includes(c)){viewOnly();return}
  switch(c){
  case'cell':{const[d,k]=v.split('|');const ym=d.slice(0,7);const as=state.schedules[ym][d]=state.schedules[ym][d]||{};if(t.value)as[k]=t.value;else delete as[k];ui.edit=null;break}
  case'me-name':if(t.value.trim())p.name=t.value.trim();break;
  case'me-phone':p.phone=t.value.trim();savePriv(p);break;
  case'pd-up':{const f=t.files&&t.files[0];if(!f||!AS)return;if(f.type!=='application/pdf'){ui.uplMsg='Debe ser un PDF.';render();return}ui.upl='pd';ui.uplMsg='';render();
    AS.upload(f).then(r=>{state.privDocs=state.privDocs||[];state.privDocs.push({id:uid(),name:f.name,ts:Date.now(),pdf:{id:r.id,name:f.name}});ui.upl=null;save();render()}).catch(e=>{ui.upl=null;ui.uplMsg=e&&e.code==='too_large'?'El PDF es muy grande (máximo 20 MB).':'No se pudo guardar. Intenta de nuevo.';render()});return}
  case'lz-name':{const l=state.leipzig.find(x=>x.id===v);if(l)l.teaching=t.value.trim();break}
  case't-name':{const x=state.teachings.find(z=>z.id===v);if(x&&t.value.trim())x.title=t.value.trim();break}
  case'pred-pref':{p.predPref=p.predPref||{};if(t.value)p.predPref[v]=t.value;else delete p.predPref[v];break}
  case'photo':{const f=t.files&&t.files[0];if(!f)return;const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const S=128,c=document.createElement('canvas');c.width=c.height=S;const k=Math.min(im.width,im.height),g=c.getContext('2d');g.drawImage(im,(im.width-k)/2,(im.height-k)/2,k,k,0,0,S,S);URL.revokeObjectURL(u);p.photo=c.toDataURL('image/jpeg',.72);save();render()};im.onerror=()=>{ui.toast='No se pudo leer esa imagen.';render()};im.src=u;return}
  case'p-email':{const x=person(v),old=x.email||'';x.email=t.value.trim();syncMember(x,old);savePriv(x);break}
  case'p-name':if(t.value.trim())person(v).name=t.value.trim();break;
  case'p-sex':person(v).sex=t.value;break;
  case'p-phone':{const x=person(v);x.phone=t.value.trim();savePriv(x);break}
  case'p-role':{const[id,r]=v.split('|');const x=person(id);x.roles=t.checked?[...new Set([...x.roles,r])]:x.roles.filter(y=>y!==r);break}
  case'p-flag':{const[id,f]=v.split('|');person(id)[f]=t.checked;syncMember(person(id));break}
  case'tr-text':{const x=state.trans.find(z=>z.id===v);if(x)x.link=t.value.trim();ui.trEdit=null;break}
  case'pdf':uploadPdf(v,t.files&&t.files[0]);return;
  case'md':ui.md[v]=t.value;return;
  case'md-area':{const a=ui.md.areas;ui.md.areas=t.checked?[...new Set([...a,v])]:a.filter(x=>x!==v);return}
  case't-start':if(t.value)state.teachStart=t.value;break;
  default:return}
  save();render()});
document.addEventListener('focusout',e=>{if(e.target.matches('select.cell')){setTimeout(()=>{if(ui.edit&&!document.activeElement?.matches('select.cell')){ui.edit=null;render()}},150)}});
function resolveMe(){const em=((SESSION&&SESSION.user&&SESSION.user.email)||'').toLowerCase();
  const real=(MYPID&&person(MYPID))||state.people.find(x=>(x.email||'').toLowerCase()===em&&em);
  state.me=real?(ui.viewAs&&real.admin&&person(ui.viewAs)?ui.viewAs:real.id):null;
  const r=real;AS=r&&(r.admin||r.pastor)?{
    upload:async f=>{const path=Date.now()+'-'+f.name.replace(/[^\w.\-]+/g,'_');const{error}=await SB.storage.from('fichas').upload(path,f,{contentType:'application/pdf'});if(error)throw error;return{id:path}},
    delete:async path=>{await SB.storage.from('fichas').remove([path])}}:null}
const realMe=()=>{const em=((SESSION&&SESSION.user&&SESSION.user.email)||'').toLowerCase();return (MYPID&&person(MYPID))||state.people.find(x=>(x.email||'').toLowerCase()===em&&em)};
function adopt(j,ver){if(typeof j!=='string')return;if(ver&&ver<VER)return;if(ver)VER=ver;if(j===lastJson)return;
  let r;try{r=JSON.parse(j)}catch(e){return}
  const pending=lastJson!==null&&sharedJson()!==lastJson,m=state.me;
  state=pending&&BASE?merge3(BASE,sharedObj(),r):r;state.me=m;BASE=r;lastJson=j;storeBase();applyPriv();
  state.reqs=state.reqs||[];state.notifs=state.notifs||[];state.msgs=state.msgs||[];state.meets=state.meets||[];
  if(migrate()||pending)save();
  try{localStorage.setItem(LS,JSON.stringify(state))}catch(e){}}
async function loadData(){SYNC='loading';render();
  const em=SESSION.user.email.toLowerCase();
  try{const m=await SB.from('members').select('person_id').eq('email',em).maybeSingle();MYPID=m.data?m.data.person_id:null}catch(e){}
  const{data,error}=await SB.from('app_state').select('json,version').eq('id','main').maybeSingle();
  if(error){SYNC=navigator.onLine===false?'local':'error';READY=true;render();clearTimeout(lTimer);lTimer=setTimeout(()=>{if(SESSION&&!LOADED)loadData()},10000);return}
  await loadPriv();
  if(data&&data.json)adopt(data.json,data.version);
  LOADED=true;SYNC='ok';READY=true;resolveMe();render();
  await movePriv();
  autoDraft();
  if(sharedJson()!==lastJson)push();
  ensureSub(false);
  if(!CH)CH=SB.channel('estado').on('postgres_changes',{event:'*',schema:'public',table:'app_state',filter:'id=eq.main'},pl=>{if(!(pl.new&&pl.new.json))return;if(writing){skipped=true;return}adopt(pl.new.json,pl.new.version);resolveMe();softRender()}).subscribe();}
async function syncMember(p,oldEmail){try{
  if(oldEmail&&oldEmail.toLowerCase()!==(p.email||'').toLowerCase())await SB.from('members').delete().eq('email',oldEmail.toLowerCase());
  if(p.email)await SB.from('members').upsert({email:p.email.toLowerCase(),person_id:p.id,is_admin:!!p.admin,can_upload:!!(p.admin||p.pastor)})}catch(e){}}
SB.auth.onAuthStateChange((ev,s)=>{if(window.__MOVED)return;if(ev==='PASSWORD_RECOVERY'){ui.authMode='newpass';SESSION=s;render();return}
  const had=SESSION&&SESSION.user&&SESSION.user.id;SESSION=s;
  if(s&&s.user&&had!==s.user.id){READY=false;loadData()}
  if(!s){READY=false;LOADED=false;MYPID=null;state.me=null;VER=0;lastJson=null;BASE=null;PRIV={};try{localStorage.removeItem(LS);localStorage.removeItem(BASEK)}catch(e){}render()}});
/* Al salir: este aparato deja de recibir los avisos de esta cuenta. */
async function dropSub(){try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();const sub=reg&&await reg.pushManager.getSubscription();
  if(sub){await SB.from('push_subs').delete().eq('endpoint',sub.endpoint);await sub.unsubscribe()}}catch(e){}}
(async()=>{if(window.__MOVED)return;const{data}=await SB.auth.getSession();SESSION=data.session;if(SESSION)loadData();else render()})();
/* instalar */
let INSTALL=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();INSTALL=e;render()});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

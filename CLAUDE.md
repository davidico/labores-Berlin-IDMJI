# Labores Berlín — guía para seguir el proyecto en Claude Code

App web instalable (PWA) para organizar las labores del grupo de Pistoriusstraße 114 (Berlín): quién sirve cada culto, avisos al celular, disponibilidad, reemplazos, fichas para intérpretes.

- **Producción:** https://labores-berlin.pages.dev (Cloudflare Pages, rama `main`)
- **Dirección vieja:** https://labores-berlin-idmji.pages.dev → solo muestra «Esta app ya no funciona, bórrala» (`public/go.js`). Borrar ese proyecto de Cloudflare cuando todos hayan reinstalado.
- **Repo:** GitHub `davidico/labores-Berlin-IDMJI` (el remoto viejo `labores-berlin-idmji` redirige)
- **Admin y responsable de datos:** David Ismael Cueva Ortiz (usuario de la app: `david`, admin)
- **Idioma de la app y de los usuarios:** español; muchos celulares están en alemán → en instrucciones poner el término alemán entre paréntesis, p. ej. «Instalar app *(App installieren)*».
- **No poner nunca el nombre de la iglesia ni «idmji»** en nada visible (textos, dominio, avisos).

---

## Cómo publicar (siempre así)

1. Cambiar el código.
2. **Subir la versión en 3 sitios** (cada publicación sube +0.1, hoy va en **8.0**):
   - `public/app.js` → `const APPV = 'X.Y'`
   - `public/version.json` → `{"v":"X.Y"}`
   - `public/sw.js` → `const CACHE = 'labores-vNN'` (+1, hoy `labores-v86`)
3. `node --check public/app.js`
4. Probar (ver «Pruebas»).
5. `git commit` con mensaje en español «Versión X.Y: qué cambió» y `git push origin main`. Cloudflare publica solo en 1–2 min.
6. La app instalada se actualiza sola: al volver a abrirla compara `version.json` y recarga; cada 30 min muestra un aviso de actualización.

El usuario quiere que se publique directo, sin pedir permiso, y que se diga qué cambió en pocas líneas.

## Estructura

```
public/
  index.html        Estructura + TODO el CSS (bloques <style>; agregar estilos nuevos al final, antes de </style>)
  app.js            Toda la lógica (~1.300 líneas, JS sin framework, sin build)
  sw.js             Service worker: caché, notificaciones push, clic en notificación (?n= / ?go= / ?tr=)
  go.js             Aviso de «la app cambió de dirección» (solo en el dominio viejo)
  privacy.js        Aviso de privacidad ES/DE (PRIV_V = versión; subirla obliga a aceptar de nuevo)
  config.js         URL y anon key de Supabase
  version.json      Versión publicada (para la autoactualización)
  _headers          CSP + no-cache para HTML/JS (Cloudflare)
  manifest.webmanifest, icon-*.png, badge.png (ícono «LB» de la notificación)
supabase/
  functions/push/index.ts   Función Edge (Deno/TypeScript): avisos, calendario ICS, borrar cuenta
  push.sql                  pg_cron: llama a la función cada 30 min
  schema.sql                Tablas
  seguridad.sql             private_info, reglas por persona, guardia del estado (solo admin), historial
netlify.toml        Desactivado (ignore = "exit 0"); ya no se usa Netlify
```

**CSP:** `script-src 'self' https://cdn.jsdelivr.net` → **nada de scripts inline ni `onclick=`**. Todos los eventos van por delegación: `document.addEventListener('click', …closest('[data-a]'))` con `data-a="accion"` y `data-v="valor"`, y el `switch(a)` grande en `app.js`. Los `input` usan `data-c` o listeners delegados.

## Arquitectura

- **Frontend:** `render()` reconstruye `#app` con template strings a partir de `state` y `ui`. Cada pestaña es una función `vMis`, `vCal`, `vDisp`, `vHor`, `vEns`, `vPer`, `vAj`; en PC (≥1024 px) `vMis` se reemplaza por `vDash` (panel de escritorio) y el menú pasa a la izquierda.
- **Datos:** Supabase. Todo el estado compartido es **un solo documento JSON** en la tabla `app_state` (fila `id='main'`, columnas `json` y `version`). Se guarda con control de versión (`save()` → `push()`), y llega en tiempo real a los demás (Realtime). Funciona bien para ~22 usuarios; si crece, separar en tablas.
- **Datos privados:** teléfono y correo van en la tabla `private_info` (solo admin y la propia persona). Cuando el admin entra, `movePriv()` los pasa allí y marca `state.privMoved`; desde entonces `sharedObj()` los quita del estado compartido y `applyPriv()` los vuelve a poner en memoria. Si la tabla no existe, todo sigue como antes.
- **Guardia del estado (`seguridad.sql`):** un trigger rechaza (código 42501) que alguien que no es admin cambie admin/pastor/roles, `fixed`, `published` o quite personas; guarda las últimas 150 versiones en `app_state_history`.
- **Sincronización:** el último estado sincronizado se guarda en `localStorage` (`labores-berlin-v1-base`) para unir cambios pendientes al volver; al volver a la app se hace `refetch()`; Realtime no redibuja mientras alguien escribe (`softRender()`).
- **Otras tablas:** `members` (email ↔ person_id, is_admin; cada uno ve solo su fila), `push_subs` (suscripciones Web Push), `push_log` (para no repetir avisos), bucket `fichas` (casi en desuso; ahora las fichas son enlaces de Drive).
- **Auth:** Supabase email + contraseña. Nunca ver ni pedir contraseñas.
- **Función `push`** (Verify JWT desactivado; se valida por dentro), modos:
  - `{"mode":"daily"}` → la llama pg_cron cada 30 min; ejecuta `monthly()`, `pastorReminders()`, `todayReminder()`, `introReminders()`, `leipzigInvite()`, `daily()`. Cada aviso se deduplica con `once(clave)` o `push_log`.
  - `{"mode":"send", to, title, body, url}` → la usa la app (`pushOut`) para avisos por acción. `url` solo acepta rutas internas `/?…`.
  - `GET ?p=<persona>&t=<firma>` → calendario ICS personal (HMAC con `VAPID_PRIVATE_KEY+':cal'`; `*todos` = calendario completo para admin).
  - `caltoken`, `delete-me` (borra cuenta y anonimiza), `ping`.
  - web-push con `{ TTL: 43200, urgency: 'high' }`.
- **Desplegar la función:** no hay CLI configurada. Se hace desde el panel de Supabase (Edge Functions → push → Code): reemplazar el código, «Deploy updates», confirmar. **Mantener `supabase/functions/push/index.ts` idéntico a lo desplegado** (comparar SHA-256). El repo NO despliega la función solo.

## Modelo de datos (`state`)

| Clave | Qué es |
|---|---|
| `people[]` | `{id, name, sex, roles[], admin, pastor, leipzig, phone, photo, privacy:{v,ts}, days, blocked[], avoidSlots, favorSlots, avoidDays, deleted}` |
| `schedules[ 'YYYY-MM' ][ 'YYYY-MM-DD' ][ slotKey ]` | id de la persona asignada |
| `published[ 'YYYY-MM' ]` | mes visible para todos (si no, borrador) |
| `teachings[]` | `{id, title, linkDe, linkEn, pin?, pinAuto?, unpinned?}` en orden |
| `teachStart` | fecha desde la que se reparten las enseñanzas |
| `trans[]` | transmisiones `{id, date (domingo), link, note}` |
| `transNo[]` | domingos en que el pastor respondió «No hay transmisión» |
| `leipzig[]` | visitas `{id, date (sábado), teaching, linkDe, linkEn, going[]}` |
| `intro[ fecha ]` | `{cita, link}` que pone quien da la introducción |
| `linkReps[]` | reportes de fichas `{id, kind:'t'|'l', tid, lang, d, by, note, ts, open, to[]}` |
| `notifs[]` | avisos en la app `{id, ts, to[], text, read[], by, date?, go?}` |
| `reqs[]`, `msgs[]`, `meets[]` | reemplazos/llego tarde, mensajes a equipos, reuniones |
| `avReqs[ 'YYYY-MM' ]` | pedido de disponibilidad `{deadline, done{}}` |
| `fixed` | asignaciones fijas por día de semana (sonido, puerta) |

## Reglas de negocio importantes

- **Cultos (`SVC`):** Lun/Mié/Vie Alabanza 18:30 · Mar/Sáb Estudio bíblico (Sáb 18:00) · Jue Enseñanza 18:30 · Dom Enseñanza 10:00.
- **Un culto «pasa»** (`svcGone(d)`) a las **20:00** si es de la tarde (18:00/18:30) y 150 min después si es el domingo 10:00 (12:30): desaparece de Labores y Por día; en la Tabla del horario el día queda gris y bloqueado. **La semana termina el domingo a las 13:00** (`weekPast`).
- **Enseñanzas:** se reparten en orden sobre jueves y domingos, saltando domingos con transmisión (`teachMap()`). Las **fijas** (`pin`) no se corren. **La del día que predica David se fija sola** (`autoPinDavid()`). La misma lógica está duplicada en el servidor (`teachMapS`) → cambiar las dos.
- **Jueves antes de una visita a Leipzig:** se agrega el puesto `predica` (David o Javier, por defecto David) y la introducción la puede dar Oswaldo, Javier o David. En la Tabla salen «Intro.» y «Predi.».
- **Introducción (jue/dom):** tema en rueda de 5 (`INTROT`, `introTema`), los domingos con transmisión no hay introducción y el tema pasa al siguiente culto.
- **Preámbulos:** estudio bíblico = mismo preámbulo el martes y el sábado de la semana, rueda de 5 (`PRE_EB`); transmisión = rueda propia (`PRE_TR`); alabanza Lun/Mié/Vie = `preamb()`.
- **Gabriela:** ve «Alabanza (vas tú)» los Lun/Mié/Vie en que David no tiene labor (no se le asigna nada).
- **Fichas:** enlaces de Drive por enseñanza y por idioma. Todo el equipo de alemán ve el de alemán y todo el de inglés el de inglés (por reemplazos de último momento). Leipzig: solo el equipo de traducción; quienes viajan ven los dos.
- **Ofrendas:** «pareja 1 / pareja 2» y cada uno ve a su pareja (sin teléfono: el teléfono solo lo ve el admin).
- **Avisos por cambios del admin:** solo en meses publicados y fechas futuras; se avisa a quien entra y a quien sale (asignar, Leipzig, volver a generar, quitar persona → `schedDiffNotify()`). «Volver a generar» no toca los días que ya pasaron.
- **Quitar persona:** se marca `deleted` (no se borra del arreglo), sale de las labores que vienen (se rellenan) y se borran sus filas en members, push_subs y private_info.
- **«Ver como»:** solo para mirar; las acciones que guardan están bloqueadas (`VIEWOK`).

## Notificaciones automáticas (hora de Berlín)

| Cuándo | A quién | Abre |
|---|---|---|
| Diario 8:00 | Quien sirve hoy / reunión hoy | Labores |
| Diario 20:30 | Quien sirve mañana / reunión mañana | Labores |
| Lun–Mié 8:00 | Pastor: fichas o títulos que faltan | `?go=ens` |
| Vie 15:00 (Sáb 15:00 si no respondió) | Pastor: ¿hay transmisión? con botones Sí/No | `?tr=fecha` |
| Mié 10:00 y Jue 16:00 / Vie 10:00 y Sáb 16:00 | Introducción del jue / dom: poner cita | `?go=ic&d=fecha` |
| Mié y Vie 17:00 antes de Leipzig | Todos menos viajeros y los que ya dijeron «Yo iré» | `?go=lz` |
| Día 15 / 20 / 23, 10:00 | Pedir disponibilidad / recordar / cerrar (admin) | `?go=disp` / `?go=hor` |

Los avisos que manda la app llevan `?n=<id del aviso>`. Tocar un aviso (en la app o en el celular) lleva a la acción (`goFor()` / `nGo()`).
iPhone: en `sw.js` solo opciones básicas de notificación (vibrate/renotify/actions rompían iOS).

## Privacidad (DSGVO)

- Aceptación obligatoria del aviso (`privacy.js`, versión `PRIV_V`) antes de usar la app.
- «Borrar mi cuenta» en Ajustes → modo `delete-me`.
- Teléfono, correo y disponibilidad: solo los ve el admin. No mostrar datos personales de más.
- Supabase en la UE; DPA de Cloudflare guardado en la app (sección solo admin); VVT en un documento aparte.

## Convenciones de UI (las pidió el usuario)

- Tamaños de letra según buenas prácticas: texto principal 16 px, notas 15 px, secundario 14 px, etiquetas en mayúsculas y números de aviso nunca menos de 12 px. Áreas táctiles ≥ 44 px (enlaces ≥ 40 px).
- **Tarjetas de Labores (`itemCard`, diseño «C»):** cabecera (fecha, culto, chips); arriba un cuadro dorado `todoBox` con lo que prepara esa persona según su labor (Tu predicación · Tu introducción con ✓/! de cita y testimonio · Tu preámbulo · Tu interpretación con las fichas); debajo secciones con etiqueta (`isec`: Enseñanza del culto, Introducción, Tu pareja, Transmisión, Leipzig, Reunión). Las notas de `myItems` son objetos `{l, h}`.
- **Recordatorio de la introducción (`introPend`/`introNag`):** a quien da la introducción en los próximos 8 días y le falta la cita o el enlace del testimonio: un solo aviso amarillo arriba de Labores (el más próximo), número rojo en la pestaña y en el ícono de la app (`appBadge`, Badging API) y «!» amarillo pequeño en la tarjeta. El testimonio no es obligatorio: «No tengo testimonio» guarda `intro[fecha].noLink`.
- **Tarjeta según el puesto:** quien predica ve en el cuadro solo el título de su predicación; el intérprete de la introducción ve «Interpretas la introducción» (quién, tema, cita, testimonio); el de predicación/testimonios ve «Interpretas la predicación» (título, quién predica, fichas). Los avisos con `date` de un culto que ya pasó no se muestran ni cuentan (`nLive`).
- **Predicaciones (`cronograma`) y Pastor:** «Predica: X» va justo debajo del título; en la lista del pastor solo se muestra quién predica (no la introducción). Leipzig en Pastor: solo las visitas que vienen, con el mismo formato que las enseñanzas.
- **Enlaces externos (`xlink`):** texto que dice qué es («Ficha en alemán», «Ver el testimonio»), subrayado y con flecha ↗; nunca «LINK / Abrir». Si falta: punto rojo + «falta» + botón «Agregar enlace».
- **Pestaña Pastor, enseñanzas:** título + lápiz; debajo, en una línea, la fecha a la izquierda y las acciones (fijar, subir/bajar, quitar) pequeñas a la derecha.
- «No puedo ir» y «Llego tarde» quedan siempre visibles en cada tarjeta (no esconderlos en un menú).
- Espaciado en pasos de 8 px; **16 px entre contenido y botones**.
- Una acción principal por pantalla; lo poco usado o delicado en menú ⋯ o con confirmación.
- Estado como etiqueta (● Publicado / ● Borrador), filas que dicen cómo va («2 de 22 enviaron ›»).
- Hojas que suben desde abajo en el celular, centradas en PC.
- Lo pasado se oculta o queda gris y bloqueado.
- Confirmar lo que pasó con un mensaje corto (`ui.flash`).
- Editar con lápiz junto al texto; acciones de fila juntas (mover en grupo, quitar aparte y en naranja).
- Buscador en listas largas (sin tildes ni mayúsculas, `normQ`).
- Funcionar bien en celular y en PC (menú lateral ≥ 1024 px).

## Pruebas

No hay tests automáticos. Se prueba con **Playwright (Python)** cargando `public/` con un Supabase falso y datos de prueba, ejecutando acciones con `page.evaluate` y sacando capturas (390×844 celular, 1440×1000 PC). Patrón útil: `ui.viewAs='<id>'; resolveMe(); ui.tab='mis'; render()` para ver la app como otra persona. Para la función: quitar los `import`, transpilar con esbuild y correr con un cliente Supabase falso, simulando horas (`run('2026-11-13T14:00:00Z')`).

## Pendientes

- [ ] **David:** correr `supabase/seguridad.sql` en Supabase (SQL Editor) y desplegar la función `push` de la versión 7.7 (SHA-256 `d03fa78e…b35956`).
- [ ] Confirmar si los jueves se necesita la ficha en inglés (hoy la pestaña Pastor la pide siempre).
- [ ] Pendiente de seguridad: cualquier miembro todavía puede escribir horarios y avisos en el estado compartido (se puede recuperar con `app_state_history`); separarlo en tablas lo resolvería del todo.

- [ ] Borrar el proyecto viejo de Cloudflare `labores-berlin-idmji` (fin de noviembre).
- [ ] Quitar el nombre de la iglesia del documento VVT.
- [ ] Ver quién no activó notificaciones.
- [ ] A futuro: si la app crece, migrar a React + Vite y separar `app_state` en tablas.

## No hacer

- No poner el nombre de la iglesia ni «idmji».
- No escribir contraseñas ni claves en el código ni en el chat.
- No desactivar la verificación de identidad dentro de la función.
- No hacer `git push --force` ni reescribir historia.
- No avisar a los hermanos por meses en borrador.

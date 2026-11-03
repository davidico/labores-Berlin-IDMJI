// La app se mudó de dirección. En la dirección antigua ya no se puede usar:
// se muestra un aviso para BORRAR esta app primero y luego instalar la nueva.
// No hay botón para abrir la nueva directamente: así nadie se queda con la vieja instalada.
(function () {
  if (location.hostname !== 'labores-berlin-idmji.pages.dev') return;
  var ADDR = 'labores-berlin.pages.dev';
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var nav = ios ? 'Safari' : 'Chrome';
  var st = 'background:#fff;border-radius:14px;padding:16px;margin:0 0 14px;box-shadow:0 1px 3px rgba(0,0,0,.08)';
  var num = 'display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#1d2c66;color:#fff;font-weight:700;margin-right:10px;flex:none';
  var html =
    '<div style="max-width:460px;margin:0 auto;padding:24px 16px 40px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#141d33;line-height:1.5">' +
    '<div style="font-size:20px;font-weight:700;color:#1d2c66">Labores Berlín</div>' +
    '<h1 style="font-size:24px;margin:14px 0 6px">Esta app ya no funciona</h1>' +
    '<p style="font-size:16px;margin:0 0 18px">La app cambió de dirección. Hay que <b>borrar esta</b> e instalar la nueva (solo una vez). Tus labores y tus datos siguen igual, entras con el mismo correo y contraseña.</p>' +

    '<div style="' + st + ';border:2px solid #c0392b">' +
    '<div style="display:flex;align-items:center;font-size:18px;font-weight:700"><span style="' + num + ';background:#c0392b">1</span>Primero borra esta app</div>' +
    '<p style="font-size:16px;margin:10px 0 0">Sal de la app, ve a tu pantalla de inicio y mantén presionado el ícono <b>LB</b> → <b>' +
    (ios ? 'Eliminar app' : 'Desinstalar') + '</b> <i>(' + (ios ? 'App entfernen' : 'Deinstallieren') + ')</i>' +
    (ios ? ' → <b>Eliminar de la pantalla de inicio</b> <i>(Vom Home-Bildschirm entfernen)</i>' : '') + '.</p></div>' +

    '<div style="' + st + '">' +
    '<div style="display:flex;align-items:center;font-size:18px;font-weight:700"><span style="' + num + '">2</span>Abre ' + nav + ' y escribe</div>' +
    '<div id="lb-addr" style="font-size:20px;font-weight:700;text-align:center;background:#eef1f8;border-radius:10px;padding:12px;margin:12px 0 10px;user-select:all;-webkit-user-select:all;word-break:break-all">' + ADDR + '</div>' +
    '<button id="lb-copy" type="button" style="width:100%;min-height:48px;border:2px solid #1d2c66;background:#fff;color:#1d2c66;font-weight:700;font-size:16px;border-radius:12px">Copiar dirección</button>' +
    '<p style="font-size:15px;margin:10px 0 0;color:#4a5470">Entra con tu correo y contraseña de siempre.</p></div>' +

    '<div style="' + st + '">' +
    '<div style="display:flex;align-items:center;font-size:18px;font-weight:700"><span style="' + num + '">3</span>Instálala</div>' +
    '<p style="font-size:16px;margin:10px 0 0">' +
    (ios ? 'Toca <b>Compartir</b> <i>(Teilen)</i> → <b>Agregar a pantalla de inicio</b> <i>(Zum Home-Bildschirm)</i>.'
         : 'Menú <b>⋮</b> → <b>Instalar app</b> <i>(App installieren)</i>.') + '</p></div>' +

    '<div style="' + st + '">' +
    '<div style="display:flex;align-items:center;font-size:18px;font-weight:700"><span style="' + num + '">4</span>Activa las notificaciones</div>' +
    '<p style="font-size:16px;margin:10px 0 0">Abre la app nueva desde tu pantalla de inicio y toca <b>Activar notificaciones</b> → <b>Permitir</b> <i>(Zulassen)</i>.</p></div>' +
    '</div>';

  function copy() {
    var b = document.getElementById('lb-copy');
    function ok() { b.textContent = '✓ Copiada'; setTimeout(function () { b.textContent = 'Copiar dirección'; }, 2500); }
    function fallback() {
      var el = document.getElementById('lb-addr'), r = document.createRange();
      r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      try { document.execCommand('copy'); ok(); } catch (_) { b.textContent = 'Mantén presionada la dirección para copiarla'; }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ADDR).then(ok, fallback);
    else fallback();
  }
  function show() {
    document.title = 'Labores Berlín · borra esta app';
    document.body.innerHTML = html;
    document.body.style.background = '#f2f4f8';
    document.getElementById('lb-copy').addEventListener('click', copy);
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  window.__MOVED = true;
})();

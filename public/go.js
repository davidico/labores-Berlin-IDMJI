// La app se mudó de dirección. En la dirección antigua ya no se puede usar:
// se muestra un aviso para instalar la nueva (así la gente no se queda con la app vieja).
(function () {
  if (location.hostname !== 'labores-berlin-idmji.pages.dev') return;
  var NEW = 'https://labores-berlin.pages.dev';
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var html =
    '<div style="max-width:460px;margin:0 auto;padding:28px 18px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#141d33;line-height:1.5">' +
    '<div style="font-size:22px;font-weight:700;color:#1d2c66">Labores Berlín</div>' +
    '<h1 style="font-size:24px;margin:18px 0 8px">La app cambió de dirección</h1>' +
    '<p style="font-size:16px;margin:0 0 16px">Esta versión ya no se usa. Instala la nueva (es solo una vez). Tus labores y datos siguen igual.</p>' +
    '<a href="' + NEW + '" style="display:block;text-align:center;background:#1d2c66;color:#fff;text-decoration:none;font-weight:700;font-size:17px;padding:14px;border-radius:12px">Abrir la app nueva</a>' +
    '<ol style="font-size:16px;padding-left:22px;margin:20px 0 0">' +
    '<li style="margin-bottom:8px">Borra esta app: mantén presionado su ícono → <b>' + (ios ? 'Eliminar app' : 'Desinstalar') + '</b> <i>(' + (ios ? 'App entfernen' : 'Deinstallieren') + ')</i>.</li>' +
    '<li style="margin-bottom:8px">Abre <b>labores-berlin.pages.dev</b> en ' + (ios ? '<b>Safari</b>' : '<b>Chrome</b>') + ' y entra con tu correo y contraseña.</li>' +
    '<li style="margin-bottom:8px">' + (ios ? 'Toca <b>Compartir</b> <i>(Teilen)</i> → <b>Agregar a pantalla de inicio</b> <i>(Zum Home-Bildschirm)</i>.' : 'Menú <b>⋮</b> → <b>Instalar app</b> <i>(App installieren)</i>.') + '</li>' +
    '<li>Abre la app nueva y toca <b>Activar notificaciones</b> → <b>Permitir</b>.</li></ol></div>';
  function show() { document.title = 'Labores Berlín · nueva dirección'; document.body.innerHTML = html; document.body.style.background = '#f2f4f8'; }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  window.__MOVED = true;
})();

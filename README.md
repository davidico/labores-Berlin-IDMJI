# Labores Berlín

App instalable (PWA) para organizar las labores de la iglesia en Berlín: horarios por equipo,
disponibilidad, reemplazos, mensajes de púlpito, reuniones y fichas de interpretación.

## Cómo está armada
- `index.html`, `app.js`: la app (sin compilación, archivos estáticos).
- `config.js`: Project URL y anon key de Supabase.
- `sw.js`, `manifest.webmanifest`, íconos: lo que permite instalarla en el celular.
- `supabase/setup.sql`: tablas, reglas de acceso y datos iniciales. Se ejecuta una sola vez.
- Netlify publica la carpeta tal cual cada vez que cambia el repositorio.

## Quién puede entrar
Solo los correos que el administrador escribe en **Personas → Correo para entrar a la app**.
Cada hermano crea su cuenta con ese correo y su propia contraseña.

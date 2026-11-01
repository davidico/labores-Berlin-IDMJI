# Labores Berlín

App instalable (PWA) para organizar las labores de la iglesia en Berlín: horarios por equipo,
disponibilidad, reemplazos, mensajes de púlpito, reuniones y fichas de interpretación.

## Cómo está armada
- `public/`: la app que publica Cloudflare Pages (labores-berlin-idmji.pages.dev) (`index.html`, `app.js`, `config.js`, `sw.js`, manifest e íconos).
- `supabase/schema.sql`: tablas y reglas de acceso.
- `tools/make_sql.py`: genera el SQL con los datos iniciales (no se guarda en el repositorio).
- Cloudflare Pages publica la carpeta `public/` cada vez que cambia la rama main (Netlify quedó desactivado con `ignore = "exit 0"`).

## Quién puede entrar
Solo los correos que el administrador escribe en **Personas → Correo para entrar a la app**.
Cada hermano crea su cuenta con ese correo y su propia contraseña.

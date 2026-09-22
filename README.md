# Minecraft Extremo

El registro privado de nuestro Realm Hardcore: tres jugadores, una sola vida compartida y una historia nueva cada vez que el mundo vuelve a empezar.

**Producción:** [minecraft-extremo.vercel.app](https://minecraft-extremo.vercel.app)

## La regla del Realm

Si uno muere, el TRY termina para todos. La aplicación conserva lo que el mundo borra: causa, dimensión, progreso, duración, rachas, eventos y culpables. Cada tres derrotas agrupadas se desbloquea un castigo de Instagram.

## Experiencia

- Dashboard privado con el TRY activo, cronómetro y acciones críticas.
- Navegación lateral con el estado del Realm y el contador total de muertes.
- Identidad visual obsidiana–amatista, superficies de cristal y secciones inspiradas en Overworld, Nether y The End.
- Historial completo de intentos con correcciones y bitácora de eventos.
- Estadísticas derivadas: rachas, progreso máximo, causas y dimensiones más mortales.
- Castigos automáticos cada tres derrotas aún no agrupadas.
- Overlay `/overlay` actualizado cada cinco segundos para OBS o una segunda pantalla.
- Animaciones de interfaz con Motion y soporte para `prefers-reduced-motion`.
- Diseño adaptable: sidebar en escritorio y dock compacto en móvil.

## Tecnología

| Capa | Elección |
| --- | --- |
| Aplicación | Next.js 16, React 19, TypeScript |
| Estilos | Tailwind CSS 4 + sistema visual propio |
| Movimiento | Motion for React |
| Iconos | Lucide |
| Tipografía | Jersey 10, Oxanium e Inter |
| Datos | Supabase Postgres |
| Validación | Zod + constraints de PostgreSQL |
| Producción | Vercel |

## Arquitectura

```text
src/app                 páginas, layouts y Server Actions
src/components          navegación, dashboard, formularios y UI
src/lib                  autenticación, datos, estadísticas y Supabase
src/types                tipos del dominio
supabase/migrations      esquema y políticas versionadas
supabase/seed.sql        historia inicial reproducible
```

Las estadísticas se calculan desde `runs`; no existen contadores duplicados. `one_active_run` garantiza que sólo haya un intento activo. Registrar una muerte, cerrar el TRY y evaluar un castigo ocurre dentro de una misma transacción PostgreSQL.

## Desarrollo local

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env.local` y configura:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
APP_PASSWORD=
```

También se admiten `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` para proyectos que todavía usan las claves heredadas. Sin Supabase, la aplicación abre un conjunto demo de sólo lectura.

## Base de datos

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

Las migraciones crean `players`, `runs`, `events` y `punishments`, junto con sus índices, constraints y funciones transaccionales. `supabase/seed.sql` carga los tres jugadores y una temporada de ejemplo; `supabase/reset_demo.sql` elimina únicamente esas filas reservadas.

## Seguridad

- Acceso mediante una contraseña compartida guardada sólo en el entorno del servidor.
- Cookie `httpOnly`, `Secure` en producción, `SameSite=Strict` y firma HMAC.
- Cada Server Action vuelve a validar la sesión.
- RLS activo con denegación explícita para `anon` y `authenticated`.
- Las funciones sensibles sólo pueden ejecutarse con la clave privada del servidor.
- Ningún secreto se envía al navegador ni se guarda en Git.

## Calidad

```bash
npm run lint
npm run typecheck
npm run build
# o todo junto
npm run check
```

## Despliegue

La rama `main` se publica automáticamente en Vercel. Los cambios de variables de entorno requieren un redeploy para llegar a producción. La integración de Supabase aporta las claves del proyecto y `APP_PASSWORD` controla el acceso del equipo.

# Minecraft Extremo Tracker

Panel privado y responsive para registrar una serie de Minecraft Java Hardcore entre tres amigos. Un fallecimiento termina el TRY para todos; el historial, las estadísticas, los castigos y los eventos sobreviven al mundo.

## Qué incluye

- Dashboard móvil con TRY actual, cronómetro, jugadores, récords y alertas de castigo.
- Registro de muerte atómico, victoria, cancelación e inicio automático del siguiente número de TRY.
- Historial con detalle, edición y timeline manual.
- Estadísticas derivadas y gráficos CSS livianos.
- Castigo automático cada tres TRYs fallidos todavía no agrupados.
- Overlay `/overlay` sin controles, actualizado cada 5 segundos para TV u OBS.
- Contraseña compartida con cookie `httpOnly`, `SameSite=Strict` y firma HMAC.
- RLS activo y sin acceso para `anon`/`authenticated`; las escrituras usan una clave secreta solo en servidor.
- Datos demo locales cuando Supabase todavía no está conectado.

## Requisitos e instalación

Necesitas Node.js 22+, npm, un proyecto de Supabase y, para producción, una cuenta de Vercel.

```bash
npm install
cp .env.example .env.local
```

En PowerShell usa `Copy-Item .env.example .env.local`.

## Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. Abre **SQL Editor** y ejecuta `supabase/migrations/20260921221214_initial_schema.sql` completo.
3. Opcionalmente ejecuta `supabase/seed.sql` para cargar tres jugadores, nueve TRYs, eventos y castigos de ejemplo.
4. En **Connect** copia la URL y una clave secreta. Para proyectos nuevos usa `SUPABASE_SECRET_KEY`; también se acepta la clave heredada `SUPABASE_SERVICE_ROLE_KEY`.
5. Nunca coloques una clave secreta en una variable que empiece por `NEXT_PUBLIC_`.

El esquema crea `players`, `runs`, `events` y `punishments`, constraints, índices y cuatro funciones transaccionales. RLS está activo en cada tabla. Las funciones se revocan a `PUBLIC`, `anon` y `authenticated`, y solo se conceden a `service_role`.

### Aplicar con la CLI

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
npx supabase db reset  # local; aplica migración + seed
```

## Variables de entorno

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_SERVICE_ROLE_KEY=

APP_PASSWORD=una-frase-larga-y-unica
```

La versión actual hace lecturas y mutaciones desde el servidor. El overlay usa refresco seguro cada cinco segundos, evitando abrir tablas a clientes anónimos. Las variables publicables quedan preparadas para una futura suscripción Realtime autenticada.

## Ejecutar localmente

```bash
npm run dev
```

Abre `http://localhost:3000`, ingresa `APP_PASSWORD` y prueba el panel. Sin variables de Supabase se muestran datos demo incorporados en modo solo lectura.

## Crear o editar jugadores

Los jugadores se leen de la base de datos. Puedes gestionarlos desde **Table Editor → players** o con SQL:

```sql
insert into public.players (name, nickname, avatar_url)
values ('Nombre', 'Nickname', null);
```

Para avatares remotos usa una URL HTTPS de Supabase Storage. La interfaz muestra iniciales cuando `avatar_url` es nulo.

## Datos de demostración y limpieza

- `supabase/seed.sql` carga datos idempotentes con UUIDs reservados que comienzan por `1…`, `2…`, `3…` y `4…`.
- `supabase/reset_demo.sql` elimina únicamente esas filas demo y respeta los datos reales.

Ejecuta ambos desde SQL Editor. No uses `reset_demo.sql` si reutilizaste manualmente esos UUIDs reservados.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm run build
# o todo junto
npm run check
```

## Despliegue en Vercel

1. Sube este directorio a un repositorio privado de GitHub.
2. Importa el repositorio en [Vercel](https://vercel.com/new).
3. Agrega las variables de `.env.local` en **Project Settings → Environment Variables**.
4. Despliega; Vercel detecta Next.js automáticamente.
5. Prueba `/login`, registra un TRY y confirma el cambio en Supabase.

Mantén el repositorio privado y rota `APP_PASSWORD` si alguien deja el grupo. Cambiarla invalida las cookies existentes porque su firma deja de coincidir.

## Arquitectura

- `src/app`: App Router, páginas y Server Actions.
- `src/components`: UI reutilizable, formularios y visualizaciones.
- `src/lib`: datos, Supabase de servidor, autenticación, formato y estadísticas.
- `src/types`: tipos del dominio.
- `supabase/migrations`: esquema versionado.
- `supabase/seed.sql`: demo reproducible.

Las estadísticas se calculan desde `runs`; no hay contadores duplicados. El índice parcial `one_active_run` garantiza un solo TRY activo. El cierre por muerte y la creación del castigo ocurren en la misma transacción PostgreSQL.

## Seguridad

- Cada Server Action vuelve a comprobar la cookie.
- La cookie no contiene la contraseña: contiene una firma HMAC derivada de ella.
- La clave secreta solo se importa desde un módulo `server-only`.
- RLS está activo y los roles públicos no tienen permisos de tablas ni funciones.
- Las entradas se validan con Zod y constraints de PostgreSQL.
- No hay secretos reales en Git; `.env.local` está ignorado.

## Personalización

Las etapas, causas y dimensiones están centralizadas en `src/lib/game-config.ts`. Si agregas etapas, crea también una migración que amplíe el rango permitido de `progress_stage`.

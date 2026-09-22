# Minecraft Extremo

El registro privado de nuestro Realm Hardcore: tres jugadores, una sola vida compartida y una historia nueva cada vez que el mundo vuelve a empezar.

**Producción:** [minecraft-extremo.vercel.app](https://minecraft-extremo.vercel.app)

## La regla del Realm

Si uno muere, el TRY termina para todos. La aplicación conserva lo que el mundo borra: causa, dimensión, progreso, duración, rachas, eventos y culpables. Cada tres derrotas agrupadas se desbloquea un castigo de Instagram.

## Experiencia

- Dashboard privado con el TRY activo, cronómetro y acciones críticas.
- Navegación lateral con el estado del Realm y el contador total de muertes.
- Registro de perfiles de jugadores en `/players` para arrancar cada temporada con el escuadrón correcto.
- Identidad visual obsidiana–amatista, superficies de cristal y secciones inspiradas en Overworld, Nether y The End.
- Historial completo de intentos con correcciones y bitácora de eventos.
- Estadísticas derivadas: rachas, progreso máximo, causas y dimensiones más mortales.
- Castigos automáticos cada tres derrotas aún no agrupadas.
- Overlay `/overlay` actualizado cada tres segundos para OBS o una segunda pantalla.
- Integración automática con PaperMC mediante webhooks firmados para muertes, progreso y victoria.
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
minecraft-plugin         proyecto Gradle independiente para PaperMC
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
MINECRAFT_WEBHOOK_SECRET=
```

También se admiten `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` para proyectos que todavía usan las claves heredadas. Sin Supabase, la aplicación abre un conjunto demo de sólo lectura.

## Base de datos

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

Las migraciones crean `players`, `runs`, `events` y `punishments`, junto con sus índices, constraints y funciones transaccionales. `supabase/seed.sql` carga los tres jugadores y una temporada de ejemplo; `supabase/reset_demo.sql` elimina únicamente esas filas reservadas.

La aplicación no crea cuentas personales de Supabase Auth: el acceso sigue siendo compartido y los perfiles se registran desde la sección Jugadores. La temporada de producción se puede reiniciar eliminando datos en este orden: `events`, `punishments`, `runs`, `players`.

## Integración con Minecraft

```text
PaperMC → MinecraftExtremo.jar → HTTPS /api/minecraft/* → Next.js → Supabase → dashboard y overlay
```

El plugin nunca recibe credenciales de Supabase. Sólo conoce la URL pública de la aplicación y un secreto independiente. Los endpoints disponibles son:

- `POST /api/minecraft/death`: cierra atómicamente el TRY activo como fallido, vincula al jugador por UUID o nombre/nickname, conserva el mensaje original de Minecraft y calcula su duración.
- `POST /api/minecraft/event`: avanza Nether, Blaze Rods y The End sin reducir progreso; matar al dragón completa el TRY.

Ambos exigen `Authorization: Bearer <MINECRAFT_WEBHOOK_SECRET>`. Cada evento lleva un UUID único y la base lo registra en `minecraft_webhook_events`; reenviar el mismo UUID devuelve éxito sin procesarlo por segunda vez. El dashboard y el overlay refrescan sus datos automáticamente cada tres segundos.

### Compilar el plugin

El módulo usa Paper API 1.21.11, Java 21 y Gradle Wrapper:

```bash
cd minecraft-plugin
./gradlew clean test build
```

En Windows usa `gradlew.bat`. El JAR instalable se genera en:

```text
minecraft-plugin/build/libs/MinecraftExtremo.jar
```

### Configurar el secreto

Genera una cadena aleatoria larga y configura exactamente el mismo valor en dos lugares:

1. En Vercel, variable `MINECRAFT_WEBHOOK_SECRET` para Production, Preview y Development.
2. En `plugins/MinecraftExtremo/config.yml`, propiedad `api-secret`.

No uses el prefijo `NEXT_PUBLIC_`: este secreto debe existir únicamente en el servidor Next.js y en el servidor Minecraft.

## Instalar en Exaroton

1. En Software, selecciona PaperMC y la misma versión de Minecraft que usarán los tres clientes.
2. Arranca el servidor una vez para que Paper cree su estructura y luego detenlo por completo.
3. Abre Archivos, entra en `/plugins` y sube `minecraft-plugin/build/libs/MinecraftExtremo.jar`.
4. Inicia el servidor una vez y vuelve a detenerlo para generar `plugins/MinecraftExtremo/config.yml`.
5. Edita el archivo y configura:

   ```yaml
   api-url: "https://minecraft-extremo.vercel.app"
   api-secret: "el mismo MINECRAFT_WEBHOOK_SECRET de Vercel"
   request-timeout: 5000
   ```

6. Reinicia el servidor y ejecuta `/extremo status` y después `/extremo test` como operador.
7. Comprueba que la consola confirme HTTP 200.
8. Con un TRY activo en la web, realiza una muerte de prueba y verifica que los tres jugadores pasen a spectator y que la muerte aparezca en el dashboard.

El plugin no expulsa jugadores, no apaga Paper y no elimina mundos. Después de un fallo, `/nextry confirm` sólo restablece su estado interno. Luego debes detener el servidor, cargar o regenerar el mundo desde Exaroton e iniciar el nuevo TRY desde la web. La automatización futura de mundos debe realizarse siempre con Paper detenido.

### Comandos y permisos

- `/extremo status`: muestra estado local, conexión configurada y jugadores online.
- `/extremo test`: prueba el endpoint, el secreto y la conexión del backend con Supabase.
- `/nextry`: muestra las instrucciones del siguiente intento.
- `/nextry confirm`: limpia el bloqueo persistente sin tocar el mundo.
- Permiso administrativo: `minecraftextremo.admin`, concedido a operadores por defecto.

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

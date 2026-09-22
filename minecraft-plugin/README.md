# MinecraftExtremo · plugin Paper

Plugin sin mods de cliente para Paper 1.21.x. Detecta la muerte que termina un TRY, bloquea la partida en spectator y envía muertes y progreso a la API de la aplicación.

## Compilar

Requiere JDK 21:

```bash
./gradlew clean test build
```

El artefacto instalable queda en:

```text
build/libs/MinecraftExtremo.jar
```

## Configuración

Después del primer arranque, Paper crea `plugins/MinecraftExtremo/config.yml`:

```yaml
api-url: "https://minecraft-extremo.vercel.app"
api-secret: "el-mismo-valor-configurado-en-MINECRAFT_WEBHOOK_SECRET"
request-timeout: 5000
```

Nunca publiques `config.yml` después de añadir el secreto. El plugin no imprime el secreto en consola y nunca se conecta directamente a Supabase.

## Comandos

- `/extremo status`: estado local, configuración de API y jugadores conectados.
- `/extremo test`: comprueba API, secreto y acceso del backend a Supabase.
- `/nextry`: muestra el estado y la instrucción de confirmación.
- `/nextry confirm`: limpia el bloqueo local; no borra mundos ni cambia archivos.

Los comandos requieren operador o `minecraftextremo.admin`.

## Próximo mundo

Al terminar un TRY, todos quedan en spectator y el estado se guarda en `state.yml`. Para continuar:

1. Ejecuta `/nextry confirm`.
2. Detén Paper.
3. Carga o regenera el mundo desde Exaroton.
4. Inicia el siguiente TRY desde la web.
5. Arranca el servidor.

La eliminación o rotación automática de mundos queda deliberadamente fuera de esta versión. Nunca debe implementarse borrando carpetas mientras Paper está ejecutándose.

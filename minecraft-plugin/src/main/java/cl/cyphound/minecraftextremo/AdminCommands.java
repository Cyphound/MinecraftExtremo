package cl.cyphound.minecraftextremo;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public final class AdminCommands implements CommandExecutor, TabCompleter {
    private final MinecraftExtremoPlugin plugin;

    public AdminCommands(MinecraftExtremoPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!sender.hasPermission("minecraftextremo.admin")) {
            sender.sendMessage(Component.text("No tienes permiso.", NamedTextColor.RED));
            return true;
        }
        if (command.getName().equalsIgnoreCase("nextry")) return nextTry(sender, args);
        return extremo(sender, args);
    }

    private boolean nextTry(CommandSender sender, String[] args) {
        if (args.length == 1 && args[0].equalsIgnoreCase("confirm")) {
            plugin.state().reset();
            sender.sendMessage(Component.text("Estado local reiniciado.", NamedTextColor.GREEN));
            sender.sendMessage(Component.text("Ahora detén el servidor y carga o regenera el nuevo mundo desde Exaroton.", NamedTextColor.YELLOW));
            sender.sendMessage(Component.text("Después inicia el siguiente TRY desde la web. El plugin no borró ningún archivo.", NamedTextColor.GRAY));
            return true;
        }
        sender.sendMessage(Component.text("Estado local: " + plugin.state().current(), NamedTextColor.LIGHT_PURPLE));
        sender.sendMessage(Component.text("Para preparar el siguiente intento ejecuta:", NamedTextColor.WHITE));
        sender.sendMessage(Component.text("/nextry confirm", NamedTextColor.AQUA));
        return true;
    }

    private boolean extremo(CommandSender sender, String[] args) {
        if (args.length != 1) {
            sender.sendMessage(Component.text("Uso: /extremo <status|test>", NamedTextColor.YELLOW));
            return true;
        }
        if (args[0].equalsIgnoreCase("status")) {
            String players = plugin.getServer().getOnlinePlayers().stream()
                .map(player -> player.getName())
                .sorted()
                .collect(Collectors.joining(", "));
            sender.sendMessage(Component.text("Minecraft Extremo", NamedTextColor.LIGHT_PURPLE));
            sender.sendMessage(Component.text("Estado: " + plugin.state().current(), NamedTextColor.WHITE));
            sender.sendMessage(Component.text("API configurada: " + (plugin.api().isConfigured() ? "sí" : "no"), NamedTextColor.WHITE));
            sender.sendMessage(Component.text("Jugadores conectados: " + plugin.getServer().getOnlinePlayers().size() + (players.isBlank() ? "" : " · " + players), NamedTextColor.WHITE));
            return true;
        }
        if (args[0].equalsIgnoreCase("test")) {
            String json = JsonPayloads.event(UUID.randomUUID(), sender.getName(), ProgressType.CONNECTION_TEST, Instant.now());
            sender.sendMessage(Component.text("Enviando prueba al backend…", NamedTextColor.YELLOW));
            plugin.api().sendEvent(json).thenAccept(result -> plugin.getServer().getScheduler().runTask(plugin, () -> {
                if (result.success()) sender.sendMessage(Component.text("Conexión correcta con la API y Supabase.", NamedTextColor.GREEN));
                else sender.sendMessage(Component.text("La prueba falló (HTTP " + result.statusCode() + "). Revisa la consola.", NamedTextColor.RED));
                plugin.logApiResult("prueba", result);
            }));
            return true;
        }
        sender.sendMessage(Component.text("Uso: /extremo <status|test>", NamedTextColor.YELLOW));
        return true;
    }

    @Override
    public @Nullable List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command, @NotNull String alias, @NotNull String[] args) {
        if (args.length != 1) return List.of();
        if (command.getName().equalsIgnoreCase("nextry")) return List.of("confirm");
        return List.of("status", "test");
    }
}

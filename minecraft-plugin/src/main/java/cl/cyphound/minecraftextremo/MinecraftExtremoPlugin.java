package cl.cyphound.minecraftextremo;

import java.time.Duration;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.title.Title;
import org.bukkit.GameMode;
import org.bukkit.Sound;
import org.bukkit.command.PluginCommand;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public final class MinecraftExtremoPlugin extends JavaPlugin {
    private PluginState state;
    private ApiClient api;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        state = new PluginState(this);
        api = new ApiClient(
            getConfig().getString("api-url", ""),
            getConfig().getString("api-secret", ""),
            getConfig().getInt("request-timeout", 5000)
        );

        getServer().getPluginManager().registerEvents(new GameListener(this), this);
        AdminCommands commands = new AdminCommands(this);
        registerCommand("nextry", commands);
        registerCommand("extremo", commands);

        getLogger().info("MinecraftExtremo 1.0.0 activo. Estado local: " + state.current());
        if (!api.isConfigured()) getLogger().warning("API no configurada. Edita plugins/MinecraftExtremo/config.yml y reinicia el servidor.");
    }

    private void registerCommand(String name, AdminCommands executor) {
        PluginCommand command = getCommand(name);
        if (command == null) throw new IllegalStateException("Falta el comando /" + name + " en plugin.yml");
        command.setExecutor(executor);
        command.setTabCompleter(executor);
    }

    public PluginState state() {
        return state;
    }

    public ApiClient api() {
        return api;
    }

    public void failTry(String deadPlayer, Component deathMessage) {
        Component chat = Component.text("TRY FALLIDO · ", NamedTextColor.LIGHT_PURPLE).append(deathMessage.color(NamedTextColor.WHITE));
        getServer().broadcast(chat);
        for (Player player : getServer().getOnlinePlayers()) lockPlayer(player, deadPlayer);
        getServer().getScheduler().runTask(this, () -> {
            for (Player player : getServer().getOnlinePlayers()) lockPlayer(player, deadPlayer);
        });
    }

    public void lockPlayer(Player player) {
        lockPlayer(player, null);
    }

    private void lockPlayer(Player player, String deadPlayer) {
        player.setGameMode(GameMode.SPECTATOR);
        String subtitle = deadPlayer == null ? "El intento ya terminó" : deadPlayer + " murió";
        player.showTitle(Title.title(
            Component.text("☠ TRY FALLIDO ☠", NamedTextColor.LIGHT_PURPLE),
            Component.text(subtitle, NamedTextColor.WHITE),
            Title.Times.times(Duration.ofMillis(500), Duration.ofSeconds(5), Duration.ofSeconds(1))
        ));
        player.playSound(player.getLocation(), Sound.ENTITY_WITHER_SPAWN, 0.8f, 0.85f);
    }

    public void logApiResult(String event, ApiClient.Result result) {
        if (result.success()) {
            getLogger().info("Evento " + event + " confirmado por la API (HTTP " + result.statusCode() + ").");
        } else {
            String detail = result.body() == null ? "sin detalle" : result.body();
            if (detail.length() > 240) detail = detail.substring(0, 240) + "…";
            getLogger().warning("No se pudo enviar " + event + " (HTTP " + result.statusCode() + "): " + detail);
        }
    }
}

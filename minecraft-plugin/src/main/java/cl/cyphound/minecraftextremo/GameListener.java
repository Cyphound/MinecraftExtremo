package cl.cyphound.minecraftextremo;

import java.time.Instant;
import java.util.UUID;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.title.Title;
import org.bukkit.GameMode;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.World;
import org.bukkit.entity.EnderDragon;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDeathEvent;
import org.bukkit.event.entity.EntityPickupItemEvent;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerGameModeChangeEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerRespawnEvent;

public final class GameListener implements Listener {
    private final MinecraftExtremoPlugin plugin;

    public GameListener(MinecraftExtremoPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR)
    @SuppressWarnings("deprecation") // Bukkit conserva aquí el mensaje localizado exactamente como aparece en el chat.
    public void onDeath(PlayerDeathEvent event) {
        if (!plugin.state().beginFailure()) return;

        Player dead = event.getEntity();
        Component original = event.deathMessage();
        String deathMessage = event.getDeathMessage();
        if (deathMessage == null || deathMessage.isBlank()) deathMessage = dead.getName() + " murió";
        String json = JsonPayloads.death(
            UUID.randomUUID(),
            dead.getName(),
            dead.getUniqueId(),
            DeathCauseMapper.from(dead),
            dimension(dead.getWorld()),
            deathMessage,
            Instant.now()
        );

        plugin.failTry(dead.getName(), original == null ? Component.text(deathMessage) : original);
        plugin.api().sendDeath(json).thenAccept(result -> plugin.logApiResult("muerte", result));
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onWorldChanged(PlayerChangedWorldEvent event) {
        World.Environment environment = event.getPlayer().getWorld().getEnvironment();
        if (environment == World.Environment.NETHER) sendProgress(event.getPlayer(), ProgressType.NETHER_ENTERED);
        if (environment == World.Environment.THE_END) sendProgress(event.getPlayer(), ProgressType.END_ENTERED);
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onItemPickup(EntityPickupItemEvent event) {
        if (event.getEntity() instanceof Player player && event.getItem().getItemStack().getType() == Material.BLAZE_ROD) {
            sendProgress(player, ProgressType.BLAZE_ROD_OBTAINED);
        }
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onEntityDeath(EntityDeathEvent event) {
        if (!(event.getEntity() instanceof EnderDragon)) return;
        if (!plugin.state().complete()) return;

        String playerName = event.getEntity().getKiller() == null ? "Servidor" : event.getEntity().getKiller().getName();
        sendEvent(playerName, ProgressType.ENDER_DRAGON_KILLED);
        Title title = Title.title(
            Component.text("🏆 EXTREMO COMPLETADO 🏆", NamedTextColor.GOLD),
            Component.text("El Ender Dragon fue derrotado", NamedTextColor.WHITE)
        );
        for (Player player : plugin.getServer().getOnlinePlayers()) {
            player.showTitle(title);
            player.playSound(player.getLocation(), Sound.UI_TOAST_CHALLENGE_COMPLETE, 1.0f, 1.0f);
        }
        plugin.getServer().broadcast(Component.text("El TRY fue completado. El mundo no será borrado automáticamente.", NamedTextColor.GOLD));
    }

    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onGameModeChange(PlayerGameModeChangeEvent event) {
        if (plugin.state().current() == TryState.FAILED && event.getNewGameMode() != GameMode.SPECTATOR) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(Component.text("El TRY terminó. Usa /nextry confirm antes de preparar otro mundo.", NamedTextColor.LIGHT_PURPLE));
        }
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        if (plugin.state().current() == TryState.FAILED) plugin.lockPlayer(event.getPlayer());
    }

    @EventHandler
    public void onRespawn(PlayerRespawnEvent event) {
        if (plugin.state().current() == TryState.FAILED) {
            plugin.getServer().getScheduler().runTask(plugin, () -> plugin.lockPlayer(event.getPlayer()));
        }
    }

    private void sendProgress(Player player, ProgressType type) {
        if (!plugin.state().markProgress(type)) return;
        sendEvent(player.getName(), type);
    }

    private void sendEvent(String playerName, ProgressType type) {
        String json = JsonPayloads.event(UUID.randomUUID(), playerName, type, Instant.now());
        plugin.api().sendEvent(json).thenAccept(result -> plugin.logApiResult(type.name(), result));
    }

    private String dimension(World world) {
        return switch (world.getEnvironment()) {
            case NETHER -> "NETHER";
            case THE_END -> "THE_END";
            default -> "OVERWORLD";
        };
    }
}

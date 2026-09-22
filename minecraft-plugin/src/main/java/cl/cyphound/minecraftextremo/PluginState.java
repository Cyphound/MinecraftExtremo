package cl.cyphound.minecraftextremo;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import org.bukkit.configuration.file.YamlConfiguration;

public final class PluginState {
    private final MinecraftExtremoPlugin plugin;
    private final File file;
    private final YamlConfiguration data;
    private TryState tryState;
    private final Set<String> sentProgress;

    public PluginState(MinecraftExtremoPlugin plugin) {
        this.plugin = plugin;
        this.file = new File(plugin.getDataFolder(), "state.yml");
        this.data = YamlConfiguration.loadConfiguration(file);
        this.tryState = parseState(data.getString("state", TryState.ACTIVE.name()));
        this.sentProgress = new HashSet<>(data.getStringList("sent-progress"));
        save();
    }

    private TryState parseState(String value) {
        try {
            return TryState.valueOf(value);
        } catch (IllegalArgumentException ignored) {
            return TryState.ACTIVE;
        }
    }

    public TryState current() {
        return tryState;
    }

    public boolean beginFailure() {
        if (tryState != TryState.ACTIVE) return false;
        tryState = TryState.FAILED;
        save();
        return true;
    }

    public boolean complete() {
        if (tryState != TryState.ACTIVE) return false;
        tryState = TryState.COMPLETED;
        save();
        return true;
    }

    public boolean markProgress(ProgressType type) {
        if (tryState != TryState.ACTIVE || !sentProgress.add(type.name())) return false;
        save();
        return true;
    }

    public void reset() {
        tryState = TryState.ACTIVE;
        sentProgress.clear();
        save();
    }

    private void save() {
        data.set("state", tryState.name());
        data.set("sent-progress", sentProgress.stream().sorted().toList());
        try {
            data.save(file);
        } catch (IOException error) {
            plugin.getLogger().severe("No se pudo guardar state.yml: " + error.getMessage());
        }
    }
}

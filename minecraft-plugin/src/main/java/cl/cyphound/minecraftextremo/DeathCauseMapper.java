package cl.cyphound.minecraftextremo;

import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;
import org.bukkit.entity.Projectile;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.projectiles.ProjectileSource;

public final class DeathCauseMapper {
    private DeathCauseMapper() {}

    public static String from(Player player) {
        EntityDamageEvent damage = player.getLastDamageCause();
        if (damage == null) return "OTHER";

        if (damage instanceof EntityDamageByEntityEvent entityDamage) {
            Entity damager = entityDamage.getDamager();
            if (damager instanceof Projectile projectile) {
                ProjectileSource shooter = projectile.getShooter();
                if (shooter instanceof Entity shooterEntity) damager = shooterEntity;
            }
            String mapped = mapEntity(damager);
            if (!mapped.equals("OTHER")) return mapped;
        }

        return switch (damage.getCause()) {
            case LAVA -> "LAVA";
            case FALL, FLY_INTO_WALL -> "FALL";
            case DROWNING -> "DROWNING";
            case FIRE, FIRE_TICK, HOT_FLOOR, CAMPFIRE -> "FIRE";
            case BLOCK_EXPLOSION, ENTITY_EXPLOSION -> "EXPLOSION";
            case VOID -> "VOID";
            case SUFFOCATION, CRAMMING -> "SUFFOCATION";
            default -> "OTHER";
        };
    }

    private static String mapEntity(Entity entity) {
        return switch (entity.getType()) {
            case SKELETON, STRAY, BOGGED -> "SKELETON";
            case CREEPER -> "CREEPER";
            case ZOMBIE, HUSK, DROWNED, ZOMBIE_VILLAGER -> "ZOMBIE";
            case SPIDER, CAVE_SPIDER -> "SPIDER";
            case ENDERMAN -> "ENDERMAN";
            case BLAZE -> "BLAZE";
            case GHAST -> "GHAST";
            case PIGLIN, PIGLIN_BRUTE, ZOMBIFIED_PIGLIN -> "PIGLIN";
            case HOGLIN, ZOGLIN -> "HOGLIN";
            case WITHER_SKELETON -> "WITHER_SKELETON";
            case ENDER_DRAGON -> "ENDER_DRAGON";
            case END_CRYSTAL -> "END_CRYSTAL";
            case PLAYER -> "PLAYER";
            default -> "OTHER";
        };
    }
}

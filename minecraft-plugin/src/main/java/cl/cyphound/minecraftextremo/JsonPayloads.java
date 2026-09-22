package cl.cyphound.minecraftextremo;

import java.time.Instant;
import java.util.UUID;

public final class JsonPayloads {
    private JsonPayloads() {}

    public static String death(
        UUID eventId,
        String player,
        UUID minecraftUuid,
        String cause,
        String dimension,
        String deathMessage,
        Instant timestamp
    ) {
        return "{" +
            field("eventId", eventId.toString()) + "," +
            field("player", player) + "," +
            field("uuid", minecraftUuid.toString()) + "," +
            field("cause", cause) + "," +
            field("dimension", dimension) + "," +
            field("deathMessage", deathMessage) + "," +
            field("timestamp", timestamp.toString()) +
            "}";
    }

    public static String event(UUID eventId, String player, ProgressType type, Instant timestamp) {
        return "{" +
            field("eventId", eventId.toString()) + "," +
            field("player", player) + "," +
            field("type", type.name()) + "," +
            field("timestamp", timestamp.toString()) +
            "}";
    }

    static String field(String key, String value) {
        return quote(key) + ":" + quote(value);
    }

    static String quote(String value) {
        StringBuilder escaped = new StringBuilder(value.length() + 8);
        escaped.append('"');
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            switch (character) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> {
                    if (character < 0x20) escaped.append(String.format("\\u%04x", (int) character));
                    else escaped.append(character);
                }
            }
        }
        return escaped.append('"').toString();
    }
}

package cl.cyphound.minecraftextremo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JsonPayloadsTest {
    @Test
    void escapesMinecraftMessagesAsValidJsonText() {
        assertEquals("\"linea \\\"uno\\\"\\n\\\\dos\"", JsonPayloads.quote("linea \"uno\"\n\\dos"));
    }

    @Test
    void keepsTheSameEventIdInThePayload() {
        UUID eventId = UUID.fromString("d778c452-881f-4cbf-bff1-adc92882cd70");
        String payload = JsonPayloads.event(eventId, "Cyphound", ProgressType.NETHER_ENTERED, Instant.parse("2026-09-22T03:00:00Z"));
        assertTrue(payload.contains(eventId.toString()));
        assertTrue(payload.contains("NETHER_ENTERED"));
    }
}

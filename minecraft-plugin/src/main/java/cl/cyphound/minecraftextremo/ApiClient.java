package cl.cyphound.minecraftextremo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public final class ApiClient {
    public record Result(boolean success, int statusCode, String body) {}

    private static final int MAX_ATTEMPTS = 3;
    private final String baseUrl;
    private final String secret;
    private final Duration timeout;
    private final HttpClient client;

    public ApiClient(String baseUrl, String secret, int timeoutMillis) {
        this.baseUrl = stripTrailingSlash(baseUrl == null ? "" : baseUrl.trim());
        this.secret = secret == null ? "" : secret.trim();
        this.timeout = Duration.ofMillis(Math.max(1000, timeoutMillis));
        this.client = HttpClient.newBuilder().connectTimeout(timeout).build();
    }

    public boolean isConfigured() {
        return (baseUrl.startsWith("https://") || baseUrl.startsWith("http://localhost"))
            && !baseUrl.contains("MI-DOMINIO")
            && !secret.isBlank();
    }

    public CompletableFuture<Result> sendDeath(String json) {
        return post("/api/minecraft/death", json);
    }

    public CompletableFuture<Result> sendEvent(String json) {
        return post("/api/minecraft/event", json);
    }

    private CompletableFuture<Result> post(String path, String json) {
        if (!isConfigured()) {
            return CompletableFuture.completedFuture(new Result(false, 0, "API no configurada"));
        }
        CompletableFuture<Result> result = new CompletableFuture<>();
        sendAttempt(path, json, 1, result);
        return result;
    }

    private void sendAttempt(String path, String json, int attempt, CompletableFuture<Result> result) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path))
            .timeout(timeout)
            .header("Authorization", "Bearer " + secret)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .whenComplete((response, error) -> {
                boolean retryable = error != null || response.statusCode() >= 500;
                if (retryable && attempt < MAX_ATTEMPTS) {
                    long delay = 1L << (attempt - 1);
                    CompletableFuture.delayedExecutor(delay, TimeUnit.SECONDS)
                        .execute(() -> sendAttempt(path, json, attempt + 1, result));
                    return;
                }
                if (error != null) {
                    result.complete(new Result(false, 0, error.getMessage()));
                    return;
                }
                result.complete(new Result(
                    response.statusCode() >= 200 && response.statusCode() < 300,
                    response.statusCode(),
                    response.body()
                ));
            });
    }

    private static String stripTrailingSlash(String value) {
        while (value.endsWith("/")) value = value.substring(0, value.length() - 1);
        return value;
    }
}

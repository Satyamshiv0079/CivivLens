package com.civiclens.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class AiRateLimiter {

    // Maximum allowed AI requests per client IP within a 1-minute window
    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final long WINDOW_MILLIS = 60_000L;

    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<Long>> requestLog = new ConcurrentHashMap<>();

    public void checkRateLimit(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = "anonymous";
        }

        long now = System.currentTimeMillis();
        long windowStart = now - WINDOW_MILLIS;

        ConcurrentLinkedQueue<Long> timestamps = requestLog.computeIfAbsent(clientIp, k -> new ConcurrentLinkedQueue<>());

        // Evict expired timestamps
        while (!timestamps.isEmpty() && timestamps.peek() < windowStart) {
            timestamps.poll();
        }

        if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many requests to AI endpoints. Please wait before submitting again."
            );
        }

        timestamps.add(now);

        // Clean up map entries when size grows
        if (requestLog.size() > 5000) {
            requestLog.entrySet().removeIf(entry -> entry.getValue().isEmpty() || entry.getValue().peek() < windowStart);
        }
    }
}

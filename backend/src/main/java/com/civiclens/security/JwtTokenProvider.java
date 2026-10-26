package com.civiclens.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    private static final int MIN_KEY_BYTES = 32; // 256 bits

    private final SecretKey key;
    private final long expirationMs;

    @Autowired
    public JwtTokenProvider(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            Environment environment
    ) {
        this.expirationMs = expirationMs;

        boolean isBlank = secret == null || secret.trim().isEmpty();
        boolean isDevOrTest = environment != null && Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("h2") || p.equalsIgnoreCase("local") || p.equalsIgnoreCase("test"));

        if (isBlank) {
            if (isDevOrTest) {
                log.warn("================================================================================");
                log.warn("SECURITY NOTICE: app.jwt.secret is empty. Generating an ephemeral in-memory");
                log.warn("cryptographic key for development/test. Tokens will not persist across restarts.");
                log.warn("================================================================================");
                this.key = Jwts.SIG.HS256.key().build();
                return;
            }
            throw new IllegalStateException("JWT signing secret is missing. Set the JWT_SECRET environment variable with a secure key (at least 256 bits / 32 bytes).");
        }

        String trimmedSecret = secret.trim();

        if (trimmedSecret.toUpperCase().contains("PLACEHOLDER") || trimmedSecret.toUpperCase().contains("YOUR_SECURE")) {
            throw new IllegalStateException("JWT signing secret must not use the example placeholder value.");
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(trimmedSecret);
        } catch (Exception e) {
            // Fallback to raw UTF-8 bytes if not Base64 encoded
            keyBytes = trimmedSecret.getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < MIN_KEY_BYTES) {
            throw new IllegalStateException("JWT signing secret is too short: requires at least 256 bits (" + MIN_KEY_BYTES + " bytes), but got " + keyBytes.length + " bytes.");
        }

        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // Constructor for testing
    public JwtTokenProvider(String secret, long expirationMs) {
        this(secret, expirationMs, null);
    }

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

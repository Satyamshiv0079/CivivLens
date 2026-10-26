package com.civiclens;

import com.civiclens.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String VALID_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Test
    void validSecret_GeneratesAndValidatesToken() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, 3600000);

        String token = provider.generateToken("user@example.com", "CITIZEN");
        assertNotNull(token);
        assertTrue(provider.validateToken(token));
        assertEquals("user@example.com", provider.getEmailFromToken(token));
    }

    @Test
    void missingSecretInProduction_ThrowsIllegalStateException() {
        // Production environment (no dev/test active profile)
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> new JwtTokenProvider("", 3600000, prodEnv)
        );
        assertTrue(exception.getMessage().contains("JWT signing secret is missing"));
    }

    @Test
    void nullSecretInProduction_ThrowsIllegalStateException() {
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> new JwtTokenProvider(null, 3600000)
        );
        assertTrue(exception.getMessage().contains("JWT signing secret is missing"));
    }

    @Test
    void secretTooShort_ThrowsIllegalStateException() {
        // Less than 32 bytes / 256 bits
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> new JwtTokenProvider("short-secret-key-too-small", 3600000)
        );
        assertTrue(exception.getMessage().contains("too short"));
    }

    @Test
    void placeholderSecret_ThrowsIllegalStateException() {
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> new JwtTokenProvider("YOUR_SECURE_RANDOMLY_GENERATED_BASE64_SECRET_MIN_256_BITS", 3600000)
        );
        assertTrue(exception.getMessage().contains("placeholder"));
    }

    @Test
    void blankSecretInDevProfile_GeneratesEphemeralKey() {
        MockEnvironment devEnv = new MockEnvironment();
        devEnv.setActiveProfiles("dev");

        JwtTokenProvider devProvider = new JwtTokenProvider("", 3600000, devEnv);
        String token = devProvider.generateToken("dev@example.com", "CITIZEN");

        assertNotNull(token);
        assertTrue(devProvider.validateToken(token));
        assertEquals("dev@example.com", devProvider.getEmailFromToken(token));
    }
}

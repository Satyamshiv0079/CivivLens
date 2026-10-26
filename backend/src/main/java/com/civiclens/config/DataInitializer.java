package com.civiclens.config;

import com.civiclens.entity.Role;
import com.civiclens.entity.User;
import com.civiclens.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final boolean seedDemoData;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Environment environment,
            @Value("${app.seed-demo-data:false}") boolean seedDemoData
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
        this.seedDemoData = seedDemoData;
    }

    @Override
    public void run(String... args) {
        boolean isDevProfile = environment != null && Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("h2") || p.equalsIgnoreCase("demo") || p.equalsIgnoreCase("local"));

        if (!seedDemoData && !isDevProfile) {
            log.info("Production mode: skipping demo account initialization. No default credentials created.");
            return;
        }

        log.info("Development/demo environment detected: initializing default demo accounts...");
        seedUserIfNotExists("Admin User", "admin@civiclens.gov", "Admin123!", Role.ADMIN);
        seedUserIfNotExists("City Moderator", "moderator@civiclens.gov", "Moderator123!", Role.MODERATOR);
        seedUserIfNotExists("Jane Citizen", "citizen@civiclens.gov", "Citizen123!", Role.CITIZEN);
    }

    private void seedUserIfNotExists(String name, String email, String password, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User(name, email, passwordEncoder.encode(password), role);
            userRepository.save(user);
            log.info("Initialized default {} user: {}", role, email);
        }
    }
}

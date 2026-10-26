package com.civiclens.config;

import com.civiclens.entity.Role;
import com.civiclens.entity.User;
import com.civiclens.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
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

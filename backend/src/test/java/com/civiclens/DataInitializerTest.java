package com.civiclens;

import com.civiclens.config.DataInitializer;
import com.civiclens.entity.User;
import com.civiclens.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void run_InProductionEnvironment_DoesNotSeedDemoAccounts() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        DataInitializer initializer = new DataInitializer(userRepository, passwordEncoder, prodEnv, false);
        initializer.run();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void run_InDevEnvironment_SeedsDemoAccounts() {
        MockEnvironment devEnv = new MockEnvironment();
        devEnv.setActiveProfiles("dev");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        DataInitializer initializer = new DataInitializer(userRepository, passwordEncoder, devEnv, false);
        initializer.run();

        // Should seed 3 demo accounts (Admin, Moderator, Citizen)
        verify(userRepository, times(3)).save(any(User.class));
    }

    @Test
    void run_WithSeedDemoDataPropertyTrue_SeedsDemoAccountsEvenInProd() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        DataInitializer initializer = new DataInitializer(userRepository, passwordEncoder, prodEnv, true);
        initializer.run();

        verify(userRepository, times(3)).save(any(User.class));
    }
}

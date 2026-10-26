package com.civiclens;

import com.civiclens.dto.AuthResponse;
import com.civiclens.dto.LoginRequest;
import com.civiclens.dto.RegisterRequest;
import com.civiclens.entity.Role;
import com.civiclens.entity.User;
import com.civiclens.repository.UserRepository;
import com.civiclens.security.JwtTokenProvider;
import com.civiclens.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("John Citizen", "john@example.com", "encodedPassword", Role.CITIZEN);
        sampleUser.setId(1L);
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest("John Citizen", "john@example.com", "Secret123!");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateToken("john@example.com", "CITIZEN")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("john@example.com", response.getUser().getEmail());
        assertEquals(Role.CITIZEN, response.getUser().getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_AlwaysAssignsCitizenRole() {
        RegisterRequest request = new RegisterRequest("New Registrant", "citizen@example.com", "Secret123!");

        when(userRepository.existsByEmail("citizen@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenProvider.generateToken(eq("citizen@example.com"), eq("CITIZEN"))).thenReturn("mock-citizen-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(Role.CITIZEN, response.getUser().getRole(), "Public registration must always assign CITIZEN role");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals(Role.CITIZEN, userCaptor.getValue().getRole());
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("Duplicate User", "john@example.com", "Secret123!");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest("john@example.com", "Secret123!");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateToken("john@example.com", "CITIZEN")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("john@example.com", response.getUser().getEmail());
    }

    @Test
    void login_InvalidCredentials_ThrowsException() {
        LoginRequest request = new LoginRequest("john@example.com", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}

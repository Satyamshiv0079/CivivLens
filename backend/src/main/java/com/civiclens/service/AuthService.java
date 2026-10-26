package com.civiclens.service;

import com.civiclens.dto.AuthResponse;
import com.civiclens.dto.LoginRequest;
import com.civiclens.dto.RegisterRequest;
import com.civiclens.dto.UserDto;
import com.civiclens.entity.Role;
import com.civiclens.entity.User;
import com.civiclens.repository.UserRepository;
import com.civiclens.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CITIZEN;

        User user = new User(
                request.getName().trim(),
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                role
        );

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(token, UserDto.fromEntity(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, UserDto.fromEntity(user));
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return UserDto.fromEntity(user);
    }
}

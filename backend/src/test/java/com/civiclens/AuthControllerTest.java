package com.civiclens;

import com.civiclens.dto.AuthResponse;
import com.civiclens.dto.UserDto;
import com.civiclens.entity.Role;
import com.civiclens.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void registerEndpoint_ValidPayload_Returns201() throws Exception {
        UserDto userDto = new UserDto(1L, "Alice Citizen", "alice@example.com", Role.CITIZEN, Instant.now());
        AuthResponse authResponse = new AuthResponse("sample-jwt-token", userDto);

        when(authService.register(any())).thenReturn(authResponse);

        String jsonPayload = """
                {
                    "name": "Alice Citizen",
                    "email": "alice@example.com",
                    "password": "Password123!",
                    "role": "CITIZEN"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("sample-jwt-token"))
                .andExpect(jsonPath("$.user.email").value("alice@example.com"));
    }

    @Test
    void registerEndpoint_InvalidEmail_Returns400() throws Exception {
        String invalidPayload = """
                {
                    "name": "Alice Citizen",
                    "email": "not-an-email",
                    "password": "Password123!"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }
}

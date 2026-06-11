package com.tuempresa.proyecto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuempresa.proyecto.dto.AuthResponse;
import com.tuempresa.proyecto.dto.LoginRequest;
import com.tuempresa.proyecto.entity.User;
import com.tuempresa.proyecto.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private String generatedUsername;

    @AfterEach
    void tearDown() {
        if (generatedUsername != null) {
            Optional<User> userOpt = userRepository.findByUsername(generatedUsername);
            userOpt.ifPresent(user -> userRepository.delete(user));
        }
    }

    @Test
    void registerAndLogin_IntegrationFlow_Success() throws Exception {
        // Arrange
        generatedUsername = "integration_test_" + System.currentTimeMillis();
        LoginRequest registerRequest = new LoginRequest();
        registerRequest.setUsername(generatedUsername);
        registerRequest.setPassword("securePassword123");

        // 1. Act & Assert: Register a new user
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String registerResponseContent = registerResult.getResponse().getContentAsString();
        AuthResponse registerResponse = objectMapper.readValue(registerResponseContent, AuthResponse.class);
        assertNotNull(registerResponse.getToken());

        // Verify the user is indeed saved in the database
        Optional<User> savedUserOpt = userRepository.findByUsername(generatedUsername);
        assertTrue(savedUserOpt.isPresent());

        // 2. Act & Assert: Login with the registered credentials
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(generatedUsername);
        loginRequest.setPassword("securePassword123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String loginResponseContent = loginResult.getResponse().getContentAsString();
        AuthResponse loginResponse = objectMapper.readValue(loginResponseContent, AuthResponse.class);
        assertNotNull(loginResponse.getToken());
    }
}

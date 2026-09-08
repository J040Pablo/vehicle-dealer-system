package com.dealership.api.security;

import com.dealership.api.config.CorsProperties;
import com.dealership.api.user.Role;
import com.dealership.api.user.dto.LoginRequestDTO;
import com.dealership.api.user.dto.OAuth2LinkRequestDTO;
import com.dealership.api.user.dto.RegisterRequestDTO;
import com.dealership.api.user.dto.TokenResponseDTO;
import com.dealership.api.user.dto.UserResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;

@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, UserDetailsServiceAutoConfiguration.class, OAuth2ClientAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CorsProperties corsProperties;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @MockBean
    private com.dealership.api.security.ratelimit.RateLimitService rateLimitService;

    @Test
    @DisplayName("POST /auth/login deve autenticar e retornar 200 OK com token")
    void login_ReturnsToken() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("admin", "admin123");
        TokenResponseDTO response = new TokenResponseDTO("mocked_jwt_token");

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked_jwt_token"));
    }

    @Test
    @DisplayName("POST /auth/register deve cadastrar usuário com e-mail e retornar 201 Created")
    void register_ReturnsCreatedUser() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO("newuser", "newuser@example.com", "password123");
        UserResponseDTO response = new UserResponseDTO(1L, "newuser", "newuser@example.com", Role.USER);

        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /auth/oauth2/exchange deve realizar a troca de código e retornar JWT")
    void exchangeOAuth2Code_ReturnsToken() throws Exception {
        com.dealership.api.user.dto.OAuth2CodeExchangeRequestDTO request = new com.dealership.api.user.dto.OAuth2CodeExchangeRequestDTO("valid_code");
        TokenResponseDTO response = new TokenResponseDTO("exchanged_jwt_token");

        when(authService.exchangeOAuth2Code(any(com.dealership.api.user.dto.OAuth2CodeExchangeRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/auth/oauth2/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("exchanged_jwt_token"));
    }

    @Test
    @DisplayName("POST /auth/oauth2/link deve vincular conta Google para usuário autenticado")
    void linkAccount_ReturnsLinkedUser() throws Exception {
        OAuth2LinkRequestDTO request = new OAuth2LinkRequestDTO("google_sub_12345", "user@example.com");
        UserResponseDTO response = new UserResponseDTO(1L, "testuser", "user@example.com", Role.USER);

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "testuser", null, java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"))
                );

        when(authService.linkOAuth2Account(eq("testuser"), any(OAuth2LinkRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/auth/oauth2/link")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }
}

package com.dealership.api.security;

import com.dealership.api.dealer.DealerService;
import com.dealership.api.vehicle.VehicleService;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dealership.api.security.ratelimit.RateLimitService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RateLimitService rateLimitService;

    @MockBean
    private VehicleService vehicleService;

    @MockBean
    private DealerService dealerService;

    @BeforeEach
    void setUp() {
        rateLimitService.reset();

        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@dealership.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }

    @Test
    @DisplayName("Requisição sem token em endpoint protegido deve retornar 401 Unauthorized em formato ProblemDetail")
    void unauthenticatedRequest_Returns401ProblemDetail() throws Exception {
        mockMvc.perform(get("/vehicles"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Não Autenticado"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").exists());
    }

    @Test
    @DisplayName("Endpoint público /actuator/health deve ser acessível sem token")
    void publicEndpoint_Health_ReturnsOk() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Login com credenciais válidas do admin deve retornar 200 OK e token JWT")
    void login_ValidCredentials_Returns200AndToken() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Login com e-mail válido do admin deve retornar 200 OK e token JWT")
    void login_ValidEmailCredentials_Returns200AndToken() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin@dealership.com\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Login com senha incorreta deve retornar 401 Unauthorized em formato ProblemDetail (nunca 500)")
    void login_InvalidPassword_Returns401ProblemDetail() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"wrongpassword\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Credenciais inválidas"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value("Usuário ou senha incorretos."));
    }

    @Test
    @DisplayName("Login com usuário inexistente deve retornar 401 Unauthorized em formato ProblemDetail (nunca 500)")
    void login_NonExistentUser_Returns401ProblemDetail() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"nonexistent\",\"password\":\"admin123\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Credenciais inválidas"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.detail").value("Usuário ou senha incorretos."));
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    @DisplayName("Usuário com Role USER tentando deletar concessionária deve receber 403 Forbidden")
    void deleteDealer_UserRole_Returns403Forbidden() throws Exception {
        mockMvc.perform(delete("/dealer/1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Acesso Negado"))
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("Usuário com Role ADMIN tentando deletar concessionária deve ter acesso permitido")
    void deleteDealer_AdminRole_Allowed() throws Exception {
        mockMvc.perform(delete("/dealer/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    @DisplayName("Usuário com Role USER tentando deletar veículo deve receber 403 Forbidden")
    void deleteVehicle_UserRole_Returns403Forbidden() throws Exception {
        mockMvc.perform(delete("/vehicles/1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Acesso Negado"))
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("Usuário com Role ADMIN tentando deletar veículo deve ter acesso permitido")
    void deleteVehicle_AdminRole_Allowed() throws Exception {
        mockMvc.perform(delete("/vehicles/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Tentativa de escalação de privilégio enviando role=ADMIN em /auth/register deve ser ignorada e salvar Role.USER")
    void register_PrivilegeEscalationAttempt_ForcesRoleUser() throws Exception {
        String payload = "{\"username\":\"attacker\",\"email\":\"attacker@test.com\",\"password\":\"password123\",\"role\":\"ADMIN\"}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("attacker"))
                .andExpect(jsonPath("$.role").value("USER"));

        User created = userRepository.findByUsername("attacker").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(Role.USER, created.getRole());
    }
}


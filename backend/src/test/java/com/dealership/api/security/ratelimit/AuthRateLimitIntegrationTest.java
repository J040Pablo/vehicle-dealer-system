package com.dealership.api.security.ratelimit;

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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthRateLimitIntegrationTest {

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
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }

    @Test
    @DisplayName("Cenário 1: 5 requisições de login devem ser permitidas normalmente")
    void login_FirstFiveRequests_Allowed() throws Exception {
        String clientIp = "192.168.1.100";

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/login")
                            .header("X-Forwarded-For", clientIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists());
        }
    }

    @Test
    @DisplayName("Cenário 2, 3 e 4: 6ª requisição deve ser bloqueada com 429 Too Many Requests e Retry-After header")
    void login_SixthRequest_BlockedWith429AndRetryAfterHeader() throws Exception {
        String clientIp = "192.168.1.101";

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/login")
                            .header("X-Forwarded-For", clientIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"username\":\"admin\",\"password\":\"wrongpassword\"}"))
                    .andExpect(status().isUnauthorized());
        }

        // 6ª requisição - Deve retornar HTTP 429 Too Many Requests
        mockMvc.perform(post("/auth/login")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"wrongpassword\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(header().string("Retry-After", notNullValue()))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.error").value("Too Many Requests"))
                .andExpect(jsonPath("$.message").value("Rate limit exceeded"));
    }

    @Test
    @DisplayName("Cenário 5: IPs diferentes devem possuir buckets independentes")
    void login_DifferentIPs_IndependentBuckets() throws Exception {
        String ip1 = "10.0.0.1";
        String ip2 = "10.0.0.2";

        // IP 1 consome todas as 5 fichas
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/login")
                            .header("X-Forwarded-For", ip1)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                    .andExpect(status().isOk());
        }

        // IP 1 na 6ª tentativa é bloqueado (429)
        mockMvc.perform(post("/auth/login")
                        .header("X-Forwarded-For", ip1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isTooManyRequests());

        // IP 2 faz requisição e deve ser PERMITIDO (200 OK), pois tem seu próprio bucket
        mockMvc.perform(post("/auth/login")
                        .header("X-Forwarded-For", ip2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk());
    }
}

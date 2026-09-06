package com.dealership.api.security;

import com.dealership.api.dealer.DealerService;
import com.dealership.api.vehicle.VehicleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VehicleService vehicleService;

    @MockBean
    private DealerService dealerService;

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
}

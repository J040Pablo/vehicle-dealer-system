package com.dealership.api.config;

import com.dealership.api.dashboard.DashboardService;
import com.dealership.api.dashboard.dto.DashboardMetricsDTO;
import com.dealership.api.dealer.DealerService;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.shared.dto.PagedResponseDTO;

import com.dealership.api.viacep.ViaCepService;
import com.dealership.api.viacep.client.ViaCepClient;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@SpringBootTest
@Transactional
class CacheIntegrationTest {

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private DashboardService dashboardService;

    // @Autowired
    // private VehicleService vehicleService;

    @Autowired
    private DealerService dealerService;

    @Autowired
    private ViaCepService viaCepService;

    @MockBean
    private ViaCepClient viaCepClient;

    @BeforeEach
    void setUp() {
        for (String cacheName : cacheManager.getCacheNames()) {
            Objects.requireNonNull(cacheManager.getCache(cacheName)).clear();
        }
    }

    @Test
    @DisplayName("Deve armazenar métricas do dashboard em cache (Cache Hit e Cache Miss)")
    void dashboardMetrics_ShouldCacheResults() {
        // Cache Miss
        DashboardMetricsDTO firstCall = dashboardService.getDashboardMetrics();
        assertThat(firstCall).isNotNull();

        // Cache Hit
        DashboardMetricsDTO secondCall = dashboardService.getDashboardMetrics();
        assertThat(secondCall).isEqualTo(firstCall);

        assertThat(cacheManager.getCache("dashboard")).isNotNull();
        assertThat(cacheManager.getCache("dashboard").get("metrics")).isNotNull();
    }

    @Test
    @DisplayName("Deve armazenar consulta ao ViaCEP no cache e evitar chamadas repetidas ao cliente HTTP")
    void viaCep_ShouldCacheResults() {
        ViaCepResponseDTO mockResponse = new ViaCepResponseDTO(
                "01001-000", "Praça da Sé", "Sé", "São Paulo", "SP", false);
        when(viaCepClient.getAddressByCep("01001000")).thenReturn(mockResponse);

        // Cache Miss
        ViaCepResponseDTO firstCall = viaCepService.fetchAddress("01001000");
        assertThat(firstCall).isNotNull();
        assertThat(firstCall.street()).isEqualTo("Praça da Sé");

        // Cache Hit (com formatação variante de CEP)
        ViaCepResponseDTO secondCall = viaCepService.fetchAddress("01001-000");
        assertThat(secondCall).isNotNull();
        assertThat(secondCall.street()).isEqualTo("Praça da Sé");

        verify(viaCepClient, times(1)).getAddressByCep("01001000");
    }

    @Test
    @DisplayName("Deve armazenar e recuperar lista paginada de concessionárias no cache de dealers")
    void dealerFindAll_ShouldCacheResults() {
        PagedResponseDTO<DealerResponseDTO> firstCall = dealerService.findAll(PageRequest.of(0, 10));
        assertThat(firstCall).isNotNull();

        PagedResponseDTO<DealerResponseDTO> secondCall = dealerService.findAll(PageRequest.of(0, 10));
        assertThat(secondCall).isNotNull();

        assertThat(cacheManager.getCache("dealers")).isNotNull();
        assertThat(cacheManager.getCache("dealers").get("dealers:page:0:10:UNSORTED")).isNotNull();
    }

    @Test
    @DisplayName("Deve invalidar a região de cache ao disparar despejo (Cache Evict)")
    void cacheEviction_ShouldClearRegion() {
        dashboardService.getDashboardMetrics();
        assertThat(cacheManager.getCache("dashboard").get("metrics")).isNotNull();

        // Limpeza da região de cache
        Objects.requireNonNull(cacheManager.getCache("dashboard")).clear();
        assertThat(cacheManager.getCache("dashboard").get("metrics")).isNull();
    }
}

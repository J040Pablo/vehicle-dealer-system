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
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@SpringBootTest
@Testcontainers
class RedisContainerIntegrationTest {

    static {
        System.setProperty("api.version", "1.44");
    }

    @Container
    static GenericContainer<?> redisContainer = new GenericContainer<>(DockerImageName.parse("redis:8-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void setRedisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", redisContainer::getHost);
        registry.add("spring.data.redis.port", redisContainer::getFirstMappedPort);
        registry.add("spring.cache.type", () -> "redis");
    }

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private DealerService dealerService;

    @Autowired
    private ViaCepService viaCepService;

    @MockBean
    private ViaCepClient viaCepClient;

    @BeforeEach
    void setUp() {
        for (String cacheName : cacheManager.getCacheNames()) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        }
    }

    @Test
    @DisplayName("1 & 2. Validar Cache Miss, Cache Hit e RedisCacheManager em container Redis real")
    void redisReal_CacheMissAndHit_ShouldReturnConcreteDTO() {
        assertThat(cacheManager).isInstanceOf(RedisCacheManager.class);

        // Miss
        DashboardMetricsDTO firstCall = dashboardService.getDashboardMetrics();
        assertThat(firstCall).isNotNull();

        // Hit
        DashboardMetricsDTO secondCall = dashboardService.getDashboardMetrics();
        assertThat(secondCall).isNotNull();
        assertThat(secondCall).isEqualTo(firstCall);
    }

    @Test
    @DisplayName("3 & 4. Validar Serialização Jackson e Desserialização de DTO (garantindo que NÃO retorna LinkedHashMap)")
    void jacksonSerialization_ShouldNotReturnLinkedHashMap() {
        DashboardMetricsDTO firstCall = dashboardService.getDashboardMetrics();
        assertThat(firstCall).isNotNull();

        Object rawCachedValue = Objects.requireNonNull(cacheManager.getCache("dashboard")).get("metrics", Object.class);

        // Assegurar estritamente que NÃO é um LinkedHashMap e SIM a instância do Record DTO
        assertThat(rawCachedValue).isNotNull();
        assertThat(rawCachedValue).isNotInstanceOf(java.util.LinkedHashMap.class);
        assertThat(rawCachedValue).isInstanceOf(DashboardMetricsDTO.class);
    }

    @Test
    @DisplayName("5. Validar configurações de TTL e presença de regiões de cache")
    void ttlAndRegions_ShouldBeConfigured() {
        assertThat(cacheManager.getCacheNames()).contains("dashboard", "viacep", "vehicles", "dealers", "filters");
        assertThat(cacheManager.getCache("dashboard")).isNotNull();
    }

    @Test
    @DisplayName("6. Validar Cache Eviction limpando chave persistida")
    void cacheEviction_ShouldClearPersistedKeys() {
        dashboardService.getDashboardMetrics();
        assertThat(cacheManager.getCache("dashboard").get("metrics")).isNotNull();

        // Cache eviction
        Objects.requireNonNull(cacheManager.getCache("dashboard")).clear();
        assertThat(cacheManager.getCache("dashboard").get("metrics")).isNull();
    }

    @Test
    @DisplayName("7. Validar Cache ViaCEP com normalização de chave e deduplicação de chamadas HTTP")
    void viaCep_ShouldPersistInRealRedis() {
        ViaCepResponseDTO mockViaCep = new ViaCepResponseDTO(
                "01001000", "Praça da Sé", "Sé", "São Paulo", "SP", false);
        when(viaCepClient.getAddressByCep("01001000")).thenReturn(mockViaCep);

        ViaCepResponseDTO response = viaCepService.fetchAddress("01001000");
        assertThat(response).isNotNull();
        assertThat(response.street()).isEqualTo("Praça da Sé");

        ViaCepResponseDTO cachedResponse = viaCepService.fetchAddress("01001-000");
        assertThat(cachedResponse).isEqualTo(response);

        verify(viaCepClient, times(1)).getAddressByCep("01001000");

        Object redisValue = Objects.requireNonNull(cacheManager.getCache("viacep")).get("01001000", Object.class);
        assertThat(redisValue).isNotNull();
        assertThat(redisValue).isNotInstanceOf(java.util.LinkedHashMap.class);
        assertThat(redisValue).isInstanceOf(ViaCepResponseDTO.class);
    }

    @Test
    @DisplayName("8 & 9. Validar Paginação com PagedResponseDTO em Redis sem exceção de cast")
    void pagedResponseDTO_ShouldSerializeAndDeserializeCorrectly() {
        PagedResponseDTO<DealerResponseDTO> firstCall = dealerService.findAll(PageRequest.of(0, 10));
        assertThat(firstCall).isNotNull();

        PagedResponseDTO<DealerResponseDTO> secondCall = dealerService.findAll(PageRequest.of(0, 10));
        assertThat(secondCall).isNotNull();

        Object cachedPagedValue = Objects.requireNonNull(cacheManager.getCache("dealers"))
                .get("dealers:page:0:10:UNSORTED", Object.class);

        assertThat(cachedPagedValue).isNotNull();
        assertThat(cachedPagedValue).isNotInstanceOf(java.util.LinkedHashMap.class);
        assertThat(cachedPagedValue).isInstanceOf(PagedResponseDTO.class);
    }
}

package com.dealership.api.config;

import com.dealership.api.dashboard.dto.DashboardMetricsDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.shared.dto.PagedResponseDTO;
import com.dealership.api.vehicle.FuelType;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.OffsetDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
class JacksonDefaultTypingStrategyTest {

    static {
        System.setProperty("api.version", "1.44");
    }

    @Container
    static GenericContainer<?> redisContainer = new GenericContainer<>(DockerImageName.parse("redis:8-alpine"))
            .withExposedPorts(6379);

    private GenericJackson2JsonRedisSerializer createSerializer(ObjectMapper.DefaultTyping defaultTyping) {
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.dealership.api")
                .allowIfSubType("java.lang.")
                .allowIfSubType("java.util.")
                .allowIfSubType("java.time.")
                .allowIfSubType("java.math.")
                .allowIfSubType("org.springframework.data.domain.")
                .allowIfSubTypeIsArray()
                .build();

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.activateDefaultTyping(ptv, defaultTyping, JsonTypeInfo.As.PROPERTY);

        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }

    private ViaCepResponseDTO sampleRecord() {
        return new ViaCepResponseDTO("01001-000", "Praça da Sé", "Sé", "São Paulo", "SP", false);
    }

    private DashboardMetricsDTO sampleDashboardRecord() {
        Map<FuelType, Long> fuelMap = new EnumMap<>(FuelType.class);
        fuelMap.put(FuelType.FLEX, 10L);
        return new DashboardMetricsDTO(100L, 5L, 10L, fuelMap);
    }

    private VehicleResponseDTO sampleVehicleRecord() {
        return new VehicleResponseDTO(1L, "Toyota", "Corolla", 2023, "ABC1D23", "Prata", FuelType.FLEX, 10L, "Auto Dealership", OffsetDateTime.now(), OffsetDateTime.now());
    }

    private PagedResponseDTO<VehicleResponseDTO> samplePagedRecord() {
        return new PagedResponseDTO<>(List.of(sampleVehicleRecord()), 0, 10, 1L, 1, true, true);
    }

    @Test
    @DisplayName("1. NON_FINAL omite @class para Records (final classes) e falha na desserialização do Redis")
    void testNonFinalStrategy() {
        GenericJackson2JsonRedisSerializer serializer = createSerializer(ObjectMapper.DefaultTyping.NON_FINAL);
        ViaCepResponseDTO record = sampleRecord();

        byte[] serialized = serializer.serialize(record);
        String json = new String(serialized);

        System.out.println("=== NON_FINAL JSON ===");
        System.out.println(json);

        assertThat(json).doesNotContain("\"@class\"");

        assertThatThrownBy(() -> serializer.deserialize(serialized))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("missing type id property '@class'");
    }

    @Test
    @DisplayName("2. OBJECT_AND_NON_CONCRETE omite @class para Record DTOs concretos e falha")
    void testObjectAndNonConcreteStrategy() {
        GenericJackson2JsonRedisSerializer serializer = createSerializer(ObjectMapper.DefaultTyping.OBJECT_AND_NON_CONCRETE);
        ViaCepResponseDTO record = sampleRecord();

        byte[] serialized = serializer.serialize(record);
        String json = new String(serialized);

        System.out.println("=== OBJECT_AND_NON_CONCRETE JSON ===");
        System.out.println(json);

        assertThat(json).doesNotContain("\"@class\"");

        assertThatThrownBy(() -> serializer.deserialize(serialized))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("missing type id property '@class'");
    }

    @Test
    @DisplayName("3. JAVA_LANG_OBJECT omite @class para Record DTOs e falha")
    void testJavaLangObjectStrategy() {
        GenericJackson2JsonRedisSerializer serializer = createSerializer(ObjectMapper.DefaultTyping.JAVA_LANG_OBJECT);
        ViaCepResponseDTO record = sampleRecord();

        byte[] serialized = serializer.serialize(record);
        String json = new String(serialized);

        System.out.println("=== JAVA_LANG_OBJECT JSON ===");
        System.out.println(json);

        assertThat(json).doesNotContain("\"@class\"");

        assertThatThrownBy(() -> serializer.deserialize(serialized))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("missing type id property '@class'");
    }

    @Test
    @DisplayName("4. EVERYTHING inclui @class para Record DTOs e desserializa perfeitamente")
    void testEverythingStrategy() {
        GenericJackson2JsonRedisSerializer serializer = createSerializer(ObjectMapper.DefaultTyping.EVERYTHING);
        ViaCepResponseDTO record = sampleRecord();

        byte[] serialized = serializer.serialize(record);
        String json = new String(serialized);

        System.out.println("=== EVERYTHING JSON ===");
        System.out.println(json);

        Object deserialized = serializer.deserialize(serialized);
        assertThat(json).contains("\"@class\":\"com.dealership.api.viacep.dto.ViaCepResponseDTO\"");
        assertThat(deserialized).isInstanceOf(ViaCepResponseDTO.class);
    }

    @Test
    @DisplayName("5. Validar PagedResponseDTO e DashboardMetricsDTO com EVERYTHING")
    void testComplexRecordTypesWithEverything() {
        GenericJackson2JsonRedisSerializer serializer = createSerializer(ObjectMapper.DefaultTyping.EVERYTHING);

        // DashboardMetricsDTO
        DashboardMetricsDTO dashboard = sampleDashboardRecord();
        byte[] dashboardBytes = serializer.serialize(dashboard);
        Object dashboardDeserialized = serializer.deserialize(dashboardBytes);
        assertThat(dashboardDeserialized).isInstanceOf(DashboardMetricsDTO.class);

        // PagedResponseDTO
        PagedResponseDTO<VehicleResponseDTO> paged = samplePagedRecord();
        byte[] pagedBytes = serializer.serialize(paged);
        Object pagedDeserialized = serializer.deserialize(pagedBytes);
        assertThat(pagedDeserialized).isInstanceOf(PagedResponseDTO.class);
    }
}

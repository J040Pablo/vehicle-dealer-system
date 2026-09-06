package com.dealership.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OpenAPIConfigTest {

    @Test
    @DisplayName("Deve configurar o bean OpenAPI com informações da aplicação")
    void customOpenAPI() {
        OpenAPIConfig config = new OpenAPIConfig();
        OpenAPI openAPI = config.customOpenAPI();

        assertThat(openAPI).isNotNull();
        assertThat(openAPI.getInfo()).isNotNull();
        assertThat(openAPI.getInfo().getTitle()).isEqualTo("Vehicle & Dealer Management API");
        assertThat(openAPI.getInfo().getVersion()).isEqualTo("2.0.0");
    }
}

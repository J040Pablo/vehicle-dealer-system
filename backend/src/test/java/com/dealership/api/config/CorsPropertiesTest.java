package com.dealership.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CorsPropertiesTest {

    @Test
    @DisplayName("Deve conter lista de origens permitidas padrão e aceitar novos valores")
    void testCorsProperties() {
        CorsProperties properties = new CorsProperties();
        assertThat(properties.getAllowedOrigins()).contains("http://localhost:5173");

        properties.setAllowedOrigins(List.of("http://frontend.mydomain.com", "http://localhost:3000"));
        assertThat(properties.getAllowedOrigins()).containsExactly("http://frontend.mydomain.com", "http://localhost:3000");
    }
}

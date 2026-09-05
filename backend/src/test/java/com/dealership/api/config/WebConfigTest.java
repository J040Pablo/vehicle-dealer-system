package com.dealership.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class WebConfigTest {

    @Test
    @DisplayName("Deve registrar mappings de CORS com origens configuradas")
    void addCorsMappings() {
        CorsProperties corsProperties = new CorsProperties();
        corsProperties.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));

        WebConfig webConfig = new WebConfig(corsProperties);
        CorsRegistry registry = mock(CorsRegistry.class);
        CorsRegistration registration = mock(CorsRegistration.class);

        when(registry.addMapping("/**")).thenReturn(registration);
        when(registration.allowedOrigins("http://localhost:3000", "http://localhost:5173")).thenReturn(registration);
        when(registration.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")).thenReturn(registration);
        when(registration.allowedHeaders("*")).thenReturn(registration);
        when(registration.exposedHeaders("X-Correlation-Id")).thenReturn(registration);

        webConfig.addCorsMappings(registry);

        verify(registry, times(1)).addMapping("/**");
        verify(registration, times(1)).allowedOrigins("http://localhost:3000", "http://localhost:5173");
        verify(registration, times(1)).exposedHeaders("X-Correlation-Id");
    }
}

package com.dealership.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = corsProperties.getAllowedOrigins();
        String[] originPatterns = (origins != null && !origins.isEmpty())
                ? origins.toArray(new String[0])
                : new String[]{"*"};

        registry.addMapping("/**")
                .allowedOriginPatterns(originPatterns)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("X-Correlation-Id", "Authorization")
                .allowCredentials(true);
    }
}

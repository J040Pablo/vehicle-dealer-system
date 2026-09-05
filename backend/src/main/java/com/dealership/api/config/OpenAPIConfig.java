package com.dealership.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Vehicle & Dealer Management API")
                        .version("1.0.0")
                        .description("API RESTful para gestão de veículos e concessionárias parceiras com auto-preenchimento ViaCEP e rastreabilidade por Correlation ID.")
                        .contact(new Contact()
                                .name("Suporte Técnico")
                                .email("dev@dealership.com")));
    }
}

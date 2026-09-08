package com.dealership.api.viacep.client;

import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class ViaCepClient {

    private final RestClient restClient;

    public ViaCepClient(@Qualifier("viaCepRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public ViaCepResponseDTO getAddressByCep(String cleanCep) {
        log.info("Consultando API externa ViaCEP para o CEP: {}", cleanCep);
        int maxAttempts = 3;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return restClient.get()
                        .uri("/{cep}/json/", cleanCep)
                        .retrieve()
                        .body(ViaCepResponseDTO.class);
            } catch (Exception e) {
                lastException = e;
                log.warn("Tentativa {}/{} de consulta ao ViaCEP falhou para o CEP {}: {}", attempt, maxAttempts, cleanCep, e.getMessage());
                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(300);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        log.error("Todas as {} tentativas de consulta ao ViaCEP falharam para o CEP: {}", maxAttempts, cleanCep);
        throw new RuntimeException("Falha ao comunicar com a API ViaCEP após " + maxAttempts + " tentativas: " + (lastException != null ? lastException.getMessage() : ""));
    }
}

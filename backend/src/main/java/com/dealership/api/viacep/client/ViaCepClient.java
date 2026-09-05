package com.dealership.api.viacep.client;

import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class ViaCepClient {

    private final RestClient restClient;

    public ViaCepClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://viacep.com.br/ws")
                .build();
    }

    public ViaCepResponseDTO getAddressByCep(String cleanCep) {
        log.info("Consultando API externa ViaCEP para o CEP: {}", cleanCep);
        try {
            return restClient.get()
                    .uri("/{cep}/json/", cleanCep)
                    .retrieve()
                    .body(ViaCepResponseDTO.class);
        } catch (Exception ex) {
            log.error("Falha ao comunicar com a API ViaCEP para o CEP {}: {}", cleanCep, ex.getMessage());
            return null;
        }
    }
}

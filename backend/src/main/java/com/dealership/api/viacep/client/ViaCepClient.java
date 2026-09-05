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
        return restClient.get()
                .uri("/{cep}/json/", cleanCep)
                .retrieve()
                .body(ViaCepResponseDTO.class);
    }
}

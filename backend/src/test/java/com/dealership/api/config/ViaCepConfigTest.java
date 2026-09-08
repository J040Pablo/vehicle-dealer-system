package com.dealership.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

class ViaCepConfigTest {

    @Test
    @DisplayName("Deve instanciar viaCepRestClient com configurações de timeout")
    void viaCepRestClient() {
        ViaCepConfig config = new ViaCepConfig();
        ReflectionTestUtils.setField(config, "viaCepUrl", "https://viacep.com.br/ws");
        ReflectionTestUtils.setField(config, "connectTimeout", 3000);
        ReflectionTestUtils.setField(config, "readTimeout", 5000);

        RestClient.Builder builder = RestClient.builder();
        RestClient restClient = config.viaCepRestClient(builder);

        assertThat(restClient).isNotNull();
    }
}

package com.dealership.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class ViaCepConfig {

    @Value("${viacep.url:https://viacep.com.br/ws}")
    private String viaCepUrl;

    @Value("${viacep.connect-timeout:3000}")
    private int connectTimeout;

    @Value("${viacep.read-timeout:5000}")
    private int readTimeout;

    @Bean
    public RestClient viaCepRestClient(RestClient.Builder builder) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeout));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeout));

        return builder
                .baseUrl(viaCepUrl)
                .requestFactory(requestFactory)
                .build();
    }
}

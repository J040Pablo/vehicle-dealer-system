package com.dealership.api.viacep;

import com.dealership.api.viacep.client.ViaCepClient;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"unchecked", "rawtypes"})
class ViaCepClientTest {

    @Mock
    private RestClient restClient;

    @Mock
    private RestClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private RestClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private ViaCepClient viaCepClient;

    @BeforeEach
    void setUp() {
        viaCepClient = new ViaCepClient(restClient);
    }

    @Test
    @DisplayName("Deve realizar chamada GET ao RestClient para o CEP informado")
    void getAddressByCep_Success() {
        ViaCepResponseDTO expectedResponse = new ViaCepResponseDTO("01001-000", "Praça da Sé", "Sé", "São Paulo", "SP", false);

        when(restClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(eq("/{cep}/json/"), eq("01001000"))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(ViaCepResponseDTO.class)).thenReturn(expectedResponse);

        ViaCepResponseDTO actualResponse = viaCepClient.getAddressByCep("01001000");

        assertThat(actualResponse).isNotNull();
        assertThat(actualResponse.street()).isEqualTo("Praça da Sé");
    }
}

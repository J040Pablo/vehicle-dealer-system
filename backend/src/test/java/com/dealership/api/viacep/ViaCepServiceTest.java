package com.dealership.api.viacep;

import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.viacep.client.ViaCepClient;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ViaCepServiceTest {

    @Mock
    private ViaCepClient viaCepClient;

    @InjectMocks
    private ViaCepService viaCepService;

    private ViaCepResponseDTO validResponse;

    @BeforeEach
    void setUp() {
        validResponse = new ViaCepResponseDTO("01001-000", "Praça da Sé", "Sé", "São Paulo", "SP", false);
    }

    @Test
    @DisplayName("Deve buscar endereço com sucesso quando CEP for válido e formatado")
    void fetchAddress_Success() {
        when(viaCepClient.getAddressByCep("01001000")).thenReturn(validResponse);

        ViaCepResponseDTO result = viaCepService.fetchAddress("01001-000");

        assertThat(result).isNotNull();
        assertThat(result.street()).isEqualTo("Praça da Sé");
        assertThat(result.city()).isEqualTo("São Paulo");
        verify(viaCepClient, times(1)).getAddressByCep("01001000");
    }

    @Test
    @DisplayName("Deve lançar BusinessException quando CEP for nulo")
    void fetchAddress_NullCep_ThrowsBusinessException() {
        assertThatThrownBy(() -> viaCepService.fetchAddress(null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("O CEP é obrigatório");

        verify(viaCepClient, never()).getAddressByCep(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException quando CEP for em branco")
    void fetchAddress_BlankCep_ThrowsBusinessException() {
        assertThatThrownBy(() -> viaCepService.fetchAddress("   "))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("O CEP é obrigatório");

        verify(viaCepClient, never()).getAddressByCep(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException quando CEP não tiver 8 dígitos numéricos")
    void fetchAddress_InvalidLength_ThrowsBusinessException() {
        assertThatThrownBy(() -> viaCepService.fetchAddress("12345"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Deve conter 8 dígitos numéricos");

        verify(viaCepClient, never()).getAddressByCep(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException quando ViaCEP retornar null")
    void fetchAddress_NullResponse_ThrowsBusinessException() {
        when(viaCepClient.getAddressByCep("01001000")).thenReturn(null);

        assertThatThrownBy(() -> viaCepService.fetchAddress("01001000"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Não foi possível localizar o endereço");
    }

    @Test
    @DisplayName("Deve lançar BusinessException quando ViaCEP retornar erro=true")
    void fetchAddress_ErrorResponse_ThrowsBusinessException() {
        ViaCepResponseDTO errorResponse = new ViaCepResponseDTO(null, null, null, null, null, true);
        when(viaCepClient.getAddressByCep("99999999")).thenReturn(errorResponse);

        assertThatThrownBy(() -> viaCepService.fetchAddress("99999999"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Não foi possível localizar o endereço");
    }
}

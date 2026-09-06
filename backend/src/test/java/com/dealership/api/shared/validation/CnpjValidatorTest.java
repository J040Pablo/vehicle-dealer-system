package com.dealership.api.shared.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class CnpjValidatorTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "04.252.011/0001-10",
            "04252011000110",
            "11.222.333/0001-81",
            "11222333000181"
    })
    @DisplayName("Deve retornar true para CNPJs com dígitos verificadores válidos")
    void isValid_ValidCnpj(String cnpj) {
        boolean valid = CnpjValidator.isValidCnpj(cnpj);
        assertThat(valid).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "04.252.011/0001-11", // Dígito final incorreto
            "00000000000000",      // Sequência repetida
            "11111111111111",      // Sequência repetida
            "12345678901234",      // Inválido
            "123"                  // Tamanho insuficiente
    })
    @DisplayName("Deve retornar false para CNPJs com dígitos verificadores ou formato inválidos")
    void isValid_InvalidCnpj(String cnpj) {
        boolean valid = CnpjValidator.isValidCnpj(cnpj);
        assertThat(valid).isFalse();
    }
}

package com.dealership.api.shared.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CepUtilsTest {

    @Test
    @DisplayName("Deve normalizar CEP formatado removendo hífen e pontos")
    void normalize_FormattedCep() {
        String input = "58.400-000";
        String normalized = CepUtils.normalize(input);
        assertThat(normalized).isEqualTo("58400000");
    }

    @Test
    @DisplayName("Deve manter CEP já normalizado sem alterações")
    void normalize_CleanCep() {
        String input = "58400000";
        String normalized = CepUtils.normalize(input);
        assertThat(normalized).isEqualTo("58400000");
    }

    @Test
    @DisplayName("Deve retornar null quando CEP for null")
    void normalize_NullCep() {
        assertThat(CepUtils.normalize(null)).isNull();
    }
}

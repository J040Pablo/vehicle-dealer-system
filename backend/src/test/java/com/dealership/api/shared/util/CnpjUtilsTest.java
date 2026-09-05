package com.dealership.api.shared.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CnpjUtilsTest {

    @Test
    @DisplayName("Deve normalizar CNPJ formatado removendo pontuações")
    void normalize_FormattedCnpj() {
        String input = "62.043.380/0001-07";
        String normalized = CnpjUtils.normalize(input);
        assertThat(normalized).isEqualTo("62043380000107");
    }

    @Test
    @DisplayName("Deve manter CNPJ já normalizado sem alterações")
    void normalize_CleanCnpj() {
        String input = "62043380000107";
        String normalized = CnpjUtils.normalize(input);
        assertThat(normalized).isEqualTo("62043380000107");
    }

    @Test
    @DisplayName("Deve retornar null quando CNPJ for null")
    void normalize_NullCnpj() {
        assertThat(CnpjUtils.normalize(null)).isNull();
    }
}

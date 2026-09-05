package com.dealership.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;

class DealershipApplicationTest {

    @Test
    @DisplayName("Deve instanciar a classe principal da aplicação")
    void testApplicationConstructor() {
        assertThatCode(DealershipApplication::new).doesNotThrowAnyException();
    }
}

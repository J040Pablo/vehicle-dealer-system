package com.dealership.api.security.oauth2;

import com.dealership.api.user.AuthProvider;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OAuth2CodeExchangeServiceTest {

    private OAuth2CodeExchangeService service;
    private User testUser;

    @BeforeEach
    void setUp() {
        service = new OAuth2CodeExchangeService();
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("testuser@example.com")
                .role(Role.USER)
                .provider(AuthProvider.GOOGLE)
                .build();
    }

    @Test
    @DisplayName("Deve gerar código único e permitir consumo único")
    void createAndConsumeCode_Success() {
        String code = service.createExchangeCode(testUser);
        assertNotNull(code);
        assertFalse(code.isBlank());

        User consumedUser = service.consumeCode(code);
        assertNotNull(consumedUser);
        assertEquals(testUser.getUsername(), consumedUser.getUsername());

        // Segundo consumo do mesmo código deve retornar null (uso único)
        User retryUser = service.consumeCode(code);
        assertNull(retryUser);
    }

    @Test
    @DisplayName("Deve retornar null ao tentar consumir código inválido ou nulo")
    void consumeInvalidCode_ReturnsNull() {
        assertNull(service.consumeCode("codigo-inexistente"));
        assertNull(service.consumeCode(null));
        assertNull(service.consumeCode("   "));
    }
}

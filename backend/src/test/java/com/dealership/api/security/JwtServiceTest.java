package com.dealership.api.security;

import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
        jwtService.validateSecretKey();

        testUser = User.builder()
                .id(1L)
                .username("admin")
                .password("encoded_password")
                .role(Role.ADMIN)
                .build();
    }

    @Test
    @DisplayName("Deve lançar exceção quando a chave secreta for nula ou vazia")
    void validateSecretKey_NullOrEmpty_ThrowsException() {
        JwtService service = new JwtService();
        ReflectionTestUtils.setField(service, "secretKey", "   ");

        assertThatThrownBy(service::validateSecretKey)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("não foi informada");

        ReflectionTestUtils.setField(service, "secretKey", null);

        assertThatThrownBy(service::validateSecretKey)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("não foi informada");
    }

    @Test
    @DisplayName("Deve lançar exceção quando a chave secreta for menor que 32 bytes")
    void validateSecretKey_ShortKey_ThrowsException() {
        JwtService service = new JwtService();
        ReflectionTestUtils.setField(service, "secretKey", "short_secret_key_123");

        assertThatThrownBy(service::validateSecretKey)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no mínimo 32 bytes");
    }

    @Test
    @DisplayName("Deve gerar token JWT válido para um usuário")
    void generateToken_Success() {
        String token = jwtService.generateToken(testUser);

        assertThat(token).isNotNull().isNotEmpty();
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
    }

    @Test
    @DisplayName("Deve validar token JWT gerado para o usuário correspondente")
    void isTokenValid_Success() {
        String token = jwtService.generateToken(testUser);

        boolean isValid = jwtService.isTokenValid(token, testUser);

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Deve retornar falso ao validar token com outro usuário")
    void isTokenValid_WrongUser_ReturnsFalse() {
        String token = jwtService.generateToken(testUser);

        User otherUser = User.builder().username("other_user").role(Role.USER).build();

        boolean isValid = jwtService.isTokenValid(token, otherUser);

        assertThat(isValid).isFalse();
    }
}

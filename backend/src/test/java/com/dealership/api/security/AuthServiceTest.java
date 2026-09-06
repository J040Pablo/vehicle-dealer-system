package com.dealership.api.security;

import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import com.dealership.api.user.dto.LoginRequestDTO;
import com.dealership.api.user.dto.RegisterRequestDTO;
import com.dealership.api.user.dto.TokenResponseDTO;
import com.dealership.api.user.dto.UserResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .password("encoded_pass")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("Deve realizar login com sucesso e retornar token JWT")
    void login_Success() {
        LoginRequestDTO request = new LoginRequestDTO("testuser", "password123");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt_mock_token");

        TokenResponseDTO response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("jwt_mock_token");
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Deve registrar novo usuário com sucesso")
    void register_Success() {
        RegisterRequestDTO request = new RegisterRequestDTO("newuser", "password123", Role.USER);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponseDTO response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.username()).isEqualTo("testuser");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao registrar username já existente")
    void register_DuplicateUsername_ThrowsException() {
        RegisterRequestDTO request = new RegisterRequestDTO("testuser", "password123", Role.USER);

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("testuser");

        verify(userRepository, never()).save(any());
    }
}

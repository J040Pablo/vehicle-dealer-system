package com.dealership.api.security;

import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.user.AuthProvider;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import com.dealership.api.user.dto.LoginRequestDTO;
import com.dealership.api.user.dto.OAuth2LinkRequestDTO;
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
                .email("testuser@example.com")
                .password("encoded_pass")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("Deve realizar login com sucesso via username e retornar token JWT")
    void login_Success() {
        LoginRequestDTO request = new LoginRequestDTO("testuser", "password123");

        when(userRepository.findByUsernameOrEmail("testuser", "testuser")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt_mock_token");

        TokenResponseDTO response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("jwt_mock_token");
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Deve realizar login com sucesso via e-mail e retornar token JWT")
    void login_WithEmail_Success() {
        LoginRequestDTO request = new LoginRequestDTO("testuser@example.com", "password123");

        when(userRepository.findByUsernameOrEmail("testuser@example.com", "testuser@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt_mock_token");

        TokenResponseDTO response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("jwt_mock_token");
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Deve lançar BadCredentialsException quando senha estiver incorreta")
    void login_InvalidPassword_ThrowsBadCredentialsException() {
        LoginRequestDTO request = new LoginRequestDTO("testuser", "wrongpassword");

        when(userRepository.findByUsernameOrEmail("testuser", "testuser")).thenReturn(Optional.of(user));
        doThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class)
                .hasMessageContaining("Usuário ou senha incorretos.");
    }

    @Test
    @DisplayName("Deve lançar BadCredentialsException quando usuário não for encontrado")
    void login_UserNotFound_ThrowsBadCredentialsException() {
        LoginRequestDTO request = new LoginRequestDTO("nonexistent", "password123");

        when(userRepository.findByUsernameOrEmail("nonexistent", "nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class)
                .hasMessageContaining("Usuário ou senha incorretos.");
    }

    @Test
    @DisplayName("Deve registrar novo usuário com e-mail com sucesso")
    void register_Success() {
        RegisterRequestDTO request = new RegisterRequestDTO("newuser", "newuser@example.com", "password123", Role.USER);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
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
        RegisterRequestDTO request = new RegisterRequestDTO("testuser", "testuser@example.com", "password123", Role.USER);

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("testuser");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao registrar e-mail já existente")
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequestDTO request = new RegisterRequestDTO("newuser", "testuser@example.com", "password123", Role.USER);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("testuser@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("E-mail 'testuser@example.com' já está em uso.");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve vincular conta Google explicitamente com sucesso")
    void linkOAuth2Account_Success() {
        OAuth2LinkRequestDTO linkDto = new OAuth2LinkRequestDTO("google_sub_12345", "googleuser@example.com");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, "google_sub_12345")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponseDTO response = authService.linkOAuth2Account("testuser", linkDto);

        assertThat(response).isNotNull();
        assertThat(response.username()).isEqualTo("testuser");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Deve lançar BusinessException se conta Google já estiver vinculada a outro usuário")
    void linkOAuth2Account_AlreadyLinkedToAnotherUser_ThrowsException() {
        User otherUser = User.builder().id(99L).username("other").email("other@example.com").build();
        OAuth2LinkRequestDTO linkDto = new OAuth2LinkRequestDTO("google_sub_12345", "googleuser@example.com");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, "google_sub_12345")).thenReturn(Optional.of(otherUser));

        assertThatThrownBy(() -> authService.linkOAuth2Account("testuser", linkDto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Esta conta Google já está vinculada a outro usuário no sistema.");

        verify(userRepository, never()).save(any());
    }
}

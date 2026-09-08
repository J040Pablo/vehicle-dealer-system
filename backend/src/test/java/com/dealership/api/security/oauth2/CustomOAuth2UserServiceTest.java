package com.dealership.api.security.oauth2;

import com.dealership.api.user.AuthProvider;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomOAuth2UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private CustomOAuth2UserService customOAuth2UserService;

    private ClientRegistration clientRegistration;
    private OAuth2AccessToken accessToken;

    @BeforeEach
    void setUp() {
        clientRegistration = ClientRegistration.withRegistrationId("google")
                .clientId("test-client-id")
                .clientSecret("test-client-secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://www.googleapis.com/oauth2/4/token")
                .userInfoUri("https://www.googleapis.com/oauth2/3/userinfo")
                .userNameAttributeName("sub")
                .clientName("Google")
                .build();

        accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                "dummy-access-token",
                Instant.now(),
                Instant.now().plusSeconds(3600)
        );
    }

    @Test
    @DisplayName("Devia rejeitar se o e-mail retornado do Google não for verificado")
    void processOAuth2User_UnverifiedEmail_ThrowsException() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google_12345");
        attributes.put("email", "unverified@example.com");
        attributes.put("email_verified", false);

        OAuth2UserRequest request = new OAuth2UserRequest(clientRegistration, accessToken);
        OAuth2User mockOAuth2User = new DefaultOAuth2User(Collections.emptyList(), attributes, "sub");

        assertThrows(OAuth2AuthenticationException.class, () -> 
                customOAuth2UserService.processOAuth2User(request, mockOAuth2User)
        );
    }

    @Test
    @DisplayName("Devia cadastrar novo usuário quando não encontrado e email verificado")
    void processOAuth2User_NewUser_Success() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google_12345");
        attributes.put("email", "newuser@example.com");
        attributes.put("email_verified", true);

        OAuth2UserRequest request = new OAuth2UserRequest(clientRegistration, accessToken);
        OAuth2User mockOAuth2User = new DefaultOAuth2User(Collections.emptyList(), attributes, "sub");

        when(userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, "google_12345")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("newuser@example.com")).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed_random_password");

        User savedUser = User.builder()
                .id(1L)
                .username("newuser@example.com")
                .email("newuser@example.com")
                .role(Role.USER)
                .provider(AuthProvider.GOOGLE)
                .providerId("google_12345")
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        OAuth2User result = customOAuth2UserService.processOAuth2User(request, mockOAuth2User);

        assertNotNull(result);
        assertEquals("newuser@example.com", result.getName());
        verify(userRepository, times(1)).save(any(User.class));
    }
}

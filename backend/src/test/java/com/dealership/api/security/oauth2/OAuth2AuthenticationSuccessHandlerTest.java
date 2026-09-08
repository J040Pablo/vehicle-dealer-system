package com.dealership.api.security.oauth2;

import com.dealership.api.user.AuthProvider;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthenticationSuccessHandlerTest {

    @Mock
    private OAuth2CodeExchangeService codeExchangeService;

    @InjectMocks
    private OAuth2AuthenticationSuccessHandler successHandler;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(successHandler, "redirectUri", "http://localhost:5173/oauth2/redirect");
    }

    @Test
    @DisplayName("Deve gerar o código de troca e redirecionar para a SPA em caso de sucesso")
    void onAuthenticationSuccess_RedirectsWithCode() throws IOException, ServletException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        User user = User.builder()
                .id(1L)
                .username("google_user")
                .role(Role.USER)
                .provider(AuthProvider.GOOGLE)
                .build();

        CustomOAuth2User customUser = new CustomOAuth2User(user, Map.of("sub", "12345"));
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(customUser);
        when(codeExchangeService.createExchangeCode(user)).thenReturn("test-exchange-code-123");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        String redirectedUrl = response.getRedirectedUrl();
        assertTrue(redirectedUrl != null && redirectedUrl.contains("code=test-exchange-code-123"));
    }
}

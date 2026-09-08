package com.dealership.api.security.oauth2;

import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertTrue;

class OAuth2AuthenticationFailureHandlerTest {

    private OAuth2AuthenticationFailureHandler failureHandler;

    @BeforeEach
    void setUp() {
        failureHandler = new OAuth2AuthenticationFailureHandler();
        ReflectionTestUtils.setField(failureHandler, "redirectUri", "http://localhost:5173/oauth2/redirect");
    }

    @Test
    @DisplayName("Deve redirecionar para a SPA incluindo o parâmetro error em caso de falha")
    void onAuthenticationFailure_RedirectsWithError() throws IOException, ServletException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        AuthenticationException exception = new AuthenticationException("Acesso negado") {};

        failureHandler.onAuthenticationFailure(request, response, exception);

        String redirectedUrl = response.getRedirectedUrl();
        assertTrue(redirectedUrl != null && redirectedUrl.contains("error="));
    }
}

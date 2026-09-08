package com.dealership.api.security.oauth2;

import com.dealership.api.user.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2CodeExchangeService codeExchangeService;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:3000/oauth2/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        if (authentication.getPrincipal() instanceof CustomOAuth2User customUser) {
            User user = customUser.getUser();
            String exchangeCode = codeExchangeService.createExchangeCode(user);

            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("code", exchangeCode)
                    .encode()
                    .toUriString();

            log.info("Autenticação OAuth2 bem-sucedida para o usuário: {}. Redirecionando para SPA...", user.getUsername());
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            log.error("Principal de autenticação desconhecido: {}", authentication.getPrincipal());
            super.onAuthenticationSuccess(request, response, authentication);
        }
    }
}

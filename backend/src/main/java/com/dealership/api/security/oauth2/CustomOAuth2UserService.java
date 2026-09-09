package com.dealership.api.security.oauth2;

import com.dealership.api.user.AuthProvider;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (OAuth2AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Erro ao processar usuário OAuth2: {}", ex.getMessage(), ex);
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("oauth2_processing_error"),
                    "Falha ao processar autenticação com Google: " + ex.getMessage()
            );
        }
    }

    @Transactional
    public OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String providerName = userRequest.getClientRegistration().getRegistrationId();
        if (!"google".equalsIgnoreCase(providerName)) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("unsupported_provider"),
                    "Provedor de autenticação não suportado: " + providerName
            );
        }

        String providerId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        Boolean emailVerified = oAuth2User.getAttribute("email_verified");

        if (email == null || email.trim().isEmpty()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_email"),
                    "E-mail ausente na resposta de autenticação do Google."
            );
        }

        if (emailVerified != null && !emailVerified) {
            log.warn("Tentativa de login OAuth2 com e-mail não verificado: {}", email);
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("email_not_verified"),
                    "O e-mail associado à conta Google não foi verificado."
            );
        }

        if (providerId == null || providerId.trim().isEmpty()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_provider_id"),
                    "ID do provedor Google (sub) ausente na resposta de autenticação."
            );
        }

        // 1. Busca pelo vínculo explícito do providerId (Cenário 1)
        Optional<User> userOptional = userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, providerId);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            log.info("Usuário Google encontrado com sucesso: id={}, username={}", user.getId(), user.getUsername());
        } else {
            // 2. Se não encontrado por providerId, verifica se conta local com mesmo e-mail já existe para auto-linking seguro (Cenário 2)
            Optional<User> localUserOptional = userRepository.findByEmail(email);

            if (localUserOptional.isPresent()) {
                if (!Boolean.TRUE.equals(emailVerified)) {
                    log.warn("Tentativa de auto-linking com e-mail não verificado bloqueada: {}", email);
                    throw new OAuth2AuthenticationException(
                            new OAuth2Error("email_not_verified"),
                            "O e-mail associado à conta Google não foi verificado."
                    );
                }
                user = localUserOptional.get();
                user.setProvider(AuthProvider.GOOGLE);
                user.setProviderId(providerId);
                user = userRepository.save(user);
                log.info("OAuth2 auto-linking realizado com sucesso para usuário {}", email);
            } else {
                // 3. Registra novo usuário garantindo obrigatoriamente a Role USER e hash aleatório de senha (Cenário 3)
                String candidateUsername = email != null ? email : "google_" + providerId;
                if (userRepository.existsByUsername(candidateUsername)) {
                    candidateUsername = "google_" + providerId;
                }

                user = User.builder()
                        .username(candidateUsername)
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(Role.USER)
                        .provider(AuthProvider.GOOGLE)
                        .providerId(providerId)
                        .build();

                user = userRepository.save(user);
                log.info("Novo usuário Google cadastrado com sucesso: id={}, username={}, role={}", user.getId(), user.getUsername(), user.getRole());
            }
        }

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }
}

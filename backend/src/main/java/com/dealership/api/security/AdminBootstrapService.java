package com.dealership.api.security;

import com.dealership.api.user.AuthProvider;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.admin.username:}")
    private String adminUsername;

    @Value("${app.security.admin.email:}")
    private String adminEmail;

    @Value("${app.security.admin.password:}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (adminUsername == null || adminUsername.trim().isEmpty() ||
            adminPassword == null || adminPassword.trim().isEmpty()) {
            log.info("[BOOTSTRAP] Nenhuma variável de ambiente de administrador informada (ADMIN_USERNAME / ADMIN_PASSWORD). Nenhum usuário ADMIN automático foi criado.");
            return;
        }

        String username = adminUsername.trim();
        String password = adminPassword.trim();
        String email = (adminEmail != null && !adminEmail.trim().isEmpty()) ? adminEmail.trim() : username + "@dealership.com";

        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            log.info("[BOOTSTRAP] Usuário administrador '{}' (ou email '{}') já existe no banco de dados. Pulando criação automática.", username, email);
            return;
        }

        User admin = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(Role.ADMIN)
                .provider(AuthProvider.LOCAL)
                .build();

        try {
            User saved = userRepository.save(admin);
            log.info("[BOOTSTRAP] Usuário Administrador de Inicialização criado com sucesso: ID={}, Username={}, Email={}, Role={}",
                    saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole());
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.warn("[BOOTSTRAP] Concorrência detectada na criação do usuário administrador '{}'. Outro nó já realizou a criação.", username);
        }
    }
}

package com.dealership.api.security;

import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminUserStartupValidator implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        long userCount = userRepository.count();
        log.info("[STARTUP] Total users in database: {}", userCount);

        Optional<User> adminUser = userRepository.findByUsername("admin");
        if (adminUser.isPresent()) {
            log.info("[STARTUP] Admin user found");
            String password = adminUser.get().getPassword();
            if (password != null && (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"))) {
                log.info("[STARTUP] BCrypt password detected");
            } else {
                log.warn("[STARTUP] Admin password is NOT encoded with BCrypt");
            }
        } else {
            log.warn("[STARTUP] Admin user missing");
        }
    }
}

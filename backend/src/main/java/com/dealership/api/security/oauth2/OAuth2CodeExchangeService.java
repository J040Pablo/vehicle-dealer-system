package com.dealership.api.security.oauth2;

import com.dealership.api.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2CodeExchangeService {

    private static final long TTL_SECONDS = 30;

    private record ExchangeEntry(User user, Instant expiresAt) {}

    private final Map<String, ExchangeEntry> codeStore = new ConcurrentHashMap<>();

    public String createExchangeCode(User user) {
        cleanExpiredCodes();
        String code = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(TTL_SECONDS);
        codeStore.put(code, new ExchangeEntry(user, expiresAt));
        log.info("Código de troca One-Time gerado para o usuário {}: {}", user.getUsername(), code);
        return code;
    }

    public User consumeCode(String code) {
        cleanExpiredCodes();
        if (code == null || code.trim().isEmpty()) {
            return null;
        }

        ExchangeEntry entry = codeStore.remove(code);
        if (entry == null) {
            log.warn("Tentativa de consumo de código de troca inexistente ou reutilizado: {}", code);
            return null;
        }

        if (Instant.now().isAfter(entry.expiresAt())) {
            log.warn("Código de troca expirado para o usuário: {}", entry.user().getUsername());
            return null;
        }

        log.info("Código de troca consumido com sucesso para o usuário: {}", entry.user().getUsername());
        return entry.user();
    }

    private void cleanExpiredCodes() {
        Instant now = Instant.now();
        codeStore.entrySet().removeIf(e -> now.isAfter(e.getValue().expiresAt()));
    }
}

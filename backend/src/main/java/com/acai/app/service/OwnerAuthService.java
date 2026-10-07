package com.acai.app.service;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Login simples do dono: uma senha (OWNER_PASSWORD) gera um token que vale 12 horas.
 * Os tokens ficam em memória, então reiniciar o servidor pede login de novo.
 */
@Service
public class OwnerAuthService {

    private static final Duration TOKEN_TTL = Duration.ofHours(12);

    private final String password;
    private final Map<String, Instant> tokens = new ConcurrentHashMap<>();

    public OwnerAuthService(@Value("${acai.owner-password}") String password) {
        this.password = password;
    }

    public String login(String attempt) {
        boolean ok = attempt != null && MessageDigest.isEqual(
                attempt.getBytes(StandardCharsets.UTF_8), password.getBytes(StandardCharsets.UTF_8));
        if (!ok) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Senha incorreta");
        }
        String token = UUID.randomUUID().toString();
        tokens.put(token, Instant.now().plus(TOKEN_TTL));
        return token;
    }

    public boolean isValid(String token) {
        if (token == null) {
            return false;
        }
        Instant expiresAt = tokens.get(token);
        if (expiresAt == null || expiresAt.isBefore(Instant.now())) {
            tokens.remove(token);
            return false;
        }
        return true;
    }
}

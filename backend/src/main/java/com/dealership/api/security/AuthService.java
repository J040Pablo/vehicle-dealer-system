package com.dealership.api.security;

import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import com.dealership.api.user.dto.LoginRequestDTO;
import com.dealership.api.user.dto.RegisterRequestDTO;
import com.dealership.api.user.dto.TokenResponseDTO;
import com.dealership.api.user.dto.UserResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dealership.api.security.oauth2.OAuth2CodeExchangeService;
import com.dealership.api.user.AuthProvider;
import com.dealership.api.user.dto.OAuth2CodeExchangeRequestDTO;
import com.dealership.api.user.dto.OAuth2LinkRequestDTO;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private final OAuth2CodeExchangeService oAuth2CodeExchangeService;

    public TokenResponseDTO login(LoginRequestDTO dto) {
        log.info("Tentativa de login para o usuário: {}", dto.username());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
            );
        } catch (AuthenticationException e) {
            log.warn("Falha de autenticação para o usuário {}: {}", dto.username(), e.getMessage());
            throw new BadCredentialsException("Usuário ou senha incorretos.");
        }

        User user = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new BadCredentialsException("Usuário ou senha incorretos."));

        String token = jwtService.generateToken(user);
        log.info("Login realizado com sucesso para o usuário: {}", dto.username());
        return new TokenResponseDTO(token);
    }

    @Transactional
    public TokenResponseDTO exchangeOAuth2Code(OAuth2CodeExchangeRequestDTO dto) {
        User user = oAuth2CodeExchangeService.consumeCode(dto.code());
        if (user == null) {
            throw new BadCredentialsException("Código de troca OAuth2 inválido ou expirado.");
        }

        String token = jwtService.generateToken(user);
        log.info("JWT emitido via troca OAuth2 com sucesso para o usuário: {}", user.getUsername());
        return new TokenResponseDTO(token);
    }

    @Transactional
    public UserResponseDTO linkOAuth2Account(String currentUsername, OAuth2LinkRequestDTO dto) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado: " + currentUsername));

        Optional<User> existingOwner = userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, dto.providerId());
        if (existingOwner.isPresent() && !existingOwner.get().getId().equals(user.getId())) {
            throw new BusinessException("Esta conta Google já está vinculada a outro usuário no sistema.");
        }

        user.setProvider(AuthProvider.GOOGLE);
        user.setProviderId(dto.providerId());
        if (dto.email() != null && !dto.email().trim().isEmpty()) {
            user.setEmail(dto.email());
        }

        User saved = userRepository.save(user);
        log.info("Conta Google vinculada com sucesso ao usuário local: username={}, providerId={}", saved.getUsername(), saved.getProviderId());
        return new UserResponseDTO(saved.getId(), saved.getUsername(), saved.getRole());
    }

    @Transactional
    public UserResponseDTO register(RegisterRequestDTO dto) {
        log.info("Iniciando registro de novo usuário: {}", dto.username());
        if (userRepository.existsByUsername(dto.username())) {
            throw new BusinessException("Username '" + dto.username() + "' já está em uso.");
        }

        Role userRole = dto.role() != null ? dto.role() : Role.USER;

        User user = User.builder()
                .username(dto.username())
                .password(passwordEncoder.encode(dto.password()))
                .role(userRole)
                .build();

        User saved = userRepository.save(user);
        log.info("Usuário cadastrado com sucesso: ID={} Username={} Role={}", saved.getId(), saved.getUsername(), saved.getRole());

        return new UserResponseDTO(saved.getId(), saved.getUsername(), saved.getRole());
    }
}

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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public TokenResponseDTO login(LoginRequestDTO dto) {
        log.info("Tentativa de login para o usuário: {}", dto.username());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
        );

        User user = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado."));

        String token = jwtService.generateToken(user);
        log.info("Login realizado com sucesso para o usuário: {}", dto.username());
        return new TokenResponseDTO(token);
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

package com.dealership.api.security;

import com.dealership.api.user.dto.LoginRequestDTO;
import com.dealership.api.user.dto.RegisterRequestDTO;
import com.dealership.api.user.dto.TokenResponseDTO;
import com.dealership.api.user.dto.UserResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints para autenticação JWT e registro de usuários")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário e obter token JWT")
    public ResponseEntity<TokenResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/oauth2/exchange")
    @Operation(summary = "Trocar código de autorização OAuth2 de uso único pelo token JWT da aplicação")
    public ResponseEntity<TokenResponseDTO> exchangeCode(@Valid @RequestBody com.dealership.api.user.dto.OAuth2CodeExchangeRequestDTO dto) {
        return ResponseEntity.ok(authService.exchangeOAuth2Code(dto));
    }

    @PostMapping("/oauth2/link")
    @Operation(summary = "Vincular explicitamente uma conta Google ao usuário autenticado")
    public ResponseEntity<UserResponseDTO> linkAccount(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @Valid @RequestBody com.dealership.api.user.dto.OAuth2LinkRequestDTO dto
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponseDTO linked = authService.linkOAuth2Account(userDetails.getUsername(), dto);
        return ResponseEntity.ok(linked);
    }

    @PostMapping("/register")
    @Operation(summary = "Cadastrar novo usuário no sistema")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        UserResponseDTO registered = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }
}

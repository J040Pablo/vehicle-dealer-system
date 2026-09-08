package com.dealership.api.user.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank(message = "Usuário ou e-mail é obrigatório")
        String username,

        @NotBlank(message = "Senha é obrigatória")
        String password
) {}

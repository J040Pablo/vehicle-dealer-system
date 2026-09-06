package com.dealership.api.user.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank(message = "Username é obrigatório")
        String username,

        @NotBlank(message = "Senha é obrigatória")
        String password
) {}

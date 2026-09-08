package com.dealership.api.user.dto;

import jakarta.validation.constraints.NotBlank;

public record OAuth2LinkRequestDTO(
        @NotBlank(message = "O ID do provedor Google (sub) é obrigatório")
        String providerId,

        String email
) {}

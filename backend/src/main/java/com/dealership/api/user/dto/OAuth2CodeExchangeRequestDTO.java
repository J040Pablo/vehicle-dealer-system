package com.dealership.api.user.dto;

import jakarta.validation.constraints.NotBlank;

public record OAuth2CodeExchangeRequestDTO(
        @NotBlank(message = "O código de troca é obrigatório")
        String code
) {}

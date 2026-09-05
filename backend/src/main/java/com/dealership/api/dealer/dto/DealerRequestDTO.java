package com.dealership.api.dealer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DealerRequestDTO(
        @NotBlank(message = "A Razão Social / Nome da concessionária é obrigatório.")
        String name,

        @NotBlank(message = "O CNPJ é obrigatório.")
        @Pattern(regexp = "^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$|^\\d{14}$", message = "O CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou 14 dígitos numéricos.")
        String cnpj,

        @NotBlank(message = "O CEP é obrigatório.")
        @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "O CEP deve estar no formato XXXXX-XXX ou 8 dígitos numéricos.")
        String cep
) {}

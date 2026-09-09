package com.dealership.api.dealer.dto;

import com.dealership.api.shared.validation.CNPJ;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import jakarta.validation.constraints.Size;

public record DealerRequestDTO(
        @NotBlank(message = "A Razão Social / Nome da concessionária é obrigatório.")
        String name,

        @NotBlank(message = "O CNPJ é obrigatório.")
        @CNPJ
        String cnpj,

        @NotBlank(message = "O CEP é obrigatório.")
        @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "O CEP deve estar no formato XXXXX-XXX ou 8 dígitos numéricos.")
        String cep,

        // Campos opcionais para fallback de digitação manual de endereço
        String street,
        String neighborhood,
        String city,
        String state,

        @Size(max = 500, message = "A URL da imagem deve possuir no máximo 500 caracteres.")
        @Pattern(regexp = "^(https?://).*$", message = "URL de imagem inválida.")
        String imageUrl
) {
    public DealerRequestDTO(String name, String cnpj, String cep) {
        this(name, cnpj, cep, null, null, null, null, null);
    }

    public DealerRequestDTO(String name, String cnpj, String cep, String street, String neighborhood, String city, String state) {
        this(name, cnpj, cep, street, neighborhood, city, state, null);
    }
}

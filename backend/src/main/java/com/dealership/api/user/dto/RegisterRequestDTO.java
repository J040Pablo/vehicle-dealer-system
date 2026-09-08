package com.dealership.api.user.dto;

import com.dealership.api.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
        @NotBlank(message = "Username é obrigatório")
        @Size(min = 3, max = 50, message = "Username deve ter entre 3 e 50 caracteres")
        String username,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail em formato inválido")
        @Size(max = 100, message = "E-mail deve ter no máximo 100 caracteres")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
        String password,

        Role role
) {}

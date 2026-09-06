package com.dealership.api.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CnpjValidator implements ConstraintValidator<CNPJ, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // Use @NotBlank para obrigar presença
        }
        return isValidCnpj(value);
    }

    public static boolean isValidCnpj(String rawCnpj) {
        if (rawCnpj == null) {
            return false;
        }

        String cnpj = rawCnpj.replaceAll("\\D", "");
        if (cnpj.length() != 14) {
            return false;
        }

        // Rejeitar sequências repetidas conhecidas (e.g. 00000000000000)
        if (cnpj.matches("(\\d)\\1{13}")) {
            return false;
        }

        try {
            int[] weights1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
            int sum = 0;
            for (int i = 0; i < 12; i++) {
                sum += (cnpj.charAt(i) - '0') * weights1[i];
            }
            int remainder = sum % 11;
            int digit1 = (remainder < 2) ? 0 : 11 - remainder;

            if ((cnpj.charAt(12) - '0') != digit1) {
                return false;
            }

            int[] weights2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
            sum = 0;
            for (int i = 0; i < 13; i++) {
                sum += (cnpj.charAt(i) - '0') * weights2[i];
            }
            remainder = sum % 11;
            int digit2 = (remainder < 2) ? 0 : 11 - remainder;

            return (cnpj.charAt(13) - '0') == digit2;
        } catch (Exception e) {
            return false;
        }
    }
}

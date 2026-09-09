package com.dealership.api.vehicle.dto;

import com.dealership.api.vehicle.FuelType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record VehicleRequestDTO(
        @NotBlank(message = "A marca do veículo é obrigatória.")
        String brand,

        @NotBlank(message = "O modelo do veículo é obrigatório.")
        String model,

        @NotNull(message = "O ano do veículo é obrigatório.")
        @Min(value = 1900, message = "O ano informado é inválido.")
        Integer year,

        @NotBlank(message = "A placa do veículo é obrigatória.")
        String plate,

        @NotBlank(message = "A cor do veículo é obrigatória.")
        String color,

        @NotNull(message = "O tipo de combustível é obrigatório.")
        FuelType fuelType,

        @Size(max = 100, message = "O chassi deve possuir no máximo 100 caracteres.")
        String chassis,

        @jakarta.validation.constraints.DecimalMin(value = "0.00", message = "O valor deve ser maior ou igual a zero.")
        BigDecimal value,

        @Size(max = 500, message = "A URL da imagem deve possuir no máximo 500 caracteres.")
        @Pattern(regexp = "^(https?://).*$", message = "URL de imagem inválida.")
        String imageUrl,

        Long dealerId
) {
    public VehicleRequestDTO(String brand, String model, Integer year, String plate, String color, FuelType fuelType, Long dealerId) {
        this(brand, model, year, plate, color, fuelType, null, null, null, dealerId);
    }

    public VehicleRequestDTO(String brand, String model, Integer year, String plate, String color, FuelType fuelType, String imageUrl, Long dealerId) {
        this(brand, model, year, plate, color, fuelType, null, null, imageUrl, dealerId);
    }
}

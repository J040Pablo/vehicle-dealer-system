package com.dealership.api.vehicle.dto;

import com.dealership.api.vehicle.FuelType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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

        @NotNull(message = "O tipo de combustível é obrigatório.")
        FuelType fuelType,

        Long dealerId
) {}

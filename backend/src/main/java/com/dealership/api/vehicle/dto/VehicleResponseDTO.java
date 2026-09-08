package com.dealership.api.vehicle.dto;

import com.dealership.api.vehicle.FuelType;

import java.time.OffsetDateTime;

public record VehicleResponseDTO(
        Long id,
        String brand,
        String model,
        Integer year,
        String plate,
        String color,
        FuelType fuelType,
        Long dealerId,
        String dealerName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}

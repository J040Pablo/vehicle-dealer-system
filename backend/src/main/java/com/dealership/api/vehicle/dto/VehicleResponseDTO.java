package com.dealership.api.vehicle.dto;

import com.dealership.api.vehicle.FuelType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record VehicleResponseDTO(
        Long id,
        String brand,
        String model,
        Integer year,
        String plate,
        String color,
        FuelType fuelType,
        String chassis,
        BigDecimal value,
        String imageUrl,
        Long dealerId,
        String dealerName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public VehicleResponseDTO(Long id, String brand, String model, Integer year, String plate, String color, FuelType fuelType, Long dealerId, String dealerName, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this(id, brand, model, year, plate, color, fuelType, null, null, null, dealerId, dealerName, createdAt, updatedAt);
    }

    public VehicleResponseDTO(Long id, String brand, String model, Integer year, String plate, String color, FuelType fuelType, String imageUrl, Long dealerId, String dealerName, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this(id, brand, model, year, plate, color, fuelType, null, null, imageUrl, dealerId, dealerName, createdAt, updatedAt);
    }
}

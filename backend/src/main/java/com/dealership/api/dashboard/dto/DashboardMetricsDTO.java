package com.dealership.api.dashboard.dto;

import com.dealership.api.vehicle.FuelType;

import java.util.Map;

public record DashboardMetricsDTO(
        long totalVehicles,
        long totalDealers,
        long unassignedVehiclesCount,
        Map<FuelType, Long> fuelDistribution
) {}

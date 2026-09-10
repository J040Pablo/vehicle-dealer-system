package com.dealership.api.dashboard;

import com.dealership.api.dashboard.dto.DashboardMetricsDTO;
import com.dealership.api.dealer.DealerRepository;
import com.dealership.api.vehicle.FuelType;
import com.dealership.api.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DealerRepository dealerRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'metrics'")
    public DashboardMetricsDTO getDashboardMetrics() {
        log.info("Calculando métricas do dashboard no banco de dados (Cache Miss)");

        long totalVehicles = vehicleRepository.count();
        long totalDealers = dealerRepository.count();
        long unassignedVehicles = vehicleRepository.countByDealerIsNull();

        Map<FuelType, Long> fuelDistribution = new EnumMap<>(FuelType.class);
        for (FuelType type : FuelType.values()) {
            fuelDistribution.put(type, 0L);
        }

        List<Object[]> fuelCounts = vehicleRepository.countVehiclesByFuelType();
        for (Object[] row : fuelCounts) {
            FuelType fuelType = (FuelType) row[0];
            Long count = (Long) row[1];
            if (fuelType != null && count != null) {
                fuelDistribution.put(fuelType, count);
            }
        }

        return new DashboardMetricsDTO(totalVehicles, totalDealers, unassignedVehicles, fuelDistribution);
    }
}

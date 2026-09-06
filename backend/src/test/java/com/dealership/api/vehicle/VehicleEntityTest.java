package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleEntityTest {

    @Test
    @DisplayName("Deve testar getters, setters e builder da entidade Vehicle")
    void testVehicleEntity() {
        OffsetDateTime now = OffsetDateTime.now();
        Dealer dealer = Dealer.builder().id(1L).name("Concessionária SP").build();

        Vehicle vehicle = Vehicle.builder()
                .id(10L)
                .brand("Toyota")
                .model("Corolla")
                .year(2024)
                .plate("ABC1D23")
                .color("Preto")
                .fuelType(FuelType.FLEX)
                .dealer(dealer)
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertThat(vehicle.getId()).isEqualTo(10L);
        assertThat(vehicle.getBrand()).isEqualTo("Toyota");
        assertThat(vehicle.getModel()).isEqualTo("Corolla");
        assertThat(vehicle.getYear()).isEqualTo(2024);
        assertThat(vehicle.getPlate()).isEqualTo("ABC1D23");
        assertThat(vehicle.getColor()).isEqualTo("Preto");
        assertThat(vehicle.getFuelType()).isEqualTo(FuelType.FLEX);
        assertThat(vehicle.getDealer()).isEqualTo(dealer);
        assertThat(vehicle.getCreatedAt()).isEqualTo(now);
        assertThat(vehicle.getUpdatedAt()).isEqualTo(now);

        // Test setters
        vehicle.setId(20L);
        vehicle.setBrand("Honda");
        vehicle.setModel("Civic");
        vehicle.setYear(2025);
        vehicle.setPlate("XYZ9E87");
        vehicle.setColor("Prata");
        vehicle.setFuelType(FuelType.HIBRIDO);
        vehicle.setDealer(null);
        vehicle.setCreatedAt(now);
        vehicle.setUpdatedAt(now);

        assertThat(vehicle.getId()).isEqualTo(20L);
        assertThat(vehicle.getBrand()).isEqualTo("Honda");
        assertThat(vehicle.getModel()).isEqualTo("Civic");
        assertThat(vehicle.getYear()).isEqualTo(2025);
        assertThat(vehicle.getPlate()).isEqualTo("XYZ9E87");
        assertThat(vehicle.getColor()).isEqualTo("Prata");
        assertThat(vehicle.getFuelType()).isEqualTo(FuelType.HIBRIDO);
        assertThat(vehicle.getDealer()).isNull();
    }

    @Test
    @DisplayName("Deve testar construtor sem argumentos e com todos os argumentos")
    void testConstructors() {
        Vehicle noArgsVehicle = new Vehicle();
        assertThat(noArgsVehicle).isNotNull();

        Vehicle allArgsVehicle = new Vehicle(10L, "Toyota", "Corolla", 2024, "ABC1D23", "Preto", FuelType.FLEX, null, null, null);
        assertThat(allArgsVehicle.getId()).isEqualTo(10L);
    }
}

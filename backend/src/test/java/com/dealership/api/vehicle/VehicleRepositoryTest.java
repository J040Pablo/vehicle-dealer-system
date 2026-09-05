package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class VehicleRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private VehicleRepository vehicleRepository;

    private Dealer dealer;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        dealer = Dealer.builder()
                .name("Concessionária SP")
                .cnpj("62043380000107")
                .cep("01001000")
                .street("Praça da Sé")
                .neighborhood("Sé")
                .city("São Paulo")
                .state("SP")
                .build();
        dealer = entityManager.persistAndFlush(dealer);

        vehicle = Vehicle.builder()
                .brand("Toyota")
                .model("Corolla")
                .year(2024)
                .plate("ABC1D23")
                .fuelType(FuelType.FLEX)
                .dealer(dealer)
                .build();
        vehicle = entityManager.persistAndFlush(vehicle);
    }

    @Test
    @DisplayName("Deve verificar se placa existe")
    void existsByPlate() {
        boolean exists = vehicleRepository.existsByPlate("ABC1D23");
        boolean existsOther = vehicleRepository.existsByPlate("XYZ9999");

        assertThat(exists).isTrue();
        assertThat(existsOther).isFalse();
    }

    @Test
    @DisplayName("Deve verificar se placa existe para outro veículo diferente do ID")
    void existsByPlateAndIdNot() {
        boolean existsSameId = vehicleRepository.existsByPlateAndIdNot("ABC1D23", vehicle.getId());
        boolean existsDifferentId = vehicleRepository.existsByPlateAndIdNot("ABC1D23", 999L);

        assertThat(existsSameId).isFalse();
        assertThat(existsDifferentId).isTrue();
    }

    @Test
    @DisplayName("Deve buscar veículos por dealerId")
    void findByDealerId() {
        List<Vehicle> vehicles = vehicleRepository.findByDealerId(dealer.getId());

        assertThat(vehicles).hasSize(1);
        assertThat(vehicles.get(0).getPlate()).isEqualTo("ABC1D23");
    }

    @Test
    @DisplayName("Deve buscar veículos paginados por dealerId")
    void findByDealerId_Pageable() {
        Page<Vehicle> vehicles = vehicleRepository.findByDealerId(dealer.getId(), PageRequest.of(0, 10));

        assertThat(vehicles).isNotNull();
        assertThat(vehicles.getTotalElements()).isEqualTo(1);
        assertThat(vehicles.getContent().get(0).getPlate()).isEqualTo("ABC1D23");
    }

    @Test
    @DisplayName("Deve buscar veículo por placa")
    void findByPlate() {
        Optional<Vehicle> found = vehicleRepository.findByPlate("ABC1D23");

        assertThat(found).isPresent();
        assertThat(found.get().getBrand()).isEqualTo("Toyota");
    }
}

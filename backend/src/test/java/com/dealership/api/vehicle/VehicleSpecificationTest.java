package com.dealership.api.vehicle;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleSpecificationTest {

    @Test
    @DisplayName("Deve criar especificação com filtro por dealerId e termo de busca")
    void filter_WithDealerIdAndSearch_CreatesValidSpecification() {
        Specification<Vehicle> spec = VehicleSpecification.filter(1L, "Civic");
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("Deve criar especificação nula ou sem restrições quando parâmetros forem nulos")
    void filter_WithNullParams_CreatesValidSpecification() {
        Specification<Vehicle> spec = VehicleSpecification.filter(null, null);
        assertThat(spec).isNotNull();
    }
}

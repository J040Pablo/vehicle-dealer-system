package com.dealership.api.dealer;

import com.dealership.api.vehicle.Vehicle;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DealerEntityTest {

    @Test
    @DisplayName("Deve testar getters, setters, builder e normalizeFields da entidade Dealer")
    void testDealerEntity() {
        OffsetDateTime now = OffsetDateTime.now();

        Dealer dealer = Dealer.builder()
                .id(1L)
                .name("Concessionária SP")
                .cnpj("62.043.380/0001-07")
                .cep("01001-000")
                .street("Praça da Sé")
                .neighborhood("Sé")
                .city("São Paulo")
                .state("SP")
                .createdAt(now)
                .updatedAt(now)
                .vehicles(new ArrayList<>())
                .build();

        assertThat(dealer.getId()).isEqualTo(1L);
        assertThat(dealer.getName()).isEqualTo("Concessionária SP");
        assertThat(dealer.getCnpj()).isEqualTo("62.043.380/0001-07");
        assertThat(dealer.getCep()).isEqualTo("01001-000");
        assertThat(dealer.getStreet()).isEqualTo("Praça da Sé");
        assertThat(dealer.getNeighborhood()).isEqualTo("Sé");
        assertThat(dealer.getCity()).isEqualTo("São Paulo");
        assertThat(dealer.getState()).isEqualTo("SP");
        assertThat(dealer.getCreatedAt()).isEqualTo(now);
        assertThat(dealer.getUpdatedAt()).isEqualTo(now);
        assertThat(dealer.getVehicles()).isEmpty();

        // Test custom setters with normalization
        dealer.setCnpj("12.345.678/0001-95");
        assertThat(dealer.getCnpj()).isEqualTo("12345678000195");

        dealer.setCep("01001-000");
        assertThat(dealer.getCep()).isEqualTo("01001000");

        // Test direct setter and normalizeFields callback
        dealer.setCnpj("62.043.380/0001-07");
        dealer.setCep("01001-000");
        dealer.normalizeFields();
        assertThat(dealer.getCnpj()).isEqualTo("62043380000107");
        assertThat(dealer.getCep()).isEqualTo("01001000");

        // Test null handling in normalizeFields
        dealer.setCnpj(null);
        dealer.setCep(null);
        dealer.normalizeFields();
        assertThat(dealer.getCnpj()).isNull();
        assertThat(dealer.getCep()).isNull();

        // Test vehicles association
        Vehicle vehicle = new Vehicle();
        dealer.setVehicles(List.of(vehicle));
        assertThat(dealer.getVehicles()).hasSize(1);
    }

    @Test
    @DisplayName("Deve testar construtor sem argumentos e com todos argumentos")
    void testConstructors() {
        Dealer noArgsDealer = new Dealer();
        assertThat(noArgsDealer).isNotNull();

        Dealer allArgsDealer = new Dealer(1L, "Name", "12345678000195", "01001000",
                "Street", "Neighborhood", "City", "SP", new ArrayList<>(), null, null);
        assertThat(allArgsDealer.getId()).isEqualTo(1L);
    }
}

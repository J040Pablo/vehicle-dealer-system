package com.dealership.api.dealer;

import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.vehicle.Vehicle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DealerMapperTest {

    private DealerMapper dealerMapper;

    @BeforeEach
    void setUp() {
        dealerMapper = new DealerMapperImpl();
    }

    @Test
    @DisplayName("Deve mapear DealerRequestDTO para Dealer entity")
    void toEntity_Success() {
        DealerRequestDTO dto = new DealerRequestDTO("Concessionária SP", "62043380000107", "01001000");

        Dealer entity = dealerMapper.toEntity(dto);

        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Concessionária SP");
        assertThat(entity.getCnpj()).isEqualTo("62043380000107");
        assertThat(entity.getCep()).isEqualTo("01001000");
    }

    @Test
    @DisplayName("Deve tratar DTO nulo em toEntity")
    void toEntity_Null() {
        Dealer entity = dealerMapper.toEntity(null);
        assertThat(entity).isNull();
    }

    @Test
    @DisplayName("Deve mapear Dealer entity para DealerResponseDTO com cálculo de totalVehicles")
    void toDTO_Success() {
        List<Vehicle> vehicles = List.of(new Vehicle(), new Vehicle());
        Dealer entity = Dealer.builder()
                .id(1L)
                .name("Concessionária SP")
                .cnpj("62043380000107")
                .cep("01001000")
                .street("Praça da Sé")
                .neighborhood("Sé")
                .city("São Paulo")
                .state("SP")
                .vehicles(vehicles)
                .build();

        DealerResponseDTO dto = dealerMapper.toDTO(entity);

        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.name()).isEqualTo("Concessionária SP");
        assertThat(dto.totalVehicles()).isEqualTo(2);
    }

    @Test
    @DisplayName("Deve mapear Dealer entity com lista de veículos nula para DealerResponseDTO totalVehicles=0")
    void toDTO_NullVehicles() {
        Dealer entity = Dealer.builder()
                .id(1L)
                .name("Concessionária SP")
                .vehicles(null)
                .build();

        DealerResponseDTO dto = dealerMapper.toDTO(entity);

        assertThat(dto).isNotNull();
        assertThat(dto.totalVehicles()).isEqualTo(0);
    }

    @Test
    @DisplayName("Deve tratar Entity nula em toDTO")
    void toDTO_Null() {
        DealerResponseDTO dto = dealerMapper.toDTO(null);
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("Deve atualizar Dealer entity a partir de DealerRequestDTO")
    void updateEntityFromDTO_Success() {
        DealerRequestDTO dto = new DealerRequestDTO("Novo Nome", "62043380000107", "01001000");
        Dealer entity = Dealer.builder().id(1L).name("Nome Antigo").build();

        dealerMapper.updateEntityFromDTO(dto, entity);

        assertThat(entity.getName()).isEqualTo("Novo Nome");
    }

    @Test
    @DisplayName("Deve ignorar atualização quando DTO for nulo")
    void updateEntityFromDTO_NullDTO() {
        Dealer entity = Dealer.builder().id(1L).name("Nome Antigo").build();

        dealerMapper.updateEntityFromDTO(null, entity);

        assertThat(entity.getName()).isEqualTo("Nome Antigo");
    }
}

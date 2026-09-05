package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import com.dealership.api.vehicle.dto.VehicleRequestDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleMapperTest {

    private VehicleMapper vehicleMapper;

    @BeforeEach
    void setUp() {
        vehicleMapper = new VehicleMapperImpl();
    }

    @Test
    @DisplayName("Deve mapear VehicleRequestDTO para Vehicle entity")
    void toEntity_Success() {
        VehicleRequestDTO dto = new VehicleRequestDTO("Toyota", "Corolla", 2024, "ABC1D23", FuelType.FLEX, 1L);

        Vehicle entity = vehicleMapper.toEntity(dto);

        assertThat(entity).isNotNull();
        assertThat(entity.getBrand()).isEqualTo("Toyota");
        assertThat(entity.getModel()).isEqualTo("Corolla");
        assertThat(entity.getYear()).isEqualTo(2024);
        assertThat(entity.getPlate()).isEqualTo("ABC1D23");
        assertThat(entity.getFuelType()).isEqualTo(FuelType.FLEX);
    }

    @Test
    @DisplayName("Deve tratar DTO nulo em toEntity")
    void toEntity_Null() {
        Vehicle entity = vehicleMapper.toEntity(null);
        assertThat(entity).isNull();
    }

    @Test
    @DisplayName("Deve mapear Vehicle entity com concessionária vinculada para VehicleResponseDTO")
    void toDTO_WithDealer() {
        Dealer dealer = Dealer.builder().id(1L).name("Concessionária SP").build();
        Vehicle entity = Vehicle.builder()
                .id(10L)
                .brand("Toyota")
                .model("Corolla")
                .year(2024)
                .plate("ABC1D23")
                .fuelType(FuelType.FLEX)
                .dealer(dealer)
                .build();

        VehicleResponseDTO dto = vehicleMapper.toDTO(entity);

        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(10L);
        assertThat(dto.dealerId()).isEqualTo(1L);
        assertThat(dto.dealerName()).isEqualTo("Concessionária SP");
    }

    @Test
    @DisplayName("Deve mapear Vehicle entity sem concessionária vinculada para VehicleResponseDTO")
    void toDTO_WithoutDealer() {
        Vehicle entity = Vehicle.builder()
                .id(10L)
                .brand("Toyota")
                .model("Corolla")
                .year(2024)
                .plate("ABC1D23")
                .fuelType(FuelType.FLEX)
                .dealer(null)
                .build();

        VehicleResponseDTO dto = vehicleMapper.toDTO(entity);

        assertThat(dto).isNotNull();
        assertThat(dto.dealerId()).isNull();
        assertThat(dto.dealerName()).isNull();
    }

    @Test
    @DisplayName("Deve tratar Entity nula em toDTO")
    void toDTO_Null() {
        VehicleResponseDTO dto = vehicleMapper.toDTO(null);
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("Deve atualizar Vehicle entity a partir de VehicleRequestDTO")
    void updateEntityFromDTO_Success() {
        VehicleRequestDTO dto = new VehicleRequestDTO("Toyota", "Corolla Cross", 2025, "ABC1D23", FuelType.HIBRIDO, null);
        Vehicle entity = Vehicle.builder().id(10L).brand("Toyota").model("Corolla").year(2024).build();

        vehicleMapper.updateEntityFromDTO(dto, entity);

        assertThat(entity.getModel()).isEqualTo("Corolla Cross");
        assertThat(entity.getYear()).isEqualTo(2025);
        assertThat(entity.getFuelType()).isEqualTo(FuelType.HIBRIDO);
    }

    @Test
    @DisplayName("Deve ignorar atualização quando DTO for nulo")
    void updateEntityFromDTO_NullDTO() {
        Vehicle entity = Vehicle.builder().id(10L).brand("Toyota").model("Corolla").build();

        vehicleMapper.updateEntityFromDTO(null, entity);

        assertThat(entity.getModel()).isEqualTo("Corolla");
    }
}

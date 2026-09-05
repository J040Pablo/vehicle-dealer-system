package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import com.dealership.api.dealer.DealerService;
import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.vehicle.dto.VehicleRequestDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleMapper vehicleMapper;

    @Mock
    private DealerService dealerService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private VehicleService vehicleService;

    private VehicleRequestDTO requestDTO;
    private Vehicle vehicleEntity;
    private VehicleResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new VehicleRequestDTO("Toyota", "Corolla", 2024, "ABC1D23", FuelType.FLEX, 1L);
        vehicleEntity = Vehicle.builder()
                .id(10L)
                .brand("Toyota")
                .model("Corolla")
                .year(2024)
                .plate("ABC1D23")
                .fuelType(FuelType.FLEX)
                .build();

        responseDTO = new VehicleResponseDTO(10L, "Toyota", "Corolla", 2024, "ABC1D23", FuelType.FLEX, 1L, "Concessionária SP", null, null);
    }

    @Test
    @DisplayName("Deve cadastrar veículo com sucesso e associar à concessionária")
    void createVehicle_Success() {
        Dealer dealer = Dealer.builder().id(1L).name("Concessionária SP").build();

        when(vehicleRepository.existsByPlate(requestDTO.plate())).thenReturn(false);
        when(vehicleMapper.toEntity(requestDTO)).thenReturn(vehicleEntity);
        when(dealerService.getDealerEntity(1L)).thenReturn(dealer);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicleEntity);
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        VehicleResponseDTO result = vehicleService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(10L);
        verify(vehicleRepository, times(1)).save(vehicleEntity);
        verify(eventPublisher, times(1)).publishEvent(any());
    }

    @Test
    @DisplayName("Deve lançar BusinessException quando a placa já estiver cadastrada")
    void createVehicle_ThrowsBusinessException_WhenPlateExists() {
        when(vehicleRepository.existsByPlate(requestDTO.plate())).thenReturn(true);

        assertThatThrownBy(() -> vehicleService.create(requestDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ABC1D23");

        verify(vehicleRepository, never()).save(any());
    }
}

package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import com.dealership.api.dealer.DealerService;
import com.dealership.api.shared.audit.AuditEvent;
import com.dealership.api.shared.exception.DuplicatePlateException;
import com.dealership.api.shared.exception.ResourceNotFoundException;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("unchecked")
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
    private Dealer dealerEntity;

    @BeforeEach
    void setUp() {
        dealerEntity = Dealer.builder().id(1L).name("Concessionária SP").build();
        requestDTO = new VehicleRequestDTO("Toyota", "Corolla", 2024, "ABC1D23", "Preto", FuelType.FLEX, 1L);
        vehicleEntity = Vehicle.builder()
                .id(10L)
                .brand("Toyota")
                .model("Corolla")
                .year(2024)
                .plate("ABC1D23")
                .color("Preto")
                .fuelType(FuelType.FLEX)
                .dealer(dealerEntity)
                .build();

        responseDTO = new VehicleResponseDTO(10L, "Toyota", "Corolla", 2024, "ABC1D23", "Preto", FuelType.FLEX, 1L,
                "Concessionária SP", null, null);
    }

    @Test
    @DisplayName("Deve buscar todos os veículos sem filtro de concessionária")
    void findAll_WithoutDealerId_Success() {
        when(vehicleRepository.findAll()).thenReturn(List.of(vehicleEntity));
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        List<VehicleResponseDTO> result = vehicleService.findAll(null);

        assertThat(result).hasSize(1);
        verify(vehicleRepository, times(1)).findAll();
        verify(vehicleRepository, never()).findByDealerId(any());
    }

    @Test
    @DisplayName("Deve buscar veículos paginados sem filtro de concessionária ou busca")
    void findAll_Pageable_WithoutDealerId_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        PageImpl<Vehicle> page = new PageImpl<>(List.of(vehicleEntity), pageable, 1);

        when(vehicleRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable))).thenReturn(page);
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        Page<VehicleResponseDTO> result = vehicleService.findAll(null, null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(vehicleRepository, times(1)).findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Deve buscar veículos paginados com filtro por termo de busca")
    void findAll_Pageable_WithSearch_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        PageImpl<Vehicle> page = new PageImpl<>(List.of(vehicleEntity), pageable, 1);

        when(vehicleRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable))).thenReturn(page);
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        Page<VehicleResponseDTO> result = vehicleService.findAll(1L, "Toyota", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(vehicleRepository, times(1)).findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Deve buscar veículos filtrados por concessionária")
    void findAll_WithDealerId_Success() {
        when(vehicleRepository.findByDealerId(1L)).thenReturn(List.of(vehicleEntity));
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        List<VehicleResponseDTO> result = vehicleService.findAll(1L);

        assertThat(result).hasSize(1);
        verify(vehicleRepository, times(1)).findByDealerId(1L);
        verify(vehicleRepository, never()).findAll();
    }

    @Test
    @DisplayName("Deve buscar veículo por ID com sucesso")
    void findById_Success() {
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicleEntity));
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        VehicleResponseDTO result = vehicleService.findById(10L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando veículo não for encontrado por ID")
    void findById_NotFound_ThrowsException() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Deve cadastrar veículo com sucesso associado a concessionária")
    void createVehicle_WithDealer_Success() {
        when(vehicleRepository.existsByPlate(requestDTO.plate())).thenReturn(false);
        when(vehicleMapper.toEntity(requestDTO)).thenReturn(vehicleEntity);
        when(dealerService.getDealerEntity(1L)).thenReturn(dealerEntity);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicleEntity);
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        VehicleResponseDTO result = vehicleService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(10L);
        verify(vehicleRepository, times(1)).save(vehicleEntity);
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
    }

    @Test
    @DisplayName("Deve cadastrar veículo com sucesso sem concessionária vinculada")
    void createVehicle_WithoutDealer_Success() {
        VehicleRequestDTO dtoWithoutDealer = new VehicleRequestDTO("Toyota", "Corolla", 2024, "ABC1D23", "Preto", FuelType.FLEX, null);
        Vehicle vehicleWithoutDealer = Vehicle.builder()
                .id(11L)
                .brand("Toyota")
                .model("Corolla")
                .year(2024)
                .plate("ABC1D23")
                .color("Preto")
                .fuelType(FuelType.FLEX)
                .dealer(null)
                .build();
        VehicleResponseDTO responseWithoutDealer = new VehicleResponseDTO(11L, "Toyota", "Corolla", 2024, "ABC1D23", "Preto", FuelType.FLEX, null, null, null, null);

        when(vehicleRepository.existsByPlate(dtoWithoutDealer.plate())).thenReturn(false);
        when(vehicleMapper.toEntity(dtoWithoutDealer)).thenReturn(vehicleWithoutDealer);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicleWithoutDealer);
        when(vehicleMapper.toDTO(vehicleWithoutDealer)).thenReturn(responseWithoutDealer);

        VehicleResponseDTO result = vehicleService.create(dtoWithoutDealer);

        assertThat(result).isNotNull();
        assertThat(result.dealerId()).isNull();
        verify(dealerService, never()).getDealerEntity(any());
        verify(vehicleRepository, times(1)).save(vehicleWithoutDealer);
    }

    @Test
    @DisplayName("Deve lançar DuplicatePlateException quando a placa já estiver cadastrada na criação")
    void createVehicle_ThrowsDuplicatePlateException_WhenPlateExists() {
        when(vehicleRepository.existsByPlate(requestDTO.plate())).thenReturn(true);

        assertThatThrownBy(() -> vehicleService.create(requestDTO))
                .isInstanceOf(DuplicatePlateException.class)
                .hasMessageContaining("ABC1D23");

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve atualizar veículo com sucesso trocando de concessionária")
    void updateVehicle_ChangeDealer_Success() {
        Dealer newDealer = Dealer.builder().id(2L).name("Concessionária RJ").build();
        VehicleRequestDTO updateDTO = new VehicleRequestDTO("Toyota", "Corolla Cross", 2025, "ABC1D23", "Branco", FuelType.HIBRIDO, 2L);

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicleEntity));
        when(vehicleRepository.existsByPlateAndIdNot(updateDTO.plate(), 10L)).thenReturn(false);
        when(dealerService.getDealerEntity(2L)).thenReturn(newDealer);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicleEntity);
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        VehicleResponseDTO result = vehicleService.update(10L, updateDTO);

        assertThat(result).isNotNull();
        verify(dealerService, times(1)).getDealerEntity(2L);
        verify(vehicleRepository, times(1)).save(vehicleEntity);
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
    }

    @Test
    @DisplayName("Deve atualizar veículo removendo a concessionária vinculada")
    void updateVehicle_RemoveDealer_Success() {
        VehicleRequestDTO updateDTO = new VehicleRequestDTO("Toyota", "Corolla", 2024, "ABC1D23", "Preto", FuelType.FLEX, null);

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicleEntity));
        when(vehicleRepository.existsByPlateAndIdNot(updateDTO.plate(), 10L)).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicleEntity);
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        VehicleResponseDTO result = vehicleService.update(10L, updateDTO);

        assertThat(result).isNotNull();
        assertThat(vehicleEntity.getDealer()).isNull();
        verify(dealerService, never()).getDealerEntity(any());
        verify(vehicleRepository, times(1)).save(vehicleEntity);
    }

    @Test
    @DisplayName("Deve lançar DuplicatePlateException quando a placa pertencer a outro veículo na atualização")
    void updateVehicle_ThrowsDuplicatePlateException_WhenPlateExists() {
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicleEntity));
        when(vehicleRepository.existsByPlateAndIdNot(requestDTO.plate(), 10L)).thenReturn(true);

        assertThatThrownBy(() -> vehicleService.update(10L, requestDTO))
                .isInstanceOf(DuplicatePlateException.class)
                .hasMessageContaining("ABC1D23");

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao tentar atualizar veículo inexistente")
    void updateVehicle_NotFound_ThrowsException() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.update(99L, requestDTO))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Deve associar veículo a uma concessionária com sucesso")
    void associateDealer_Success() {
        Dealer newDealer = Dealer.builder().id(2L).name("Concessionária RJ").build();

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicleEntity));
        when(dealerService.getDealerEntity(2L)).thenReturn(newDealer);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicleEntity);
        when(vehicleMapper.toDTO(vehicleEntity)).thenReturn(responseDTO);

        VehicleResponseDTO result = vehicleService.associateDealer(10L, 2L);

        assertThat(result).isNotNull();
        assertThat(vehicleEntity.getDealer()).isEqualTo(newDealer);
        verify(vehicleRepository, times(1)).save(vehicleEntity);
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
    }

    @Test
    @DisplayName("Deve excluir veículo com sucesso")
    void deleteVehicle_Success() {
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicleEntity));

        vehicleService.delete(10L);

        verify(vehicleRepository, times(1)).delete(vehicleEntity);
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao tentar excluir veículo inexistente")
    void deleteVehicle_NotFound_ThrowsException() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(vehicleRepository, never()).delete(any(Vehicle.class));
    }
}

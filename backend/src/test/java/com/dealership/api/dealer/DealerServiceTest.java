package com.dealership.api.dealer;

import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.shared.audit.AuditEvent;
import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.shared.exception.ResourceNotFoundException;
import com.dealership.api.shared.util.CnpjUtils;
import com.dealership.api.vehicle.Vehicle;
import com.dealership.api.viacep.ViaCepService;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
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
import org.springframework.web.client.ResourceAccessException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DealerServiceTest {

    @Mock
    private DealerRepository dealerRepository;

    @Mock
    private DealerMapper dealerMapper;

    @Mock
    private ViaCepService viaCepService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private DealerService dealerService;

    private DealerRequestDTO requestDTO;
    private Dealer dealerEntity;
    private DealerResponseDTO responseDTO;
    private ViaCepResponseDTO viaCepDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new DealerRequestDTO("Concessionária SP", "12.345.678/0001-95", "01001-000");
        String cleanCnpj = CnpjUtils.normalize(requestDTO.cnpj());
        String cleanCep = "01001000";

        dealerEntity = Dealer.builder()
                .id(1L)
                .name("Concessionária SP")
                .cnpj(cleanCnpj)
                .cep(cleanCep)
                .street("Praça da Sé")
                .neighborhood("Sé")
                .city("São Paulo")
                .state("SP")
                .vehicles(new ArrayList<>())
                .build();

        responseDTO = new DealerResponseDTO(1L, "Concessionária SP", cleanCnpj, cleanCep,
                "Praça da Sé", "Sé", "São Paulo", "SP", 0, null, null);

        viaCepDTO = new ViaCepResponseDTO("01001-000", "Praça da Sé", "Sé", "São Paulo", "SP", false);
    }

    @Test
    @DisplayName("Deve buscar todas as concessionárias com sucesso")
    void findAll_Success() {
        when(dealerRepository.findAll()).thenReturn(List.of(dealerEntity));
        when(dealerMapper.toDTO(dealerEntity)).thenReturn(responseDTO);

        List<DealerResponseDTO> result = dealerService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(1L);
        verify(dealerRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve buscar concessionárias paginadas com sucesso")
    void findAll_Pageable_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        PageImpl<Dealer> page = new PageImpl<>(List.of(dealerEntity), pageable, 1);

        when(dealerRepository.findAll(pageable)).thenReturn(page);
        when(dealerMapper.toDTO(dealerEntity)).thenReturn(responseDTO);

        Page<DealerResponseDTO> result = dealerService.findAll(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(1L);
        verify(dealerRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Deve buscar concessionária por ID com sucesso")
    void findById_Success() {
        when(dealerRepository.findById(1L)).thenReturn(Optional.of(dealerEntity));
        when(dealerMapper.toDTO(dealerEntity)).thenReturn(responseDTO);

        DealerResponseDTO result = dealerService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando concessionária não for encontrada")
    void findById_NotFound_ThrowsException() {
        when(dealerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> dealerService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Mock
    private DealerPersistenceService dealerPersistenceService;

    @Test
    @DisplayName("Deve criar concessionária com sucesso consultando ViaCEP antes de delegar à persistência transacional")
    void createDealer_Success() {
        String cleanCnpj = CnpjUtils.normalize(requestDTO.cnpj());
        String cleanCep = "01001000";

        when(viaCepService.fetchAddressOrFallback(cleanCep, requestDTO.street(), requestDTO.neighborhood(), requestDTO.city(), requestDTO.state())).thenReturn(viaCepDTO);
        when(dealerPersistenceService.saveNewDealer(requestDTO, cleanCnpj, cleanCep, viaCepDTO)).thenReturn(responseDTO);

        DealerResponseDTO result = dealerService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.street()).isEqualTo("Praça da Sé");

        // Verifica que a busca externa via ViaCEP foi executada ANTES da delegacao transacional
        inOrder(viaCepService, dealerPersistenceService)
                .verify(viaCepService).fetchAddressOrFallback(cleanCep, requestDTO.street(), requestDTO.neighborhood(), requestDTO.city(), requestDTO.state());
        inOrder(viaCepService, dealerPersistenceService)
                .verify(dealerPersistenceService).saveNewDealer(requestDTO, cleanCnpj, cleanCep, viaCepDTO);
    }

    @Test
    @DisplayName("Deve propagar exceção de timeout do ViaCEP sem acionar a persistência transacional")
    void createDealer_ViaCepTimeout_PropagatesException() {
        String cleanCep = "01001000";
        when(viaCepService.fetchAddressOrFallback(cleanCep, requestDTO.street(), requestDTO.neighborhood(), requestDTO.city(), requestDTO.state()))
                .thenThrow(new ResourceAccessException("Connection timed out"));

        assertThatThrownBy(() -> dealerService.create(requestDTO))
                .isInstanceOf(ResourceAccessException.class);

        verify(dealerPersistenceService, never()).saveNewDealer(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Deve propagar BusinessException de CEP inválido sem acionar a persistência transacional")
    void createDealer_ViaCepInvalidCep_PropagatesException() {
        String cleanCep = "01001000";
        when(viaCepService.fetchAddressOrFallback(cleanCep, requestDTO.street(), requestDTO.neighborhood(), requestDTO.city(), requestDTO.state()))
                .thenThrow(new BusinessException("CEP inválido"));

        assertThatThrownBy(() -> dealerService.create(requestDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessage("CEP inválido");

        verify(dealerPersistenceService, never()).saveNewDealer(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Deve atualizar concessionária com sucesso alterando CNPJ e CEP com busca ViaCEP prévia")
    void updateDealer_Success() {
        String cleanCnpj = CnpjUtils.normalize(requestDTO.cnpj());
        String cleanCep = "01001000";

        when(dealerRepository.findById(1L)).thenReturn(Optional.of(dealerEntity));
        when(viaCepService.fetchAddressOrFallback(cleanCep, requestDTO.street(), requestDTO.neighborhood(), requestDTO.city(), requestDTO.state())).thenReturn(viaCepDTO);
        when(dealerPersistenceService.saveUpdatedDealer(dealerEntity, requestDTO, cleanCnpj, cleanCep, viaCepDTO)).thenReturn(responseDTO);

        DealerResponseDTO result = dealerService.update(1L, requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        verify(viaCepService, times(1)).fetchAddressOrFallback(cleanCep, requestDTO.street(), requestDTO.neighborhood(), requestDTO.city(), requestDTO.state());
        verify(dealerPersistenceService, times(1)).saveUpdatedDealer(dealerEntity, requestDTO, cleanCnpj, cleanCep, viaCepDTO);
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao tentar atualizar concessionária inexistente")
    void updateDealer_NotFound_ThrowsException() {
        when(dealerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> dealerService.update(99L, requestDTO))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Deve excluir concessionária com sucesso desvinculando veículos associados")
    void deleteDealer_Success() {
        Vehicle vehicle = Vehicle.builder().id(10L).dealer(dealerEntity).build();
        dealerEntity.setVehicles(List.of(vehicle));

        when(dealerRepository.findById(1L)).thenReturn(Optional.of(dealerEntity));

        dealerService.delete(1L);

        assertThat(vehicle.getDealer()).isNull();
        verify(dealerRepository, times(1)).delete(dealerEntity);
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
    }

    @Test
    @DisplayName("Deve excluir concessionária com lista de veículos nula com sucesso")
    void deleteDealer_NullVehiclesList_Success() {
        dealerEntity.setVehicles(null);

        when(dealerRepository.findById(1L)).thenReturn(Optional.of(dealerEntity));

        dealerService.delete(1L);

        verify(dealerRepository, times(1)).delete(dealerEntity);
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao tentar excluir concessionária inexistente")
    void deleteDealer_NotFound_ThrowsException() {
        when(dealerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> dealerService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

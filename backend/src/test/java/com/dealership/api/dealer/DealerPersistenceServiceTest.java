package com.dealership.api.dealer;

import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.shared.audit.AuditEvent;
import com.dealership.api.shared.exception.DuplicateCnpjException;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
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
class DealerPersistenceServiceTest {

    @Mock
    private DealerRepository dealerRepository;

    @Mock
    private DealerMapper dealerMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private DealerPersistenceService dealerPersistenceService;

    private DealerRequestDTO requestDTO;
    private Dealer dealerEntity;
    private DealerResponseDTO responseDTO;
    private ViaCepResponseDTO viaCepDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new DealerRequestDTO("Concessionária SP", "12.345.678/0001-95", "01001-000");
        dealerEntity = Dealer.builder()
                .id(1L)
                .name("Concessionária SP")
                .cnpj("12345678000195")
                .cep("01001000")
                .street("Praça da Sé")
                .neighborhood("Sé")
                .city("São Paulo")
                .state("SP")
                .build();

        responseDTO = new DealerResponseDTO(1L, "Concessionária SP", "12345678000195", "01001000",
                "Praça da Sé", "Sé", "São Paulo", "SP", 0, null, null);

        viaCepDTO = new ViaCepResponseDTO("01001-000", "Praça da Sé", "Sé", "São Paulo", "SP", false);
    }

    @Test
    @DisplayName("Deve persistir nova concessionária com sucesso")
    void saveNewDealer_Success() {
        when(dealerRepository.existsByCnpj("12345678000195")).thenReturn(false);
        when(dealerMapper.toEntity(requestDTO)).thenReturn(dealerEntity);
        when(dealerRepository.save(any(Dealer.class))).thenReturn(dealerEntity);
        when(dealerMapper.toDTO(dealerEntity)).thenReturn(responseDTO);

        DealerResponseDTO result = dealerPersistenceService.saveNewDealer(requestDTO, "12345678000195", "01001000", viaCepDTO);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        verify(dealerRepository, times(1)).save(dealerEntity);
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
    }

    @Test
    @DisplayName("Deve lançar DuplicateCnpjException ao tentar salvar nova concessionária com CNPJ duplicado")
    void saveNewDealer_DuplicateCnpj_ThrowsException() {
        when(dealerRepository.existsByCnpj("12345678000195")).thenReturn(true);

        assertThatThrownBy(() -> dealerPersistenceService.saveNewDealer(requestDTO, "12345678000195", "01001000", viaCepDTO))
                .isInstanceOf(DuplicateCnpjException.class);

        verify(dealerRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    @DisplayName("Deve persistir atualização de concessionária com sucesso")
    void saveUpdatedDealer_Success() {
        when(dealerRepository.existsByCnpjAndIdNot("12345678000195", 1L)).thenReturn(false);
        when(dealerRepository.save(any(Dealer.class))).thenReturn(dealerEntity);
        when(dealerMapper.toDTO(dealerEntity)).thenReturn(responseDTO);

        DealerResponseDTO result = dealerPersistenceService.saveUpdatedDealer(dealerEntity, requestDTO, "12345678000195", "01001000", viaCepDTO);

        assertThat(result).isNotNull();
        verify(dealerRepository, times(1)).save(dealerEntity);
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
    }
}

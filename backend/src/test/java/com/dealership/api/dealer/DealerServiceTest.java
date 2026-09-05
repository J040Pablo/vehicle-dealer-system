package com.dealership.api.dealer;

import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.shared.audit.AuditEvent;
import com.dealership.api.shared.exception.DuplicateCnpjException;
import com.dealership.api.shared.util.CnpjUtils;
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
                .build();

        responseDTO = new DealerResponseDTO(1L, "Concessionária SP", cleanCnpj, cleanCep,
                "Praça da Sé", "Sé", "São Paulo", "SP", 0, null, null);

        viaCepDTO = new ViaCepResponseDTO("01001-000", "Praça da Sé", "Sé", "São Paulo", "SP", false);
    }

    @Test
    @DisplayName("Deve criar concessionária com sucesso e normalizar CNPJ e CEP")
    void createDealer_Success() {
        String cleanCnpj = CnpjUtils.normalize(requestDTO.cnpj());
        String cleanCep = "01001000";

        when(dealerRepository.existsByCnpj(cleanCnpj)).thenReturn(false);
        when(dealerMapper.toEntity(requestDTO)).thenReturn(dealerEntity);
        when(viaCepService.fetchAddress(cleanCep)).thenReturn(viaCepDTO);
        when(dealerRepository.save(any(Dealer.class))).thenReturn(dealerEntity);
        when(dealerMapper.toDTO(dealerEntity)).thenReturn(responseDTO);

        DealerResponseDTO result = dealerService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.street()).isEqualTo("Praça da Sé");
        verify(eventPublisher, times(1)).publishEvent(any(AuditEvent.class));
        verify(dealerRepository, times(1)).save(dealerEntity);
    }

    @Test
    @DisplayName("Deve atualizar concessionária com sucesso")
    void updateDealer_Success() {
        String cleanCnpj = CnpjUtils.normalize(requestDTO.cnpj());
        String cleanCep = "01001000";

        when(dealerRepository.findById(1L)).thenReturn(Optional.of(dealerEntity));
        when(dealerRepository.existsByCnpjAndIdNot(cleanCnpj, 1L)).thenReturn(false);
        when(viaCepService.fetchAddress(cleanCep)).thenReturn(viaCepDTO);
        when(dealerRepository.save(any(Dealer.class))).thenReturn(dealerEntity);
        when(dealerMapper.toDTO(dealerEntity)).thenReturn(responseDTO);

        DealerResponseDTO result = dealerService.update(1L, requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        verify(dealerRepository, times(1)).save(dealerEntity);
    }

    @Test
    @DisplayName("Deve lançar DuplicateCnpjException ao tentar criar com CNPJ duplicado")
    void createDealer_ThrowsDuplicateCnpjException() {
        String cleanCnpj = CnpjUtils.normalize(requestDTO.cnpj());
        when(dealerRepository.existsByCnpj(cleanCnpj)).thenReturn(true);

        assertThatThrownBy(() -> dealerService.create(requestDTO))
                .isInstanceOf(DuplicateCnpjException.class);

        verify(dealerRepository, never()).save(any());
        verify(viaCepService, never()).fetchAddress(any());
    }

    @Test
    @DisplayName("Deve lançar DuplicateCnpjException ao tentar atualizar para um CNPJ de outra concessionária")
    void updateDealer_ThrowsDuplicateCnpjException() {
        String cleanCnpj = CnpjUtils.normalize(requestDTO.cnpj());

        when(dealerRepository.findById(1L)).thenReturn(Optional.of(dealerEntity));
        when(dealerRepository.existsByCnpjAndIdNot(cleanCnpj, 1L)).thenReturn(true);

        assertThatThrownBy(() -> dealerService.update(1L, requestDTO))
                .isInstanceOf(DuplicateCnpjException.class);

        verify(dealerRepository, never()).save(any());
    }
}

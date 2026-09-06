package com.dealership.api.dealer;

import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.shared.audit.AuditEvent;
import com.dealership.api.shared.exception.DuplicateCnpjException;
import com.dealership.api.shared.exception.ResourceNotFoundException;
import com.dealership.api.shared.util.CepUtils;
import com.dealership.api.shared.util.CnpjUtils;
import com.dealership.api.viacep.ViaCepService;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DealerService {

    private final DealerRepository dealerRepository;
    private final DealerMapper dealerMapper;
    private final ViaCepService viaCepService;
    private final DealerPersistenceService dealerPersistenceService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public Page<DealerResponseDTO> findAll(Pageable pageable) {
        return dealerRepository.findAll(pageable)
                .map(dealerMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<DealerResponseDTO> findAll() {
        return dealerRepository.findAll().stream()
                .map(dealerMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public DealerResponseDTO findById(Long id) {
        Dealer dealer = getDealerEntity(id);
        return dealerMapper.toDTO(dealer);
    }

    public DealerResponseDTO create(DealerRequestDTO dto) {
        String cleanCnpj = CnpjUtils.normalize(dto.cnpj());
        String cleanCep = CepUtils.normalize(dto.cep());

        log.info("Iniciando busca externa ViaCEP para cadastro de concessionária: CNPJ={}", cleanCnpj);

        // 1. Busca externa ViaCEP com fallback manual executada FORA da transação
        ViaCepResponseDTO addressDTO = viaCepService.fetchAddressOrFallback(
                cleanCep, dto.street(), dto.neighborhood(), dto.city(), dto.state()
        );

        // 2. Transação iniciada estritamente para validação de banco e persistência
        return dealerPersistenceService.saveNewDealer(dto, cleanCnpj, cleanCep, addressDTO);
    }

    public DealerResponseDTO update(Long id, DealerRequestDTO dto) {
        String cleanCnpj = CnpjUtils.normalize(dto.cnpj());
        String cleanCep = CepUtils.normalize(dto.cep());

        log.info("Atualizando concessionária com busca externa ViaCEP: ID={}", id);

        Dealer dealer = getDealerEntity(id);

        // 1. Busca externa ViaCEP com fallback manual executada FORA da transação
        ViaCepResponseDTO addressDTO = viaCepService.fetchAddressOrFallback(
                cleanCep, dto.street(), dto.neighborhood(), dto.city(), dto.state()
        );

        // 2. Transação iniciada estritamente para validação de banco e persistência
        return dealerPersistenceService.saveUpdatedDealer(dealer, dto, cleanCnpj, cleanCep, addressDTO);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Excluindo concessionária: ID={}", id);

        Dealer dealer = getDealerEntity(id);

        // Desvincular veículos associados
        if (dealer.getVehicles() != null) {
            dealer.getVehicles().forEach(v -> v.setDealer(null));
        }

        dealerRepository.delete(dealer);
        log.info("Concessionária excluída com sucesso: ID={}", id);

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "DEALER",
                id,
                "DELETE",
                "Deleted Dealer ID: " + id));
    }

    public Dealer getDealerEntity(Long id) {
        return dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Concessionária", id));
    }
}

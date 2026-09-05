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
    private final ApplicationEventPublisher eventPublisher;

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

    @Transactional
    public DealerResponseDTO create(DealerRequestDTO dto) {
        String cleanCnpj = CnpjUtils.normalize(dto.cnpj());
        String cleanCep = CepUtils.normalize(dto.cep());

        log.info("Iniciando cadastro de concessionária: CNPJ={}", cleanCnpj);

        if (dealerRepository.existsByCnpj(cleanCnpj)) {
            throw new DuplicateCnpjException(cleanCnpj);
        }

        Dealer dealer = dealerMapper.toEntity(dto);
        dealer.setCnpj(cleanCnpj);
        dealer.setCep(cleanCep);

        // Preenchimento de endereço via ViaCEP no backend
        ViaCepResponseDTO addressDTO = viaCepService.fetchAddress(cleanCep);
        dealer.setStreet(addressDTO.street());
        dealer.setNeighborhood(addressDTO.neighborhood());
        dealer.setCity(addressDTO.city());
        dealer.setState(addressDTO.state());

        Dealer saved = dealerRepository.save(dealer);
        log.info("Concessionária criada com sucesso: ID={}", saved.getId());

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "DEALER",
                saved.getId(),
                "CREATE",
                "Created Dealer: " + saved.getName() + " (CNPJ: " + saved.getCnpj() + ")"));

        return dealerMapper.toDTO(saved);
    }

    @Transactional
    public DealerResponseDTO update(Long id, DealerRequestDTO dto) {
        String cleanCnpj = CnpjUtils.normalize(dto.cnpj());
        String cleanCep = CepUtils.normalize(dto.cep());

        log.info("Atualizando concessionária: ID={}", id);

        Dealer dealer = getDealerEntity(id);

        if (dealerRepository.existsByCnpjAndIdNot(cleanCnpj, id)) {
            throw new DuplicateCnpjException(cleanCnpj);
        }

        dealerMapper.updateEntityFromDTO(dto, dealer);
        dealer.setCnpj(cleanCnpj);
        dealer.setCep(cleanCep);

        // Atualização de endereço caso o CEP tenha mudado ou precise revalidar
        ViaCepResponseDTO addressDTO = viaCepService.fetchAddress(cleanCep);
        dealer.setStreet(addressDTO.street());
        dealer.setNeighborhood(addressDTO.neighborhood());
        dealer.setCity(addressDTO.city());
        dealer.setState(addressDTO.state());

        Dealer updated = dealerRepository.save(dealer);
        log.info("Concessionária atualizada com sucesso: ID={}", updated.getId());

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "DEALER",
                updated.getId(),
                "UPDATE",
                "Updated Dealer: " + updated.getName() + " (CNPJ: " + updated.getCnpj() + ")"));

        return dealerMapper.toDTO(updated);
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

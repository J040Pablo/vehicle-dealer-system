package com.dealership.api.dealer;

import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.shared.audit.AuditEvent;
import com.dealership.api.shared.exception.DuplicateCnpjException;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DealerPersistenceService {

    private final DealerRepository dealerRepository;
    private final DealerMapper dealerMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public DealerResponseDTO saveNewDealer(DealerRequestDTO dto, String cleanCnpj, String cleanCep, ViaCepResponseDTO addressDTO) {
        if (dealerRepository.existsByCnpj(cleanCnpj)) {
            throw new DuplicateCnpjException(cleanCnpj);
        }

        Dealer dealer = dealerMapper.toEntity(dto);
        dealer.setCnpj(cleanCnpj);
        dealer.setCep(cleanCep);
        dealer.setStreet(addressDTO.street());
        dealer.setNeighborhood(addressDTO.neighborhood());
        dealer.setCity(addressDTO.city());
        dealer.setState(addressDTO.state());

        Dealer saved = dealerRepository.save(dealer);
        log.info("Concessionária criada com sucesso em transação: ID={}", saved.getId());

        eventPublisher.publishEvent(new AuditEvent(
                "DEALER",
                saved.getId(),
                "CREATE",
                "Created Dealer: " + saved.getName() + " (CNPJ: " + saved.getCnpj() + ")"));

        return dealerMapper.toDTO(saved);
    }

    @Transactional
    public DealerResponseDTO saveUpdatedDealer(Dealer dealer, DealerRequestDTO dto, String cleanCnpj, String cleanCep, ViaCepResponseDTO addressDTO) {
        if (dealerRepository.existsByCnpjAndIdNot(cleanCnpj, dealer.getId())) {
            throw new DuplicateCnpjException(cleanCnpj);
        }

        dealerMapper.updateEntityFromDTO(dto, dealer);
        dealer.setCnpj(cleanCnpj);
        dealer.setCep(cleanCep);
        dealer.setStreet(addressDTO.street());
        dealer.setNeighborhood(addressDTO.neighborhood());
        dealer.setCity(addressDTO.city());
        dealer.setState(addressDTO.state());

        Dealer updated = dealerRepository.save(dealer);
        log.info("Concessionária atualizada com sucesso em transação: ID={}", updated.getId());

        eventPublisher.publishEvent(new AuditEvent(
                "DEALER",
                updated.getId(),
                "UPDATE",
                "Updated Dealer: " + updated.getName() + " (CNPJ: " + updated.getCnpj() + ")"));

        return dealerMapper.toDTO(updated);
    }
}

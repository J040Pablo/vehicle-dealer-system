package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import com.dealership.api.dealer.DealerService;
import com.dealership.api.shared.audit.AuditEvent;
import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.shared.exception.ResourceNotFoundException;
import com.dealership.api.vehicle.dto.VehicleRequestDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final DealerService dealerService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<VehicleResponseDTO> findAll(Long dealerId) {
        if (dealerId != null) {
            log.info("Buscando veículos da concessionária ID: {}", dealerId);
            return vehicleRepository.findByDealerId(dealerId).stream()
                    .map(vehicleMapper::toDTO)
                    .toList();
        }
        return vehicleRepository.findAll().stream()
                .map(vehicleMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public VehicleResponseDTO findById(Long id) {
        Vehicle vehicle = getVehicleEntity(id);
        return vehicleMapper.toDTO(vehicle);
    }

    @Transactional
    public VehicleResponseDTO create(VehicleRequestDTO dto) {
        log.info("Cadastrando veículo: Marca={} Modelo={} Placa={}", dto.brand(), dto.model(), dto.plate());

        if (vehicleRepository.existsByPlate(dto.plate())) {
            throw new BusinessException("Já existe um veículo cadastrado com a placa: " + dto.plate());
        }

        Vehicle vehicle = vehicleMapper.toEntity(dto);

        if (dto.dealerId() != null) {
            Dealer dealer = dealerService.getDealerEntity(dto.dealerId());
            vehicle.setDealer(dealer);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Veículo cadastrado com sucesso: ID={}", saved.getId());

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "VEHICLE",
                saved.getId(),
                "CREATE",
                "Created Vehicle: " + saved.getBrand() + " " + saved.getModel() + " (Plate: " + saved.getPlate() + ")"
        ));

        return vehicleMapper.toDTO(saved);
    }

    @Transactional
    public VehicleResponseDTO update(Long id, VehicleRequestDTO dto) {
        log.info("Atualizando veículo: ID={}", id);

        Vehicle vehicle = getVehicleEntity(id);

        if (vehicleRepository.existsByPlateAndIdNot(dto.plate(), id)) {
            throw new BusinessException("Já existe outro veículo cadastrado com a placa: " + dto.plate());
        }

        vehicleMapper.updateEntityFromDTO(dto, vehicle);

        if (dto.dealerId() != null) {
            Dealer dealer = dealerService.getDealerEntity(dto.dealerId());
            vehicle.setDealer(dealer);
        } else {
            vehicle.setDealer(null);
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        log.info("Veículo atualizado com sucesso: ID={}", updated.getId());

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "VEHICLE",
                updated.getId(),
                "UPDATE",
                "Updated Vehicle: " + updated.getBrand() + " " + updated.getModel() + " (Plate: " + updated.getPlate() + ")"
        ));

        return vehicleMapper.toDTO(updated);
    }

    @Transactional
    public VehicleResponseDTO associateDealer(Long vehicleId, Long dealerId) {
        log.info("Associando veículo ID={} à concessionária ID={}", vehicleId, dealerId);

        Vehicle vehicle = getVehicleEntity(vehicleId);
        Dealer dealer = dealerService.getDealerEntity(dealerId);

        vehicle.setDealer(dealer);
        Vehicle updated = vehicleRepository.save(vehicle);

        eventPublisher.publishEvent(new AuditEvent(
                "VEHICLE",
                vehicleId,
                "UPDATE",
                "Associated Vehicle ID " + vehicleId + " to Dealer ID " + dealerId
        ));

        return vehicleMapper.toDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Excluindo veículo: ID={}", id);

        Vehicle vehicle = getVehicleEntity(id);
        vehicleRepository.delete(vehicle);

        log.info("Veículo excluído com sucesso: ID={}", id);

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "VEHICLE",
                id,
                "DELETE",
                "Deleted Vehicle ID: " + id
        ));
    }

    private Vehicle getVehicleEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id));
    }
}

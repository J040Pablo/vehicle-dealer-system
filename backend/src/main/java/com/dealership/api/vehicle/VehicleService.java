package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import com.dealership.api.dealer.DealerService;
import com.dealership.api.shared.audit.AuditEvent;
import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.shared.exception.DuplicatePlateException;
import com.dealership.api.shared.exception.ResourceNotFoundException;
import com.dealership.api.vehicle.dto.VehicleRequestDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import com.dealership.api.shared.dto.PagedResponseDTO;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final DealerService dealerService;
    private final ApplicationEventPublisher eventPublisher;
    private final com.dealership.api.config.StorageService storageService;

    @Transactional(readOnly = true)
    @Cacheable(
            value = "filters",
            key = "'vehicles:' + (#dealerId != null ? #dealerId : 'all') + ':' + (#search != null && !#search.isBlank() ? #search.trim() : 'none') + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort.toString()",
            sync = true
    )
    public PagedResponseDTO<VehicleResponseDTO> findAll(Long dealerId, String search, Pageable pageable) {
        log.info("Buscando veículos com filtro: dealerId={}, search={}", dealerId, search);
        Page<VehicleResponseDTO> pageResult = vehicleRepository.findAll(VehicleSpecification.filter(dealerId, search), pageable)
                .map(vehicleMapper::toDTO);
        return PagedResponseDTO.from(pageResult);
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<VehicleResponseDTO> findAll(Long dealerId, Pageable pageable) {
        return findAll(dealerId, null, pageable);
    }

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
    @Cacheable(value = "vehicles", key = "'vehicle:' + #id", sync = true)
    public VehicleResponseDTO findById(Long id) {
        Vehicle vehicle = getVehicleEntity(id);
        return vehicleMapper.toDTO(vehicle);
    }

    private static final Pattern PLATE_PATTERN = Pattern.compile("^(?:[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})$");

    private String normalizePlate(String plate) {
        if (plate == null) return null;
        return plate.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
    }

    private String validateAndNormalizePlate(String rawPlate) {
        if (rawPlate == null || rawPlate.isBlank()) {
            throw new BusinessException("A placa do veículo é obrigatória.");
        }
        String normalized = normalizePlate(rawPlate);
        if (!PLATE_PATTERN.matcher(normalized).matches()) {
            throw new BusinessException("Placa inválida. Use ABC1234 ou ABC1D23.");
        }
        return normalized;
    }

    private String normalizeImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }
        String trimmed = imageUrl.trim();
        try {
            java.net.URI uri = java.net.URI.create(trimmed);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                throw new BusinessException("URL de imagem inválida.");
            }
        } catch (IllegalArgumentException e) {
            throw new BusinessException("URL de imagem inválida.");
        }
        return trimmed;
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "filters", allEntries = true),
            @CacheEvict(value = "dashboard", allEntries = true)
    })
    public VehicleResponseDTO create(VehicleRequestDTO dto) {
        String normalizedPlate = validateAndNormalizePlate(dto.plate());
        String normalizedImageUrl = normalizeImageUrl(dto.imageUrl());
        log.info("Cadastrando veículo: Marca={} Modelo={} Placa={}", dto.brand(), dto.model(), normalizedPlate);

        if (vehicleRepository.existsByPlate(normalizedPlate)) {
            throw new DuplicatePlateException(normalizedPlate);
        }

        VehicleRequestDTO normalizedDto = new VehicleRequestDTO(
                dto.brand(), dto.model(), dto.year(), normalizedPlate, dto.color(), dto.fuelType(), dto.chassis(), dto.value(), normalizedImageUrl, dto.dealerId()
        );

        Vehicle vehicle = vehicleMapper.toEntity(normalizedDto);

        if (dto.dealerId() != null) {
            Dealer dealer = dealerService.getDealerEntity(dto.dealerId());
            vehicle.assignDealer(dealer);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Evento de negócio: operation=VEHICLE_CREATED entityId={} brand={} model={} plate={}", saved.getId(), saved.getBrand(), saved.getModel(), saved.getPlate());

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "VEHICLE",
                saved.getId(),
                "CREATE",
                "Created Vehicle: " + saved.getBrand() + " " + saved.getModel() + " (Plate: " + saved.getPlate()
                        + ")"));

        return vehicleMapper.toDTO(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "vehicles", key = "'vehicle:' + #id"),
            @CacheEvict(value = "filters", allEntries = true),
            @CacheEvict(value = "dashboard", allEntries = true)
    })
    public VehicleResponseDTO update(Long id, VehicleRequestDTO dto) {
        log.info("Atualizando veículo: ID={}", id);

        Vehicle vehicle = getVehicleEntity(id);
        Long previousDealerId = vehicle.getDealer() != null ? vehicle.getDealer().getId() : null;

        String normalizedPlate = validateAndNormalizePlate(dto.plate());
        String normalizedImageUrl = normalizeImageUrl(dto.imageUrl());
        if (vehicleRepository.existsByPlateAndIdNot(normalizedPlate, id)) {
            throw new DuplicatePlateException(normalizedPlate);
        }

        VehicleRequestDTO normalizedDto = new VehicleRequestDTO(
                dto.brand(), dto.model(), dto.year(), normalizedPlate, dto.color(), dto.fuelType(), dto.chassis(), dto.value(), normalizedImageUrl, dto.dealerId()
        );

        vehicleMapper.updateEntityFromDTO(normalizedDto, vehicle);

        if (dto.dealerId() != null) {
            Dealer dealer = dealerService.getDealerEntity(dto.dealerId());
            vehicle.assignDealer(dealer);
        } else {
            vehicle.removeDealer();
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        log.info("Evento de negócio: operation=VEHICLE_UPDATED entityId={} brand={} model={} plate={}", updated.getId(), updated.getBrand(), updated.getModel(), updated.getPlate());

        if (dto.dealerId() != null && !dto.dealerId().equals(previousDealerId)) {
            if (previousDealerId != null) {
                log.info("Evento de negócio: operation=VEHICLE_REASSIGNED entityId={} previousDealerId={} newDealerId={}", updated.getId(), previousDealerId, dto.dealerId());
            } else {
                log.info("Evento de negócio: operation=VEHICLE_ASSOCIATED entityId={} dealerId={}", updated.getId(), dto.dealerId());
            }
        }

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "VEHICLE",
                updated.getId(),
                "UPDATE",
                "Updated Vehicle: " + updated.getBrand() + " " + updated.getModel() + " (Plate: " + updated.getPlate()
                        + ")"));

        return vehicleMapper.toDTO(updated);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "vehicles", key = "'vehicle:' + #vehicleId"),
            @CacheEvict(value = "filters", allEntries = true),
            @CacheEvict(value = "dashboard", allEntries = true)
    })
    public VehicleResponseDTO associateDealer(Long vehicleId, Long dealerId) {
        log.info("Associando veículo ID={} à concessionária ID={}", vehicleId, dealerId);

        Vehicle vehicle = getVehicleEntity(vehicleId);
        Long previousDealerId = vehicle.getDealer() != null ? vehicle.getDealer().getId() : null;
        Dealer dealer = dealerService.getDealerEntity(dealerId);

        vehicle.assignDealer(dealer);
        Vehicle updated = vehicleRepository.save(vehicle);

        if (previousDealerId != null && !previousDealerId.equals(dealerId)) {
            log.info("Evento de negócio: operation=VEHICLE_REASSIGNED entityId={} previousDealerId={} newDealerId={}", vehicleId, previousDealerId, dealerId);
        } else {
            log.info("Evento de negócio: operation=VEHICLE_ASSOCIATED entityId={} dealerId={}", vehicleId, dealerId);
        }

        eventPublisher.publishEvent(new AuditEvent(
                "VEHICLE",
                vehicleId,
                "UPDATE",
                "Associated Vehicle ID " + vehicleId + " to Dealer ID " + dealerId));

        return vehicleMapper.toDTO(updated);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "vehicles", key = "'vehicle:' + #id"),
            @CacheEvict(value = "filters", allEntries = true),
            @CacheEvict(value = "dashboard", allEntries = true)
    })
    public VehicleResponseDTO uploadImage(Long id, org.springframework.web.multipart.MultipartFile file) {
        log.info("Upload de imagem para veículo ID={}", id);
        Vehicle vehicle = getVehicleEntity(id);
        if (vehicle.getImageUrl() != null) {
            storageService.deleteVehicleImage(vehicle.getImageUrl());
        }
        try {
            String imageUrl = storageService.uploadVehicleImage(id, file);
            vehicle.setImageUrl(imageUrl);
            Vehicle updated = vehicleRepository.save(vehicle);
            eventPublisher.publishEvent(new AuditEvent("VEHICLE", id, "IMAGE_UPLOAD", "Uploaded image: " + imageUrl));
            return vehicleMapper.toDTO(updated);
        } catch (java.io.IOException e) {
            throw new BusinessException("Erro ao realizar upload da imagem para o S3: " + e.getMessage());
        }
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "vehicles", key = "'vehicle:' + #id"),
            @CacheEvict(value = "filters", allEntries = true),
            @CacheEvict(value = "dashboard", allEntries = true)
    })
    public VehicleResponseDTO deleteImage(Long id) {
        log.info("Removendo imagem do veículo ID={}", id);
        Vehicle vehicle = getVehicleEntity(id);
        if (vehicle.getImageUrl() != null) {
            storageService.deleteVehicleImage(vehicle.getImageUrl());
            vehicle.setImageUrl(null);
            Vehicle updated = vehicleRepository.save(vehicle);
            eventPublisher.publishEvent(new AuditEvent("VEHICLE", id, "IMAGE_DELETE", "Deleted vehicle image"));
            return vehicleMapper.toDTO(updated);
        }
        return vehicleMapper.toDTO(vehicle);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "vehicles", key = "'vehicle:' + #id"),
            @CacheEvict(value = "filters", allEntries = true),
            @CacheEvict(value = "dashboard", allEntries = true)
    })
    public void delete(Long id) {
        log.info("Excluindo veículo: ID={}", id);

        Vehicle vehicle = getVehicleEntity(id);
        if (vehicle.getImageUrl() != null) {
            storageService.deleteVehicleImage(vehicle.getImageUrl());
        }
        vehicleRepository.delete(vehicle);

        log.info("Evento de negócio: operation=VEHICLE_DELETED entityId={}", id);

        // Disparo de Evento de Auditoria
        eventPublisher.publishEvent(new AuditEvent(
                "VEHICLE",
                id,
                "DELETE",
                "Deleted Vehicle ID: " + id));
    }

    @Transactional(readOnly = true)
    public com.dealership.api.config.PresignedUrlDTO generatePresignedUrl(Long id, String filename) {
        getVehicleEntity(id); // Valida existência do veículo
        return storageService.generatePresignedUploadUrl(id, filename);
    }

    private Vehicle getVehicleEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo", id));
    }
}

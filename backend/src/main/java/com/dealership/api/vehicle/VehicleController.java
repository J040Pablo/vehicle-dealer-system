package com.dealership.api.vehicle;

import com.dealership.api.vehicle.dto.VehicleRequestDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Endpoints para gerenciamento do catálogo de veículos")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "Listar veículos (filtro opcional por dealerId)")
    public ResponseEntity<List<VehicleResponseDTO>> findAll(@RequestParam(required = false) Long dealerId) {
        return ResponseEntity.ok(vehicleService.findAll(dealerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter veículo por ID")
    public ResponseEntity<VehicleResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo veículo")
    public ResponseEntity<VehicleResponseDTO> create(@Valid @RequestBody VehicleRequestDTO dto) {
        VehicleResponseDTO created = vehicleService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar veículo por ID")
    public ResponseEntity<VehicleResponseDTO> update(@PathVariable Long id, @Valid @RequestBody VehicleRequestDTO dto) {
        VehicleResponseDTO updated = vehicleService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/dealer/{dealerId}")
    @Operation(summary = "Associar ou alterar concessionária de um veículo")
    public ResponseEntity<VehicleResponseDTO> associateDealer(@PathVariable Long id, @PathVariable Long dealerId) {
        VehicleResponseDTO updated = vehicleService.associateDealer(id, dealerId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir veículo por ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

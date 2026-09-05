package com.dealership.api.dealer;

import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dealer")
@RequiredArgsConstructor
@Tag(name = "Dealer", description = "Endpoints para gerenciamento de concessionárias")
public class DealerController {

    private final DealerService dealerService;

    @GetMapping
    @Operation(summary = "Listar concessionárias com paginação")
    public ResponseEntity<Page<DealerResponseDTO>> findAll(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(dealerService.findAll(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter concessionária por ID")
    public ResponseEntity<DealerResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(dealerService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Cadastrar nova concessionária (Endereço é preenchido via ViaCEP)")
    public ResponseEntity<DealerResponseDTO> create(@Valid @RequestBody DealerRequestDTO dto) {
        DealerResponseDTO created = dealerService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dados de uma concessionária")
    public ResponseEntity<DealerResponseDTO> update(@PathVariable Long id, @Valid @RequestBody DealerRequestDTO dto) {
        DealerResponseDTO updated = dealerService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir concessionária por ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dealerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

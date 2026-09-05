package com.dealership.api.dealer.dto;

import java.time.OffsetDateTime;

public record DealerResponseDTO(
        Long id,
        String name,
        String cnpj,
        String cep,
        String street,
        String neighborhood,
        String city,
        String state,
        Integer totalVehicles,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}

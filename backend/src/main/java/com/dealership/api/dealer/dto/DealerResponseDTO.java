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
        String imageUrl,
        Integer totalVehicles,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public DealerResponseDTO(Long id, String name, String cnpj, String cep, String street, String neighborhood, String city, String state, Integer totalVehicles, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this(id, name, cnpj, cep, street, neighborhood, city, state, null, totalVehicles, createdAt, updatedAt);
    }
}

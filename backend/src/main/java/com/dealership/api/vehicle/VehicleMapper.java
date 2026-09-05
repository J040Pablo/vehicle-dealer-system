package com.dealership.api.vehicle;

import com.dealership.api.vehicle.dto.VehicleRequestDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VehicleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dealer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Vehicle toEntity(VehicleRequestDTO dto);

    @Mapping(target = "dealerId", source = "dealer.id")
    @Mapping(target = "dealerName", source = "dealer.name")
    VehicleResponseDTO toDTO(Vehicle vehicle);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dealer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDTO(VehicleRequestDTO dto, @MappingTarget Vehicle vehicle);
}

package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import com.dealership.api.vehicle.dto.VehicleRequestDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import java.time.OffsetDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-04T23:36:09-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class VehicleMapperImpl implements VehicleMapper {

    @Override
    public Vehicle toEntity(VehicleRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Vehicle.VehicleBuilder vehicle = Vehicle.builder();

        vehicle.brand( dto.brand() );
        vehicle.fuelType( dto.fuelType() );
        vehicle.model( dto.model() );
        vehicle.plate( dto.plate() );
        vehicle.year( dto.year() );

        return vehicle.build();
    }

    @Override
    public VehicleResponseDTO toDTO(Vehicle vehicle) {
        if ( vehicle == null ) {
            return null;
        }

        Long dealerId = null;
        String dealerName = null;
        Long id = null;
        String brand = null;
        String model = null;
        Integer year = null;
        String plate = null;
        FuelType fuelType = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;

        dealerId = vehicleDealerId( vehicle );
        dealerName = vehicleDealerName( vehicle );
        id = vehicle.getId();
        brand = vehicle.getBrand();
        model = vehicle.getModel();
        year = vehicle.getYear();
        plate = vehicle.getPlate();
        fuelType = vehicle.getFuelType();
        createdAt = vehicle.getCreatedAt();
        updatedAt = vehicle.getUpdatedAt();

        VehicleResponseDTO vehicleResponseDTO = new VehicleResponseDTO( id, brand, model, year, plate, fuelType, dealerId, dealerName, createdAt, updatedAt );

        return vehicleResponseDTO;
    }

    @Override
    public void updateEntityFromDTO(VehicleRequestDTO dto, Vehicle vehicle) {
        if ( dto == null ) {
            return;
        }

        vehicle.setBrand( dto.brand() );
        vehicle.setFuelType( dto.fuelType() );
        vehicle.setModel( dto.model() );
        vehicle.setPlate( dto.plate() );
        vehicle.setYear( dto.year() );
    }

    private Long vehicleDealerId(Vehicle vehicle) {
        if ( vehicle == null ) {
            return null;
        }
        Dealer dealer = vehicle.getDealer();
        if ( dealer == null ) {
            return null;
        }
        Long id = dealer.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String vehicleDealerName(Vehicle vehicle) {
        if ( vehicle == null ) {
            return null;
        }
        Dealer dealer = vehicle.getDealer();
        if ( dealer == null ) {
            return null;
        }
        String name = dealer.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}

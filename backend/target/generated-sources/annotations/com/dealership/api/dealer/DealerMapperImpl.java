package com.dealership.api.dealer;

import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import java.time.OffsetDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-04T23:36:09-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class DealerMapperImpl implements DealerMapper {

    @Override
    public Dealer toEntity(DealerRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Dealer.DealerBuilder dealer = Dealer.builder();

        dealer.cep( dto.cep() );
        dealer.cnpj( dto.cnpj() );
        dealer.name( dto.name() );

        return dealer.build();
    }

    @Override
    public DealerResponseDTO toDTO(Dealer dealer) {
        if ( dealer == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        String cnpj = null;
        String cep = null;
        String street = null;
        String neighborhood = null;
        String city = null;
        String state = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;

        id = dealer.getId();
        name = dealer.getName();
        cnpj = dealer.getCnpj();
        cep = dealer.getCep();
        street = dealer.getStreet();
        neighborhood = dealer.getNeighborhood();
        city = dealer.getCity();
        state = dealer.getState();
        createdAt = dealer.getCreatedAt();
        updatedAt = dealer.getUpdatedAt();

        Integer totalVehicles = dealer.getVehicles() != null ? dealer.getVehicles().size() : 0;

        DealerResponseDTO dealerResponseDTO = new DealerResponseDTO( id, name, cnpj, cep, street, neighborhood, city, state, totalVehicles, createdAt, updatedAt );

        return dealerResponseDTO;
    }

    @Override
    public void updateEntityFromDTO(DealerRequestDTO dto, Dealer dealer) {
        if ( dto == null ) {
            return;
        }

        dealer.setCep( dto.cep() );
        dealer.setCnpj( dto.cnpj() );
        dealer.setName( dto.name() );
    }
}

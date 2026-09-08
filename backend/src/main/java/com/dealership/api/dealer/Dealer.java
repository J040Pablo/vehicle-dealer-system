package com.dealership.api.dealer;

import com.dealership.api.shared.util.CepUtils;
import com.dealership.api.shared.util.CnpjUtils;
import com.dealership.api.vehicle.Vehicle;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dealers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dealer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "cnpj", nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(name = "cep", nullable = false, length = 8)
    private String cep;

    @Column(name = "street", nullable = false)
    private String street;

    @Column(name = "neighborhood", nullable = false)
    private String neighborhood;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "state", nullable = false, length = 2)
    private String state;

    @OneToMany(mappedBy = "dealer", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Vehicle> vehicles = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public void setCnpj(String cnpj) {
        this.cnpj = CnpjUtils.normalize(cnpj);
    }

    public void setCep(String cep) {
        this.cep = CepUtils.normalize(cep);
    }

    @PrePersist
    @PreUpdate
    public void normalizeFields() {
        if (this.cnpj != null) {
            this.cnpj = CnpjUtils.normalize(this.cnpj);
        }
        if (this.cep != null) {
            this.cep = CepUtils.normalize(this.cep);
        }
    }
}

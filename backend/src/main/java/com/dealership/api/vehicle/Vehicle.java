package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "brand", nullable = false, length = 100)
    private String brand;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "plate", nullable = false, unique = true, length = 7)
    private String plate;

    @Column(name = "color", nullable = false, length = 50)
    private String color;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "fuel_type", nullable = false, length = 20)
    private FuelType fuelType;

    @Column(name = "chassis", unique = true, length = 100)
    private String chassis;

    @Column(name = "value", precision = 15, scale = 2)
    private BigDecimal value;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dealer_id")
    private Dealer dealer;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public void assignDealer(Dealer dealer) {
        this.dealer = dealer;
    }

    public void removeDealer() {
        this.dealer = null;
    }

    public boolean isAssociatedWith(Long dealerId) {
        return this.dealer != null && this.dealer.getId() != null && this.dealer.getId().equals(dealerId);
    }

    @PrePersist
    @PreUpdate
    public void normalizeFields() {
        if (this.imageUrl != null) {
            String trimmed = this.imageUrl.trim();
            this.imageUrl = trimmed.isEmpty() ? null : trimmed;
        }
        if (this.chassis != null) {
            String trimmed = this.chassis.trim();
            this.chassis = trimmed.isEmpty() ? null : trimmed;
        }
    }
}

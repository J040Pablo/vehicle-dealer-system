package com.dealership.api.vehicle;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    @Override
    @EntityGraph(attributePaths = {"dealer"})
    Page<Vehicle> findAll(@Nullable Specification<Vehicle> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"dealer"})
    List<Vehicle> findAll(@Nullable Specification<Vehicle> spec);

    @Override
    @EntityGraph(attributePaths = {"dealer"})
    Optional<Vehicle> findOne(@Nullable Specification<Vehicle> spec);

    @Override
    @EntityGraph(attributePaths = {"dealer"})
    List<Vehicle> findAll();

    @Override
    @EntityGraph(attributePaths = {"dealer"})
    Optional<Vehicle> findById(Long id);

    @EntityGraph(attributePaths = {"dealer"})
    List<Vehicle> findByDealerId(Long dealerId);

    @EntityGraph(attributePaths = {"dealer"})
    Page<Vehicle> findByDealerId(Long dealerId, Pageable pageable);

    boolean existsByPlate(String plate);

    boolean existsByPlateAndIdNot(String plate, Long id);

    Optional<Vehicle> findByPlate(String plate);

    long countByDealerIsNull();

    @org.springframework.data.jpa.repository.Query("SELECT v.fuelType, COUNT(v) FROM Vehicle v GROUP BY v.fuelType")
    List<Object[]> countVehiclesByFuelType();
}

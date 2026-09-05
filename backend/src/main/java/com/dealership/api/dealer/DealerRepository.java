package com.dealership.api.dealer;

import com.dealership.api.shared.util.CnpjUtils;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DealerRepository extends JpaRepository<Dealer, Long> {

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Dealer d WHERE d.cnpj = :cnpj")
    boolean rawExistsByCnpj(@Param("cnpj") String cnpj);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Dealer d WHERE d.cnpj = :cnpj AND d.id <> :id")
    boolean rawExistsByCnpjAndIdNot(@Param("cnpj") String cnpj, @Param("id") Long id);

    @Query("SELECT d FROM Dealer d WHERE d.cnpj = :cnpj")
    Optional<Dealer> rawFindByCnpj(@Param("cnpj") String cnpj);

    default boolean existsByCnpj(String cnpj) {
        return rawExistsByCnpj(CnpjUtils.normalize(cnpj));
    }

    default boolean existsByCnpjAndIdNot(String cnpj, Long id) {
        return rawExistsByCnpjAndIdNot(CnpjUtils.normalize(cnpj), id);
    }

    default Optional<Dealer> findByCnpj(String cnpj) {
        return rawFindByCnpj(CnpjUtils.normalize(cnpj));
    }
}

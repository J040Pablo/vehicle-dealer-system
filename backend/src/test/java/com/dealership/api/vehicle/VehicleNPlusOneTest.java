package com.dealership.api.vehicle;

import com.dealership.api.dealer.Dealer;
import com.dealership.api.shared.dto.PagedResponseDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class VehicleNPlusOneTest {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private EntityManager entityManager;

    private SessionFactory sessionFactory;

    @BeforeEach
    void setUp() {
        sessionFactory = entityManager.getEntityManagerFactory().unwrap(SessionFactory.class);

        // Populate database with 5 distinct dealers and 10 vehicles
        for (int i = 1; i <= 5; i++) {
            Dealer dealer = Dealer.builder()
                    .name("Concessionaria " + i)
                    .cnpj(String.format("%014d", i))
                    .cep("0100100" + i)
                    .street("Rua " + i)
                    .neighborhood("Bairro " + i)
                    .city("Cidade " + i)
                    .state("SP")
                    .build();
            entityManager.persist(dealer);

            for (int j = 1; j <= 2; j++) {
                int vehicleIndex = (i - 1) * 2 + j;
                Vehicle vehicle = Vehicle.builder()
                        .brand("Marca " + vehicleIndex)
                        .model("Modelo " + vehicleIndex)
                        .year(2020 + vehicleIndex)
                        .plate(String.format("ABC%04d", vehicleIndex))
                        .color("Cor " + vehicleIndex)
                        .fuelType(FuelType.FLEX)
                        .dealer(dealer)
                        .build();
                entityManager.persist(vehicle);
            }
        }

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("Deve carregar veículos e concessionárias sem problema N+1 ao usar VehicleSpecification com paginação")
    void findAll_WithSpecificationAndPagination_ExecutesFixedNumberOfQueries() {
        Statistics stats = sessionFactory.getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        // Execution of paged specification search (page size = 5, total elements = 10 -> triggers count query + data query = 2 queries)
        PagedResponseDTO<VehicleResponseDTO> result = vehicleService.findAll(
                null,
                null,
                PageRequest.of(0, 5, Sort.by("id").ascending())
        );

        // 1. Validate page contents and size
        assertThat(result).isNotNull();
        assertThat(result.totalElements()).isEqualTo(10);
        assertThat(result.content()).hasSize(5);

        // 2. Validate correct eager mapping of dealer details without triggering lazy queries
        for (VehicleResponseDTO dto : result.content()) {
            assertThat(dto.dealerId()).isNotNull();
            assertThat(dto.dealerName()).startsWith("Concessionaria");
        }

        // 3. Validate query count: 1 count query + 1 data query with LEFT JOIN = 2 queries total
        // Without @EntityGraph, this would execute 1 count query + 1 vehicle query + 5 individual dealer queries (7 queries).
        long statementCount = stats.getPrepareStatementCount();
        assertThat(statementCount)
                .as("Deveria executar exatamente 2 queries SQL (1 count + 1 data fetch com JOIN), eliminando o problema N+1")
                .isEqualTo(2);
    }

    @Test
    @DisplayName("Deve carregar lista unpaginated de veículos de um Dealer em 1 única query com JOIN FETCH/EntityGraph")
    void findAll_UnpaginatedListByDealerId_ExecutesSingleQuery() {
        Statistics stats = sessionFactory.getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        // Get first dealer ID dynamically
        Dealer firstDealer = entityManager.createQuery("SELECT d FROM Dealer d", Dealer.class)
                .setMaxResults(1)
                .getSingleResult();
        Long dealerId = firstDealer.getId();

        entityManager.clear();
        stats.clear();

        var resultList = vehicleService.findAll(dealerId);

        assertThat(resultList).hasSize(2);
        assertThat(resultList.get(0).dealerId()).isEqualTo(dealerId);
        assertThat(resultList.get(0).dealerName()).isNotNull();

        long statementCount = stats.getPrepareStatementCount();
        assertThat(statementCount)
                .as("Deveria executar apenas 1 query SQL com JOIN FETCH para carregar a lista de veículos com o Dealer")
                .isEqualTo(1);
    }

    @Test
    @DisplayName("Deve filtrar por termo de busca com Specification e carregar Dealer corretamente sem N+1")
    void findAll_FilterBySearchTerm_ExecutesFixedNumberOfQueries() {
        Statistics stats = sessionFactory.getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        // Page size = 2, total elements = 10 matching vehicles -> requires 2 queries (1 count + 1 fetch)
        PagedResponseDTO<VehicleResponseDTO> result = vehicleService.findAll(
                null,
                "Modelo",
                PageRequest.of(0, 2)
        );

        assertThat(result).isNotNull();
        assertThat(result.totalElements()).isEqualTo(10);
        assertThat(result.content()).hasSize(2);
        assertThat(result.content().get(0).dealerName()).isNotNull();

        long statementCount = stats.getPrepareStatementCount();
        assertThat(statementCount)
                .as("Deveria executar 2 queries SQL (1 count + 1 data fetch)")
                .isEqualTo(2);
    }
}

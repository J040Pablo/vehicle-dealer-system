package com.dealership.api.dealer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class DealerRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DealerRepository dealerRepository;

    private Dealer savedDealer;

    @BeforeEach
    void setUp() {
        Dealer dealer = Dealer.builder()
                .name("Concessionária SP")
                .cnpj("62043380000107")
                .cep("01001000")
                .street("Praça da Sé")
                .neighborhood("Sé")
                .city("São Paulo")
                .state("SP")
                .build();
        savedDealer = entityManager.persistAndFlush(dealer);
    }

    @Test
    @DisplayName("Deve verificar se CNPJ existe com formato pontuado ou limpo")
    void existsByCnpj() {
        boolean existsFormatted = dealerRepository.existsByCnpj("62.043.380/0001-07");
        boolean existsClean = dealerRepository.existsByCnpj("62043380000107");
        boolean existsOther = dealerRepository.existsByCnpj("00000000000000");

        assertThat(existsFormatted).isTrue();
        assertThat(existsClean).isTrue();
        assertThat(existsOther).isFalse();
    }

    @Test
    @DisplayName("Deve verificar se CNPJ existe para outra concessionária diferente do ID")
    void existsByCnpjAndIdNot() {
        boolean existsSameId = dealerRepository.existsByCnpjAndIdNot("62.043.380/0001-07", savedDealer.getId());
        boolean existsDifferentId = dealerRepository.existsByCnpjAndIdNot("62.043.380/0001-07", 999L);

        assertThat(existsSameId).isFalse();
        assertThat(existsDifferentId).isTrue();
    }

    @Test
    @DisplayName("Deve buscar concessionária por CNPJ")
    void findByCnpj() {
        Optional<Dealer> result = dealerRepository.findByCnpj("62.043.380/0001-07");

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Concessionária SP");
    }

    @Test
    @DisplayName("Deve testar consultas JPQL raw brutas de CNPJ")
    void rawQueries() {
        boolean rawExists = dealerRepository.rawExistsByCnpj("62043380000107");
        boolean rawExistsIdNot = dealerRepository.rawExistsByCnpjAndIdNot("62043380000107", 999L);
        Optional<Dealer> rawFound = dealerRepository.rawFindByCnpj("62043380000107");

        assertThat(rawExists).isTrue();
        assertThat(rawExistsIdNot).isTrue();
        assertThat(rawFound).isPresent();
    }
}

package com.dealership.api.dealer;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class DealerSpecification {

    private DealerSpecification() {
        // Utility class
    }

    public static Specification<Dealer> filter(String search) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(search)) {
                return cb.conjunction();
            }

            String searchPattern = "%" + search.toLowerCase().trim() + "%";
            Predicate namePredicate = cb.like(cb.lower(root.get("name")), searchPattern);
            Predicate cnpjPredicate = cb.like(cb.lower(root.get("cnpj")), searchPattern);
            Predicate cityPredicate = cb.like(cb.lower(root.get("city")), searchPattern);
            Predicate statePredicate = cb.like(cb.lower(root.get("state")), searchPattern);

            return cb.or(namePredicate, cnpjPredicate, cityPredicate, statePredicate);
        };
    }
}

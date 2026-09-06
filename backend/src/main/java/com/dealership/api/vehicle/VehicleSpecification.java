package com.dealership.api.vehicle;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class VehicleSpecification {

    private VehicleSpecification() {
        // Utility class
    }

    public static Specification<Vehicle> filter(Long dealerId, String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dealerId != null) {
                predicates.add(cb.equal(root.get("dealer").get("id"), dealerId));
            }

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.toLowerCase().trim() + "%";
                Predicate brandPredicate = cb.like(cb.lower(root.get("brand")), searchPattern);
                Predicate modelPredicate = cb.like(cb.lower(root.get("model")), searchPattern);
                Predicate platePredicate = cb.like(cb.lower(root.get("plate")), searchPattern);

                predicates.add(cb.or(brandPredicate, modelPredicate, platePredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

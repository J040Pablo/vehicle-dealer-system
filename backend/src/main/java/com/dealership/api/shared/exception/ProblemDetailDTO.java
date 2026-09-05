package com.dealership.api.shared.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProblemDetailDTO(
        String type,
        String title,
        int status,
        String detail,
        String instance,
        OffsetDateTime timestamp,
        List<FieldErrorDTO> invalidFields
) {
    public record FieldErrorDTO(String field, String message) {}
}

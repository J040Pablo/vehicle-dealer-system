package com.dealership.api.shared.audit;

public record AuditEvent(
        String entityType,
        Long entityId,
        String action,
        String payload
) {}

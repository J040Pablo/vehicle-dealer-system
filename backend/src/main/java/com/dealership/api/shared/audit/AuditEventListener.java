package com.dealership.api.shared.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;

    @EventListener
    @Transactional
    public void handleAuditEvent(AuditEvent event) {
        log.info("Processando evento de auditoria: [{}] EntityType={} EntityId={}",
                event.action(), event.entityType(), event.entityId());

        AuditLog auditLog = new AuditLog(
                event.entityType(),
                event.entityId(),
                event.action(),
                event.payload()
        );

        auditLogRepository.save(auditLog);
    }
}

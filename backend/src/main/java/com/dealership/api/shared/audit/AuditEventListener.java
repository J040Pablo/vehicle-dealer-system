package com.dealership.api.shared.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleAuditEvent(AuditEvent event) {
        log.info("Processando evento de auditoria assíncrono (AFTER_COMMIT): [{}] EntityType={} EntityId={}",
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

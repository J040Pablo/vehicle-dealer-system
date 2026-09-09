package com.dealership.api.shared.audit;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
public class DynamoDbAuditService {

    private final DynamoDbEnhancedClient dynamoDbEnhancedClient;
    private final String auditTableName;
    private final boolean dynamoDbEnabled;

    public DynamoDbAuditService(
            ObjectProvider<DynamoDbEnhancedClient> dynamoDbEnhancedClientProvider,
            @Value("${aws.dynamodb.audit-table:VehicleDealerAuditLogs}") String auditTableName,
            @Value("${aws.dynamodb.enabled:true}") boolean dynamoDbEnabled) {
        this.dynamoDbEnhancedClient = dynamoDbEnhancedClientProvider.getIfAvailable();
        this.auditTableName = auditTableName;
        this.dynamoDbEnabled = dynamoDbEnabled;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDynamoDbAuditEvent(AuditEvent event) {
        if (!dynamoDbEnabled || dynamoDbEnhancedClient == null) {
            log.debug("Auditoria DynamoDB desativada ou cliente indisponível via propriedade aws.dynamodb.enabled.");
            return;
        }

        try {
            String actor = getAuthenticatedActor();
            String correlationId = MDC.get("correlationId");
            if (correlationId == null || correlationId.trim().isEmpty()) {
                correlationId = "SYSTEM-" + UUID.randomUUID().toString().substring(0, 8);
            }

            Instant now = Instant.now();
            long ttlEpochSeconds = now.plus(90, ChronoUnit.DAYS).getEpochSecond();

            DynamoAuditLog auditLog = DynamoAuditLog.builder()
                    .partitionKey("ENTITY#" + event.entityType().toUpperCase())
                    .sortKey("TIMESTAMP#" + now.toString() + "#" + UUID.randomUUID().toString())
                    .entityType(event.entityType())
                    .entityId(event.entityId())
                    .action(event.action())
                    .payload(event.payload())
                    .actor(actor)
                    .correlationId(correlationId)
                    .ttl(ttlEpochSeconds)
                    .build();

            DynamoDbTable<DynamoAuditLog> table = dynamoDbEnhancedClient.table(auditTableName, TableSchema.fromBean(DynamoAuditLog.class));
            table.putItem(auditLog);

            log.info("Log de auditoria assíncrono gravado no AWS DynamoDB: Table={} PK={} Action={}",
                    auditTableName, auditLog.getPartitionKey(), event.action());
        } catch (Exception e) {
            log.warn("Falha ao gravar evento de auditoria no AWS DynamoDB (operação em modo gracioso): {}", e.getMessage());
        }
    }

    private String getAuthenticatedActor() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
        } catch (Exception ignored) {
            // Fallback
        }
        return "SYSTEM";
    }
}

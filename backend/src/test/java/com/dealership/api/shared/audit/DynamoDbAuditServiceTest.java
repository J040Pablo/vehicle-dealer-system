package com.dealership.api.shared.audit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DynamoDbAuditServiceTest {

    @Mock
    private DynamoDbEnhancedClient dynamoDbEnhancedClient;

    @Mock
    private DynamoDbTable<DynamoAuditLog> dynamoDbTable;

    @Mock
    private ObjectProvider<DynamoDbEnhancedClient> provider;

    private DynamoDbAuditService auditService;

    @BeforeEach
    void setUp() {
        when(provider.getIfAvailable()).thenReturn(dynamoDbEnhancedClient);
        auditService = new DynamoDbAuditService(provider, "VehicleDealerAuditLogs", true);
    }

    @Test
    @DisplayName("Deve gravar evento de auditoria no DynamoDB com sucesso")
    void handleDynamoDbAuditEvent_Success() {
        when(dynamoDbEnhancedClient.table(eq("VehicleDealerAuditLogs"), any(TableSchema.class)))
                .thenReturn(dynamoDbTable);

        AuditEvent event = new AuditEvent("VEHICLE", 100L, "CREATE", "Created vehicle BMW M3");

        auditService.handleDynamoDbAuditEvent(event);

        verify(dynamoDbTable, times(1)).putItem(any(DynamoAuditLog.class));
    }

    @Test
    @DisplayName("Não deve executar auditoria quando desativada via propriedade")
    void handleDynamoDbAuditEvent_Disabled() {
        when(provider.getIfAvailable()).thenReturn(dynamoDbEnhancedClient);
        DynamoDbAuditService disabledService = new DynamoDbAuditService(provider, "VehicleDealerAuditLogs", false);

        AuditEvent event = new AuditEvent("VEHICLE", 100L, "CREATE", "Created vehicle");

        disabledService.handleDynamoDbAuditEvent(event);

        verifyNoInteractions(dynamoDbEnhancedClient);
    }

    @Test
    @DisplayName("Deve tratar falhas AWS no DynamoDB graciosamente sem relançar exceções")
    void handleDynamoDbAuditEvent_GracefulFailure() {
        when(dynamoDbEnhancedClient.table(eq("VehicleDealerAuditLogs"), any(TableSchema.class)))
                .thenThrow(new RuntimeException("ResourceNotFoundException: Table does not exist"));

        AuditEvent event = new AuditEvent("DEALER", 50L, "DELETE", "Deleted dealer");

        assertDoesNotThrow(() -> auditService.handleDynamoDbAuditEvent(event));
    }
}

package com.dealership.api.shared.audit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuditEventListenerTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditEventListener auditEventListener;

    @Test
    @DisplayName("Deve processar evento de auditoria e salvar log no repositório")
    void handleAuditEvent_Success() {
        AuditEvent event = new AuditEvent("Dealer", 1L, "CREATE", "{\"name\":\"Concessionária SP\"}");

        auditEventListener.handleAuditEvent(event);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog savedLog = captor.getValue();
        assertThat(savedLog.getEntityType()).isEqualTo("Dealer");
        assertThat(savedLog.getEntityId()).isEqualTo(1L);
        assertThat(savedLog.getAction()).isEqualTo("CREATE");
        assertThat(savedLog.getPayload()).isEqualTo("{\"name\":\"Concessionária SP\"}");
    }
}

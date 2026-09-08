package com.dealership.api.shared.audit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class AuditLogTest {

    @Test
    @DisplayName("Deve testar getters, setters e builder do AuditLog")
    void testAuditLog() {
        OffsetDateTime now = OffsetDateTime.now();

        AuditLog log = AuditLog.builder()
                .id(1L)
                .entityType("Vehicle")
                .entityId(10L)
                .action("CREATE")
                .payload("{}")
                .createdAt(now)
                .build();

        assertThat(log.getId()).isEqualTo(1L);
        assertThat(log.getEntityType()).isEqualTo("Vehicle");
        assertThat(log.getEntityId()).isEqualTo(10L);
        assertThat(log.getAction()).isEqualTo("CREATE");
        assertThat(log.getPayload()).isEqualTo("{}");
        assertThat(log.getCreatedAt()).isEqualTo(now);

        log.setId(2L);
        log.setEntityType("Dealer");
        log.setEntityId(20L);
        log.setAction("UPDATE");
        log.setPayload("{\"name\":\"SP\"}");
        log.setCreatedAt(now);

        assertThat(log.getId()).isEqualTo(2L);
        assertThat(log.getEntityType()).isEqualTo("Dealer");
        assertThat(log.getEntityId()).isEqualTo(20L);
        assertThat(log.getAction()).isEqualTo("UPDATE");
        assertThat(log.getPayload()).isEqualTo("{\"name\":\"SP\"}");
        assertThat(log.getCreatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Deve testar construtores do AuditLog")
    void testConstructors() {
        AuditLog emptyLog = new AuditLog();
        assertThat(emptyLog).isNotNull();

        AuditLog convenienceLog = new AuditLog("Dealer", 1L, "CREATE", "{}");
        assertThat(convenienceLog.getEntityType()).isEqualTo("Dealer");

        AuditLog fullLog = new AuditLog(1L, "Vehicle", 10L, "DELETE", "{}", null);
        assertThat(fullLog.getId()).isEqualTo(1L);
    }
}

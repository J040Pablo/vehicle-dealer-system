package com.dealership.api.config;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.Appender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class LoggingConfigurationTest {

    private CorrelationIdFilter filter;

    @BeforeEach
    void setUp() {
        filter = new CorrelationIdFilter();
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    @DisplayName("Deve injetar Correlation ID no MDC e no header HTTP quando não fornecido")
    void shouldInjectCorrelationIdInMdcAndHeaderWhenNotProvided() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/vehicles");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        String headerValue = response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER);
        assertThat(headerValue).isNotBlank();
        // MDC deve ser limpo no finally para evitar memory leak entre requisições
        assertThat(MDC.get(CorrelationIdFilter.CORRELATION_ID_KEY)).isNull();
    }

    @Test
    @DisplayName("Deve preservar Correlation ID fornecido no header HTTP da requisição")
    void shouldPreserveCorrelationIdFromRequestHeader() throws Exception {
        String existingCorrelationId = UUID.randomUUID().toString();
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/dealers");
        request.addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, existingCorrelationId);
        MockHttpServletResponse response = new MockHttpServletResponse();

        MockFilterChain filterChain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {
                // Durante a execução do chain, o MDC deve conter o Correlation ID
                assertThat(MDC.get(CorrelationIdFilter.CORRELATION_ID_KEY)).isEqualTo(existingCorrelationId);
            }
        };

        filter.doFilter(request, response, filterChain);

        assertThat(response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).isEqualTo(existingCorrelationId);
        assertThat(MDC.get(CorrelationIdFilter.CORRELATION_ID_KEY)).isNull();
    }

    @Test
    @DisplayName("Deve validar a presença de appenders configurados no Logback")
    void shouldValidateLogbackAppendersConfigured() {
        Logger rootLogger = (Logger) LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
        assertThat(rootLogger).isNotNull();
        
        Appender<ILoggingEvent> appender = rootLogger.getAppender("CONSOLE_TEXT");
        if (appender == null) {
            appender = rootLogger.getAppender("CONSOLE_JSON");
        }
        assertThat(appender).isNotNull();
    }
}

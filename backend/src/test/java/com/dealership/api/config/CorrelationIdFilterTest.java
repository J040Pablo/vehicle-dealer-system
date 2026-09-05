package com.dealership.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class CorrelationIdFilterTest {

    private CorrelationIdFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new CorrelationIdFilter();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
    }

    @Test
    @DisplayName("Deve reutilizar Correlation ID existente no header da requisição")
    void doFilterInternal_ExistingHeader() throws ServletException, IOException {
        String existingCorrelationId = "test-correlation-id-123";
        request.addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, existingCorrelationId);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER)).isEqualTo(existingCorrelationId);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Deve gerar novo Correlation ID UUID quando não fornecido na requisição")
    void doFilterInternal_GeneratedHeader() throws ServletException, IOException {
        filter.doFilterInternal(request, response, filterChain);

        String generatedId = response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER);
        assertThat(generatedId).isNotBlank();
        verify(filterChain).doFilter(request, response);
    }
}

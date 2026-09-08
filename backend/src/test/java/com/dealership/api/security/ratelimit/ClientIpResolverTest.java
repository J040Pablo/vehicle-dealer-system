package com.dealership.api.security.ratelimit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientIpResolverTest {

    @Test
    @DisplayName("Deve extrair IP do cabeçalho X-Forwarded-For quando presente")
    void getClientIp_WithXForwardedFor_ReturnsFirstIp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.195, 70.41.3.18, 150.172.238.178");
        request.setRemoteAddr("10.0.0.1");

        String ip = ClientIpResolver.getClientIp(request);

        assertEquals("203.0.113.195", ip);
    }

    @Test
    @DisplayName("Deve retornar getRemoteAddr quando X-Forwarded-For não for informado")
    void getClientIp_WithoutXForwardedFor_ReturnsRemoteAddr() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("198.51.100.1");

        String ip = ClientIpResolver.getClientIp(request);

        assertEquals("198.51.100.1", ip);
    }
}

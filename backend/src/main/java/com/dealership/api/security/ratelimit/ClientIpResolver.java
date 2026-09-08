package com.dealership.api.security.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

public class ClientIpResolver {

    private ClientIpResolver() {}

    public static String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            String[] ips = xForwardedFor.split(",");
            if (ips.length > 0) {
                String clientIp = ips[0].trim();
                if (StringUtils.hasText(clientIp)) {
                    return clientIp;
                }
            }
        }
        return request.getRemoteAddr();
    }
}

package com.dealership.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.cache")
public class CacheProperties {

    private Ttl ttl = new Ttl();

    @Getter
    @Setter
    public static class Ttl {
        private Duration dashboard = Duration.ofMinutes(5);
        private Duration viacep = Duration.ofHours(24);
        private Duration vehicles = Duration.ofMinutes(10);
        private Duration dealers = Duration.ofMinutes(10);
        private Duration filters = Duration.ofMinutes(15);
    }
}

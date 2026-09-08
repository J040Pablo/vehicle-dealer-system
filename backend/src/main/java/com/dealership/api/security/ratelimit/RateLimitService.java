package com.dealership.api.security.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final int CAPACITY = 5;
    private static final Duration REFILL_DURATION = Duration.ofMinutes(1);

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public ConsumptionProbe tryConsumeAndReturnProbe(String key) {
        Bucket bucket = buckets.computeIfAbsent(key, this::createNewBucket);
        return bucket.tryConsumeAndReturnRemaining(1L);
    }

    public void reset() {
        buckets.clear();
    }

    private Bucket createNewBucket(String key) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(CAPACITY)
                .refillIntervally(CAPACITY, REFILL_DURATION)
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}

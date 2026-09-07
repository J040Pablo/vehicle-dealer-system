package com.dealership.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@ExtendWith(MockitoExtension.class)
class RedisFailureIntegrationTest {

    @InjectMocks
    private CustomCacheErrorHandler cacheErrorHandler;

    @Mock
    private Cache cache;

    @Test
    @DisplayName("Deve tratar erro no Get de cache sem lançar exceção (Graceful Degradation)")
    void handleCacheGetError_ShouldNotThrowException() {
        RuntimeException redisException = new RuntimeException("Redis connection refused");

        assertDoesNotThrow(() -> cacheErrorHandler.handleCacheGetError(redisException, cache, "testKey"));
    }

    @Test
    @DisplayName("Deve tratar erro no Put de cache sem lançar exceção")
    void handleCachePutError_ShouldNotThrowException() {
        RuntimeException redisException = new RuntimeException("Redis write timeout");

        assertDoesNotThrow(() -> cacheErrorHandler.handleCachePutError(redisException, cache, "testKey", "testValue"));
    }

    @Test
    @DisplayName("Deve tratar erro no Evict de cache sem lançar exceção")
    void handleCacheEvictError_ShouldNotThrowException() {
        RuntimeException redisException = new RuntimeException("Redis connection lost");

        assertDoesNotThrow(() -> cacheErrorHandler.handleCacheEvictError(redisException, cache, "testKey"));
    }

    @Test
    @DisplayName("Deve tratar erro no Clear de cache sem lançar exceção")
    void handleCacheClearError_ShouldNotThrowException() {
        RuntimeException redisException = new RuntimeException("Redis cluster unavailable");

        assertDoesNotThrow(() -> cacheErrorHandler.handleCacheClearError(redisException, cache));
    }
}

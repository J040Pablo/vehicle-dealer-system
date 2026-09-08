package com.dealership.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;

@Slf4j
public class CustomCacheErrorHandler implements CacheErrorHandler {

    @Override
    public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
        log.warn("Falha de leitura no Redis para a chave '{}' no cache '{}': {}. Executando fallback para a fonte primária de dados.",
                key, cache != null ? cache.getName() : "unknown", exception.getMessage());
    }

    @Override
    public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
        log.warn("Falha de escrita no Redis para a chave '{}' no cache '{}': {}.",
                key, cache != null ? cache.getName() : "unknown", exception.getMessage());
    }

    @Override
    public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
        log.warn("Falha de despejo (evict) no Redis para a chave '{}' no cache '{}': {}.",
                key, cache != null ? cache.getName() : "unknown", exception.getMessage());
    }

    @Override
    public void handleCacheClearError(RuntimeException exception, Cache cache) {
        log.warn("Falha ao limpar a região de cache '{}' no Redis: {}.",
                cache != null ? cache.getName() : "unknown", exception.getMessage());
    }
}

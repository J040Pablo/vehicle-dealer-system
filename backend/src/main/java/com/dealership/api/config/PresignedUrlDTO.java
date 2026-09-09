package com.dealership.api.config;

public record PresignedUrlDTO(
    String uploadUrl,
    String fileKey,
    String fileUrl,
    long expirationMinutes
) {}

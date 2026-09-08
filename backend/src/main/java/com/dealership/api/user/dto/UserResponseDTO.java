package com.dealership.api.user.dto;

import com.dealership.api.user.Role;

public record UserResponseDTO(
        Long id,
        String username,
        Role role
) {}

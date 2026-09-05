package com.dealership.api.shared.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " não encontrado(a) com o ID: " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

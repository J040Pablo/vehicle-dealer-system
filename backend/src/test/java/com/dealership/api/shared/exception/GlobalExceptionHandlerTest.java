package com.dealership.api.shared.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.client.ResourceAccessException;

import java.net.SocketTimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        request = new MockHttpServletRequest("POST", "/api/dealer");
    }

    @Test
    @DisplayName("Deve retornar HTTP 409 Conflict com RFC-7807 ProblemDetail para DuplicateCnpjException")
    void handleDuplicateCnpjException() {
        DuplicateCnpjException ex = new DuplicateCnpjException("62043380000107");
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleConflictException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(409);
        assertThat(body.getTitle()).isEqualTo("Conflito de Dados");
        assertThat(body.getDetail()).contains("62043380000107");
        assertThat(body.getType().toString()).isEqualTo("https://api.dealership.com/errors/conflict");
    }

    @Test
    @DisplayName("Deve retornar HTTP 409 Conflict com RFC-7807 ProblemDetail para DuplicatePlateException")
    void handleDuplicatePlateException() {
        DuplicatePlateException ex = new DuplicatePlateException("ABC1D23");
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleConflictException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(409);
        assertThat(body.getTitle()).isEqualTo("Conflito de Dados");
        assertThat(body.getDetail()).contains("ABC1D23");
        assertThat(body.getType().toString()).isEqualTo("https://api.dealership.com/errors/conflict");
    }

    @Test
    @DisplayName("Deve retornar HTTP 503 Service Unavailable para timeout ou falha na API ViaCEP (ResourceAccessException)")
    void handleViaCepTimeout_ResourceAccessException() {
        ResourceAccessException ex = new ResourceAccessException("Connection timed out", new SocketTimeoutException("Read timed out"));
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleViaCepTimeout(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(503);
        assertThat(body.getTitle()).isEqualTo("Serviço Indisponível");
        assertThat(body.getDetail()).isEqualTo("Serviço ViaCEP temporariamente indisponível.");
        assertThat(body.getType().toString()).isEqualTo("https://api.dealership.com/errors/service-unavailable");
    }

    @Test
    @DisplayName("Deve retornar HTTP 404 Not Found para ResourceNotFoundException")
    void handleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Concessionária", 99L);
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleResourceNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(404);
        assertThat(body.getTitle()).isEqualTo("Recurso Não Encontrado");
    }
}

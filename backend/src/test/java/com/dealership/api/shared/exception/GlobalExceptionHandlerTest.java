package com.dealership.api.shared.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;

import java.net.SocketTimeoutException;
import java.util.List;

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
    @DisplayName("Deve retornar HTTP 404 Not Found com RFC-7807 ProblemDetail para ResourceNotFoundException")
    void handleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Concessionária", 99L);
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleResourceNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(404);
        assertThat(body.getTitle()).isEqualTo("Recurso Não Encontrado");
        assertThat(body.getDetail()).contains("Concessionária").contains("99");
        assertThat(body.getType().toString()).isEqualTo("https://api.dealership.com/errors/not-found");
        assertThat(body.getInstance().toString()).isEqualTo("/api/dealer");
        assertThat(body.getProperties()).containsKey("timestamp");
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
        assertThat(body.getInstance().toString()).isEqualTo("/api/dealer");
        assertThat(body.getProperties()).containsKey("timestamp");
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
    @DisplayName("Deve retornar HTTP 400 Bad Request com RFC-7807 ProblemDetail para BusinessException")
    void handleBusinessException() {
        BusinessException ex = new BusinessException("CEP inválido");
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleBusinessException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(400);
        assertThat(body.getTitle()).isEqualTo("Violação de Regra de Negócio");
        assertThat(body.getDetail()).isEqualTo("CEP inválido");
        assertThat(body.getType().toString()).isEqualTo("https://api.dealership.com/errors/business-rule");
    }

    @Test
    @DisplayName("Deve retornar HTTP 503 Service Unavailable para ResourceAccessException (timeout do ViaCEP)")
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
    @DisplayName("Deve retornar HTTP 503 Service Unavailable para RestClientException generico do ViaCEP")
    void handleViaCepTimeout_RestClientException() {
        RestClientException ex = new RestClientException("503 Service Unavailable");
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleViaCepTimeout(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(503);
        assertThat(body.getDetail()).isEqualTo("Serviço ViaCEP temporariamente indisponível.");
    }

    @Test
    @DisplayName("Deve retornar HTTP 400 Bad Request com lista de campos inválidos para MethodArgumentNotValidException")
    void handleMethodArgumentNotValidException() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
        bindingResult.addError(new FieldError("target", "cnpj", "O CNPJ é obrigatório."));

        MethodParameter parameter = new MethodParameter(this.getClass().getDeclaredMethod("dummyMethod"), -1);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleValidationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(400);
        assertThat(body.getTitle()).isEqualTo("Erro de Validação de Dados");
        assertThat(body.getType().toString()).isEqualTo("https://api.dealership.com/errors/invalid-fields");
        assertThat(body.getProperties()).containsKey("invalidFields");

        @SuppressWarnings("unchecked")
        List<GlobalExceptionHandler.FieldErrorDTO> invalidFields = (List<GlobalExceptionHandler.FieldErrorDTO>) body.getProperties().get("invalidFields");
        assertThat(invalidFields).hasSize(1);
        assertThat(invalidFields.get(0).field()).isEqualTo("cnpj");
        assertThat(invalidFields.get(0).message()).isEqualTo("O CNPJ é obrigatório.");
    }

    @Test
    @DisplayName("Deve retornar HTTP 500 Internal Server Error para exceções não tratadas")
    void handleGenericException() {
        RuntimeException ex = new RuntimeException("Erro inesperado no banco de dados");
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleGenericException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(500);
        assertThat(body.getTitle()).isEqualTo("Erro Interno do Servidor");
        assertThat(body.getDetail()).isEqualTo("Ocorreu um erro interno inesperado. Por favor, tente novamente mais tarde.");
        assertThat(body.getType().toString()).isEqualTo("https://api.dealership.com/errors/internal-error");
    }

    @SuppressWarnings("unused")
    private void dummyMethod() {
    }
}

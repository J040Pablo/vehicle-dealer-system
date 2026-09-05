package com.dealership.api.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;

import java.net.SocketTimeoutException;
import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleResourceNotFound(ResourceNotFoundException ex,
            HttpServletRequest request) {
        log.warn("Recurso não encontrado: {}", ex.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setType(URI.create("https://api.dealership.com/errors/not-found"));
        problemDetail.setTitle("Recurso Não Encontrado");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("timestamp", OffsetDateTime.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problemDetail);
    }

    @ExceptionHandler({DuplicatePlateException.class, DuplicateCnpjException.class})
    public ResponseEntity<ProblemDetail> handleConflictException(RuntimeException ex, HttpServletRequest request) {
        log.warn("Conflito de dados: {}", ex.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problemDetail.setType(URI.create("https://api.dealership.com/errors/conflict"));
        problemDetail.setTitle("Conflito de Dados");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("timestamp", OffsetDateTime.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problemDetail);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ProblemDetail> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        log.warn("Erro de regra de negócio: {}", ex.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setType(URI.create("https://api.dealership.com/errors/business-rule"));
        problemDetail.setTitle("Violação de Regra de Negócio");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("timestamp", OffsetDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
    }

    @ExceptionHandler({SocketTimeoutException.class, ResourceAccessException.class, RestClientException.class})
    public ResponseEntity<ProblemDetail> handleViaCepTimeout(Exception ex, HttpServletRequest request) {
        log.error("Erro de comunicação com serviço ViaCEP em {}: {}", request.getRequestURI(), ex.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Serviço ViaCEP temporariamente indisponível."
        );
        problemDetail.setType(URI.create("https://api.dealership.com/errors/service-unavailable"));
        problemDetail.setTitle("Serviço Indisponível");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("timestamp", OffsetDateTime.now());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(problemDetail);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<FieldErrorDTO> invalidFields = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldErrorDTO(error.getField(), error.getDefaultMessage()))
                .toList();

        log.warn("Erro de validação de dados em {}: {} erro(s)", request.getRequestURI(), invalidFields.size());

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Um ou mais campos informados contêm erros de validação."
        );
        problemDetail.setType(URI.create("https://api.dealership.com/errors/invalid-fields"));
        problemDetail.setTitle("Erro de Validação de Dados");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("timestamp", OffsetDateTime.now());
        problemDetail.setProperty("invalidFields", invalidFields);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Erro interno não tratado em {}: ", request.getRequestURI(), ex);
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocorreu um erro interno inesperado. Por favor, tente novamente mais tarde."
        );
        problemDetail.setType(URI.create("https://api.dealership.com/errors/internal-error"));
        problemDetail.setTitle("Erro Interno do Servidor");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("timestamp", OffsetDateTime.now());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problemDetail);
    }

    public record FieldErrorDTO(String field, String message) {}
}

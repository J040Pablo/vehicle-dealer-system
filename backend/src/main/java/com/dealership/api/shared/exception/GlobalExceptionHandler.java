package com.dealership.api.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetailDTO> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Recurso não encontrado: {}", ex.getMessage());
        ProblemDetailDTO problem = new ProblemDetailDTO(
                "https://api.dealership.com/errors/not-found",
                "Recurso Não Encontrado",
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                request.getRequestURI(),
                OffsetDateTime.now(),
                null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ProblemDetailDTO> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        log.warn("Erro de regra de negócio: {}", ex.getMessage());
        ProblemDetailDTO problem = new ProblemDetailDTO(
                "https://api.dealership.com/errors/business-rule",
                "Violação de Regra de Negócio",
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                request.getRequestURI(),
                OffsetDateTime.now(),
                null
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetailDTO> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ProblemDetailDTO.FieldErrorDTO> invalidFields = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ProblemDetailDTO.FieldErrorDTO(error.getField(), error.getDefaultMessage()))
                .toList();

        log.warn("Erro de validação de dados em {}: {} erro(s)", request.getRequestURI(), invalidFields.size());

        ProblemDetailDTO problem = new ProblemDetailDTO(
                "https://api.dealership.com/errors/invalid-fields",
                "Erro de Validação de Dados",
                HttpStatus.BAD_REQUEST.value(),
                "Um ou mais campos informados contêm erros de validação.",
                request.getRequestURI(),
                OffsetDateTime.now(),
                invalidFields
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetailDTO> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Erro interno não tratado em {}: ", request.getRequestURI(), ex);
        ProblemDetailDTO problem = new ProblemDetailDTO(
                "https://api.dealership.com/errors/internal-error",
                "Erro Interno do Servidor",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Ocorreu um erro interno inesperado. Por favor, tente novamente mais tarde.",
                request.getRequestURI(),
                OffsetDateTime.now(),
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}

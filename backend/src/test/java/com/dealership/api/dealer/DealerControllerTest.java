package com.dealership.api.dealer;

import com.dealership.api.config.CorsProperties;
import com.dealership.api.dealer.dto.DealerRequestDTO;
import com.dealership.api.dealer.dto.DealerResponseDTO;
import com.dealership.api.shared.exception.DuplicateCnpjException;
import com.dealership.api.shared.exception.GlobalExceptionHandler;
import com.dealership.api.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DealerController.class)
@Import(GlobalExceptionHandler.class)
class DealerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DealerService dealerService;

    @MockBean
    private CorsProperties corsProperties;

    private DealerRequestDTO requestDTO;
    private DealerResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new DealerRequestDTO("Concessionária SP", "62043380000107", "01001000");
        responseDTO = new DealerResponseDTO(1L, "Concessionária SP", "62043380000107", "01001000",
                "Praça da Sé", "Sé", "São Paulo", "SP", 5, null, null);
    }

    @Test
    @DisplayName("GET /dealer - Deve retornar lista de concessionárias com HTTP 200")
    void findAll_Success() throws Exception {
        when(dealerService.findAll()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/dealer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Concessionária SP"))
                .andExpect(jsonPath("$[0].totalVehicles").value(5));

        verify(dealerService, times(1)).findAll();
    }

    @Test
    @DisplayName("GET /dealer/{id} - Deve retornar concessionária por ID com HTTP 200")
    void findById_Success() throws Exception {
        when(dealerService.findById(1L)).thenReturn(responseDTO);

        mockMvc.perform(get("/dealer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Concessionária SP"));

        verify(dealerService, times(1)).findById(1L);
    }

    @Test
    @DisplayName("GET /dealer/{id} - Deve retornar HTTP 404 quando não encontrado")
    void findById_NotFound() throws Exception {
        when(dealerService.findById(99L)).thenThrow(new ResourceNotFoundException("Concessionária", 99L));

        mockMvc.perform(get("/dealer/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("POST /dealer - Deve cadastrar nova concessionária com HTTP 201")
    void create_Success() throws Exception {
        when(dealerService.create(any(DealerRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/dealer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.cnpj").value("62043380000107"));

        verify(dealerService, times(1)).create(any(DealerRequestDTO.class));
    }

    @Test
    @DisplayName("POST /dealer - Deve retornar HTTP 409 quando CNPJ é duplicado")
    void create_DuplicateCnpj() throws Exception {
        when(dealerService.create(any(DealerRequestDTO.class))).thenThrow(new DuplicateCnpjException("62043380000107"));

        mockMvc.perform(post("/dealer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("POST /dealer - Deve retornar HTTP 400 quando request possui validação inválida")
    void create_ValidationError() throws Exception {
        DealerRequestDTO invalidDTO = new DealerRequestDTO("", "123", "000");

        mockMvc.perform(post("/dealer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("PUT /dealer/{id} - Deve atualizar concessionária com HTTP 200")
    void update_Success() throws Exception {
        when(dealerService.update(eq(1L), any(DealerRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(put("/dealer/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));

        verify(dealerService, times(1)).update(eq(1L), any(DealerRequestDTO.class));
    }

    @Test
    @DisplayName("DELETE /dealer/{id} - Deve excluir concessionária com HTTP 204 No Content")
    void delete_Success() throws Exception {
        doNothing().when(dealerService).delete(1L);

        mockMvc.perform(delete("/dealer/1"))
                .andExpect(status().isNoContent());

        verify(dealerService, times(1)).delete(1L);
    }
}

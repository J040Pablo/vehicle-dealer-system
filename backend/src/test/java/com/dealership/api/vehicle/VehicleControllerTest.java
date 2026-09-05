package com.dealership.api.vehicle;

import com.dealership.api.config.CorsProperties;
import com.dealership.api.shared.exception.DuplicatePlateException;
import com.dealership.api.shared.exception.GlobalExceptionHandler;
import com.dealership.api.shared.exception.ResourceNotFoundException;
import com.dealership.api.vehicle.dto.VehicleRequestDTO;
import com.dealership.api.vehicle.dto.VehicleResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VehicleController.class)
@Import(GlobalExceptionHandler.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VehicleService vehicleService;

    @MockBean
    private CorsProperties corsProperties;

    private VehicleRequestDTO requestDTO;
    private VehicleResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new VehicleRequestDTO("Toyota", "Corolla", 2024, "ABC1D23", FuelType.FLEX, 1L);
        responseDTO = new VehicleResponseDTO(10L, "Toyota", "Corolla", 2024, "ABC1D23", FuelType.FLEX, 1L,
                "Concessionária SP", null, null);
    }

    @Test
    @DisplayName("GET /vehicles - Deve listar página de veículos com HTTP 200")
    void findAll_WithoutDealerId_Success() throws Exception {
        PageImpl<VehicleResponseDTO> page = new PageImpl<>(List.of(responseDTO), PageRequest.of(0, 10), 1);
        when(vehicleService.findAll(eq(null), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(10L))
                .andExpect(jsonPath("$.content[0].brand").value("Toyota"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));

        verify(vehicleService, times(1)).findAll(eq(null), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /vehicles?dealerId=1 - Deve listar veículos por concessionária com HTTP 200")
    void findAll_WithDealerId_Success() throws Exception {
        PageImpl<VehicleResponseDTO> page = new PageImpl<>(List.of(responseDTO), PageRequest.of(0, 10), 1);
        when(vehicleService.findAll(eq(1L), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/vehicles").param("dealerId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].dealerId").value(1L));

        verify(vehicleService, times(1)).findAll(eq(1L), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /vehicles/{id} - Deve retornar veículo por ID com HTTP 200")
    void findById_Success() throws Exception {
        when(vehicleService.findById(10L)).thenReturn(responseDTO);

        mockMvc.perform(get("/vehicles/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.plate").value("ABC1D23"));

        verify(vehicleService, times(1)).findById(10L);
    }

    @Test
    @DisplayName("GET /vehicles/{id} - Deve retornar HTTP 404 quando não encontrado")
    void findById_NotFound() throws Exception {
        when(vehicleService.findById(99L)).thenThrow(new ResourceNotFoundException("Veículo", 99L));

        mockMvc.perform(get("/vehicles/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("POST /vehicles - Deve cadastrar novo veículo com HTTP 201")
    void create_Success() throws Exception {
        when(vehicleService.create(any(VehicleRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L));

        verify(vehicleService, times(1)).create(any(VehicleRequestDTO.class));
    }

    @Test
    @DisplayName("POST /vehicles - Deve retornar HTTP 409 quando placa é duplicada")
    void create_DuplicatePlate() throws Exception {
        when(vehicleService.create(any(VehicleRequestDTO.class))).thenThrow(new DuplicatePlateException("ABC1D23"));

        mockMvc.perform(post("/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("PUT /vehicles/{id} - Deve atualizar veículo com HTTP 200")
    void update_Success() throws Exception {
        when(vehicleService.update(eq(10L), any(VehicleRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(put("/vehicles/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L));

        verify(vehicleService, times(1)).update(eq(10L), any(VehicleRequestDTO.class));
    }

    @Test
    @DisplayName("PUT /vehicles/{id}/dealer/{dealerId} - Deve associar concessionária com HTTP 200")
    void associateDealer_Success() throws Exception {
        when(vehicleService.associateDealer(10L, 2L)).thenReturn(responseDTO);

        mockMvc.perform(put("/vehicles/10/dealer/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L));

        verify(vehicleService, times(1)).associateDealer(10L, 2L);
    }

    @Test
    @DisplayName("DELETE /vehicles/{id} - Deve excluir veículo com HTTP 204 No Content")
    void delete_Success() throws Exception {
        doNothing().when(vehicleService).delete(10L);

        mockMvc.perform(delete("/vehicles/10"))
                .andExpect(status().isNoContent());

        verify(vehicleService, times(1)).delete(10L);
    }
}

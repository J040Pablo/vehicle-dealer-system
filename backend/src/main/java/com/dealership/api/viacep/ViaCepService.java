package com.dealership.api.viacep;

import com.dealership.api.shared.exception.BusinessException;
import com.dealership.api.shared.util.CepUtils;
import com.dealership.api.viacep.client.ViaCepClient;
import com.dealership.api.viacep.dto.ViaCepResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ViaCepService {

    private final ViaCepClient viaCepClient;

    public ViaCepResponseDTO fetchAddress(String rawCep) {
        if (rawCep == null || rawCep.isBlank()) {
            throw new BusinessException("O CEP é obrigatório para o cadastro da concessionária.");
        }

        String cleanCep = CepUtils.normalize(rawCep);
        if (cleanCep.length() != 8) {
            throw new BusinessException("O CEP informado é inválido: " + rawCep + ". Deve conter 8 dígitos numéricos.");
        }

        ViaCepResponseDTO response;
        try {
            response = viaCepClient.getAddressByCep(cleanCep);
        } catch (Exception e) {
            log.warn("Erro ao buscar CEP via ViaCEP: {}", e.getMessage());
            throw new BusinessException("Não foi possível localizar o endereço para o CEP informado: " + rawCep);
        }

        if (response == null || Boolean.TRUE.equals(response.erro())) {
            throw new BusinessException("Não foi possível localizar o endereço para o CEP informado: " + rawCep);
        }

        return response;
    }

    public ViaCepResponseDTO fetchAddressOrFallback(String rawCep, String manualStreet, String manualNeighborhood, String manualCity, String manualState) {
        try {
            return fetchAddress(rawCep);
        } catch (Exception e) {
            log.warn("Falha no serviço ViaCEP para CEP {}: {}. Verificando fallback manual.", rawCep, e.getMessage());
        }

        // Fallback para os campos manuais
        if (manualStreet != null && !manualStreet.isBlank()
                && manualCity != null && !manualCity.isBlank()
                && manualState != null && !manualState.isBlank()) {
            log.info("Utilizando dados de endereço manuais (fallback) para o CEP: {}", rawCep);
            return new ViaCepResponseDTO(
                    CepUtils.normalize(rawCep),
                    manualStreet,
                    manualNeighborhood != null ? manualNeighborhood : "",
                    manualCity,
                    manualState,
                    false
            );
        }

        throw new BusinessException("Não foi possível localizar o endereço para o CEP informado: " + rawCep + " e nenhum endereço manual foi fornecido.");
    }
}

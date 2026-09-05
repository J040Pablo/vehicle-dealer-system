package com.dealership.api.viacep;

import com.dealership.api.shared.exception.BusinessException;
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

        String cleanCep = rawCep.replaceAll("\\D", "");
        if (cleanCep.length() != 8) {
            throw new BusinessException("O CEP informado é inválido: " + rawCep + ". Deve conter 8 dígitos numéricos.");
        }

        ViaCepResponseDTO response = viaCepClient.getAddressByCep(cleanCep);

        if (response == null || Boolean.TRUE.equals(response.erro())) {
            throw new BusinessException("Não foi possível localizar o endereço para o CEP informado: " + rawCep);
        }

        return response;
    }
}

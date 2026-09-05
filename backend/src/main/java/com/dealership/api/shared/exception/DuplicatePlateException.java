package com.dealership.api.shared.exception;

public class DuplicatePlateException extends BusinessException {

    public DuplicatePlateException(String plate) {
        super("Já existe um veículo cadastrado com a placa: " + plate);
    }
}

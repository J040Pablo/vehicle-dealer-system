package com.dealership.api.shared.exception;

public class CnpjAlreadyExistsException extends BusinessException {

    public CnpjAlreadyExistsException(String cnpj) {
        super("Já existe uma concessionária cadastrada com o CNPJ: " + cnpj);
    }
}

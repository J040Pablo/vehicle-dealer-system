package com.dealership.api.shared.exception;

public class DuplicateCnpjException extends BusinessException {

    public DuplicateCnpjException(String cnpj) {
        super("Já existe uma concessionária cadastrada com o CNPJ: " + cnpj);
    }
}

package com.dealership.api.shared.exception;

public class CnpjAlreadyExistsException extends DuplicateCnpjException {

    public CnpjAlreadyExistsException(String cnpj) {
        super(cnpj);
    }
}


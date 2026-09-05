package com.dealership.api.shared.util;

public final class CepUtils {

    private CepUtils() {
    }

    public static String normalize(String cep) {
        if (cep == null) {
            return null;
        }
        return cep.replaceAll("\\D", "");
    }
}

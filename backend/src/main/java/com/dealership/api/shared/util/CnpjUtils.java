package com.dealership.api.shared.util;

public final class CnpjUtils {

    private CnpjUtils() {
    }

    public static String normalize(String cnpj) {
        if (cnpj == null) {
            return null;
        }
        return cnpj.replaceAll("\\D", "");
    }
}

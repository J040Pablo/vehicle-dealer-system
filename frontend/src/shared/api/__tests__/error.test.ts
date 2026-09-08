import { describe, expect, it } from "vitest";
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getErrorMessage, getFieldErrors } from "../error";
import type { ProblemDetail } from "@/shared/types/api";

function createMockAxiosError(
  responseData?: ProblemDetail,
  code?: string,
  message: string = "Request failed"
): AxiosError {
  const error = new AxiosError(message, code);
  if (responseData) {
    error.response = {
      data: responseData,
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    } as AxiosResponse;
  }
  return error;
}

describe("API error utils", () => {
  describe("getErrorMessage", () => {
    it("should return detail from ProblemDetail response if present", () => {
      const problemData: ProblemDetail = {
        type: "about:blank",
        title: "Bad Request",
        status: 400,
        detail: "CNPJ já cadastrado no sistema.",
        timestamp: "2026-09-07T12:00:00Z",
      };
      const axiosError = createMockAxiosError(problemData);

      expect(getErrorMessage(axiosError)).toBe("CNPJ já cadastrado no sistema.");
    });

    it("should return specific message for network error code ERR_NETWORK", () => {
      const axiosError = createMockAxiosError(undefined, "ERR_NETWORK");

      expect(getErrorMessage(axiosError)).toBe(
        "Não foi possível conectar à API. Verifique se o backend está em execução."
      );
    });

    it("should return Axios error message if no ProblemDetail detail is available", () => {
      const axiosError = createMockAxiosError(undefined, undefined, "Server Error 500");

      expect(getErrorMessage(axiosError)).toBe("Server Error 500");
    });

    it("should return message from generic Error instance", () => {
      const standardError = new Error("Standard error message");

      expect(getErrorMessage(standardError)).toBe("Standard error message");
    });

    it("should return fallback message for unknown non-Error input", () => {
      expect(getErrorMessage("String error")).toBe("Ocorreu um erro inesperado. Tente novamente.");
      expect(getErrorMessage(null)).toBe("Ocorreu um erro inesperado. Tente novamente.");
    });
  });

  describe("getFieldErrors", () => {
    it("should extract invalidFields mapping from Axios ProblemDetail error", () => {
      const problemData: ProblemDetail = {
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "Validation failed",
        timestamp: "2026-09-07T12:00:00Z",
        invalidFields: [
          { field: "cnpj", message: "CNPJ inválido" },
          { field: "name", message: "Nome é obrigatório" },
        ],
      };
      const axiosError = createMockAxiosError(problemData);

      const fieldErrors = getFieldErrors(axiosError);
      expect(fieldErrors).toEqual({
        cnpj: "CNPJ inválido",
        name: "Nome é obrigatório",
      });
    });

    it("should return empty object if problem detail has no invalidFields", () => {
      const problemData: ProblemDetail = {
        type: "about:blank",
        title: "Internal Error",
        status: 500,
        detail: "Internal server error",
        timestamp: "2026-09-07T12:00:00Z",
      };
      const axiosError = createMockAxiosError(problemData);

      expect(getFieldErrors(axiosError)).toEqual({});
    });

    it("should return empty object for non-Axios error", () => {
      expect(getFieldErrors(new Error("Test error"))).toEqual({});
    });
  });
});

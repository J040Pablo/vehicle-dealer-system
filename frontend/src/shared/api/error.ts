import { AxiosError } from "axios";
import type { ProblemDetail } from "@/shared/types/api";

function getProblem(error: unknown): ProblemDetail | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as ProblemDetail;
    }
  }
  return undefined;
}

/** Best available human-readable message for a failed request, for use in toasts. */
export function getErrorMessage(error: unknown): string {
  const problem = getProblem(error);
  if (problem?.detail) return problem.detail;
  if (error instanceof AxiosError) {
    if (error.code === "ERR_NETWORK") {
      return "Não foi possível conectar à API. Verifique se o backend está em execução.";
    }
    if (error.response?.status === 403) {
      return "Acesso negado (403). Verifique a proteção de deployment da Vercel ou permissões da API.";
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

/** Maps backend field validation errors (invalidFields) to a { fieldName: message } record. */
export function getFieldErrors(error: unknown): Record<string, string> {
  const problem = getProblem(error);
  if (!problem?.invalidFields?.length) return {};
  return Object.fromEntries(problem.invalidFields.map((f) => [f.field, f.message]));
}

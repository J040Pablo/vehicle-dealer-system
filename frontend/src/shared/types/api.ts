export interface FieldError {
  field: string;
  message: string;
}

/** Mirrors the backend's ProblemDetailDTO (RFC-7807-style error body). */
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp: string;
  invalidFields?: FieldError[] | null;
}

export interface FieldError {
  field: string;
  message: string;
}

/** Mirrors the backend's ProblemDetail (RFC-7807-style error body). */
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp: string;
  invalidFields?: FieldError[] | null;
}

/** Standard Spring Data Pageable response wrapper */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

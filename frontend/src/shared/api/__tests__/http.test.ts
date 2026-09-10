import { describe, expect, it, vi, beforeEach } from "vitest";
import { http, sanitizeApiUrl } from "../http";

describe("http Axios instance interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should sanitize malformed trailing characters from API URL", () => {
    expect(sanitizeApiUrl(undefined)).toBe("/api");
    expect(sanitizeApiUrl("http://54.226.237.94:8080/api}$")).toBe("http://54.226.237.94:8080/api");
    expect(sanitizeApiUrl("http://54.226.237.94:8080/api}")).toBe("http://54.226.237.94:8080/api");
    expect(sanitizeApiUrl("http://54.226.237.94:8080")).toBe("http://54.226.237.94:8080/api");
  });

  it("should inject X-Correlation-Id header if not provided", async () => {
    // Acquire request interceptor handler function
    const requestInterceptor = (http.interceptors.request as any).handlers[0].fulfilled;

    const config = { headers: {} as Record<string, string>, url: "/vehicles" };
    const result = await requestInterceptor(config);

    expect(result.headers["X-Correlation-Id"]).toBeDefined();
  });

  it("should attach Authorization header when token exists and endpoint is not /auth/", async () => {
    localStorage.setItem("token", "my.secret.jwt");
    const requestInterceptor = (http.interceptors.request as any).handlers[0].fulfilled;

    const config = { headers: {} as Record<string, string>, url: "/vehicles" };
    const result = await requestInterceptor(config);

    expect(result.headers["Authorization"]).toBe("Bearer my.secret.jwt");
  });

  it("should NOT attach Authorization header when requesting auth endpoints", async () => {
    localStorage.setItem("token", "my.secret.jwt");
    const requestInterceptor = (http.interceptors.request as any).handlers[0].fulfilled;

    const config = { headers: {} as Record<string, string>, url: "/auth/login" };
    const result = await requestInterceptor(config);

    expect(result.headers["Authorization"]).toBeUndefined();
  });

  it("should remove token from localStorage and redirect on 401 response error when not already on /login", async () => {
    localStorage.setItem("token", "expired.jwt.token");
    const responseErrorInterceptor = (http.interceptors.response as any).handlers[0].rejected;

    delete (window as any).location;
    window.location = { pathname: "/dashboard", href: "/dashboard" } as any;

    const error401 = { response: { status: 401 } };

    await expect(responseErrorInterceptor(error401)).rejects.toEqual(error401);
    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });
});

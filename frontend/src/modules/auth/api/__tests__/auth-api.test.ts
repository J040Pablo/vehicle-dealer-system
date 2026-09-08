import { describe, expect, it, vi, beforeEach } from "vitest";
import { loginApi, registerApi } from "../auth-api";
import { http } from "@/shared/api/http";

vi.mock("@/shared/api/http", () => ({
  http: {
    post: vi.fn(),
  },
}));

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginApi", () => {
    it("should send POST request to /auth/login and return token response", async () => {
      const credentials = { username: "admin", password: "password123" };
      const responseData = { token: "fake.jwt.token" };
      vi.mocked(http.post).mockResolvedValueOnce({ data: responseData });

      const result = await loginApi(credentials);

      expect(http.post).toHaveBeenCalledWith("/auth/login", credentials);
      expect(result).toEqual(responseData);
    });

    it("should propagate errors when loginApi request fails", async () => {
      const credentials = { username: "admin", password: "wrongpassword" };
      vi.mocked(http.post).mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(loginApi(credentials)).rejects.toThrow("Unauthorized");
    });
  });

  describe("registerApi", () => {
    it("should send POST request to /auth/register without role property", async () => {
      const credentials = { username: "newuser", email: "newuser@example.com", password: "password123", confirmPassword: "password123" };
      const responseData = { id: 1, username: "newuser", email: "newuser@example.com", role: "USER" };
      vi.mocked(http.post).mockResolvedValueOnce({ data: responseData });

      const result = await registerApi(credentials);

      expect(http.post).toHaveBeenCalledWith("/auth/register", {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      });
      expect(result).toEqual(responseData);
    });

    it("should propagate errors when registerApi fails", async () => {
      const credentials = { username: "existing", email: "existing@example.com", password: "password123", confirmPassword: "password123" };
      vi.mocked(http.post).mockRejectedValueOnce(new Error("Username already taken"));

      await expect(registerApi(credentials)).rejects.toThrow("Username already taken");
    });
  });
});

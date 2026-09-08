import { describe, expect, it, vi, beforeEach } from "vitest";
import { dealerApi } from "../dealer-api";
import { http } from "@/shared/api/http";

vi.mock("@/shared/api/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("dealerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch paginated dealers with default query params when no params provided", async () => {
    const pageResponse = { content: [], totalElements: 0, totalPages: 0 };
    vi.mocked(http.get).mockResolvedValueOnce({ data: pageResponse });

    const result = await dealerApi.list();

    expect(http.get).toHaveBeenCalledWith("/dealer", {
      params: { page: 0, size: 10, sort: "id,asc" },
    });
    expect(result).toEqual(pageResponse);
  });

  it("should fetch paginated dealers with custom query params", async () => {
    const pageResponse = { content: [{ id: 1 }], totalElements: 1, totalPages: 1 };
    vi.mocked(http.get).mockResolvedValueOnce({ data: pageResponse });

    const result = await dealerApi.list({ page: 2, size: 25, sort: "name,desc" });

    expect(http.get).toHaveBeenCalledWith("/dealer", {
      params: { page: 2, size: 25, sort: "name,desc" },
    });
    expect(result).toEqual(pageResponse);
  });

  it("should fetch all dealers using listAll (size=1000)", async () => {
    const mockContent = [{ id: 1, name: "Dealer 1" }, { id: 2, name: "Dealer 2" }];
    vi.mocked(http.get).mockResolvedValueOnce({ data: { content: mockContent } });

    const result = await dealerApi.listAll();

    expect(http.get).toHaveBeenCalledWith("/dealer", {
      params: { page: 0, size: 1000, sort: "id,asc" },
    });
    expect(result).toEqual(mockContent);
  });

  it("should create a new dealer via POST /dealer", async () => {
    const input = {
      name: "Auto Bahia",
      cnpj: "11.444.777/0001-61",
      cep: "40000-000",
      street: "Rua A",
      neighborhood: "Bairro B",
      city: "Salvador",
      state: "BA",
    };
    const createdDealer = { id: 1, ...input };
    vi.mocked(http.post).mockResolvedValueOnce({ data: createdDealer });

    const result = await dealerApi.create(input);

    expect(http.post).toHaveBeenCalledWith("/dealer", input);
    expect(result).toEqual(createdDealer);
  });

  it("should update an existing dealer via PUT /dealer/:id", async () => {
    const input = {
      name: "Auto Bahia Update",
      cnpj: "11.444.777/0001-61",
      cep: "40000-000",
      street: "Rua A",
      neighborhood: "Bairro B",
      city: "Salvador",
      state: "BA",
    };
    const updatedDealer = { id: 1, ...input };
    vi.mocked(http.put).mockResolvedValueOnce({ data: updatedDealer });

    const result = await dealerApi.update(1, input);

    expect(http.put).toHaveBeenCalledWith("/dealer/1", input);
    expect(result).toEqual(updatedDealer);
  });

  it("should remove a dealer via DELETE /dealer/:id", async () => {
    vi.mocked(http.delete).mockResolvedValueOnce({});

    await dealerApi.remove(1);

    expect(http.delete).toHaveBeenCalledWith("/dealer/1");
  });
});

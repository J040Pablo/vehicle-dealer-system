import { describe, expect, it, vi, beforeEach } from "vitest";
import { vehicleApi } from "../vehicle-api";
import { http } from "@/shared/api/http";

vi.mock("@/shared/api/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("vehicleApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list vehicles with default parameters when no params provided", async () => {
    const pageResponse = { content: [], totalElements: 0, totalPages: 0 };
    vi.mocked(http.get).mockResolvedValueOnce({ data: pageResponse });

    const result = await vehicleApi.list();

    expect(http.get).toHaveBeenCalledWith("/vehicles", {
      params: { page: 0, size: 10, sort: "id,asc" },
    });
    expect(result).toEqual(pageResponse);
  });

  it("should include dealerId and trimmed search in query params when provided", async () => {
    const pageResponse = { content: [{ id: 1 }], totalElements: 1, totalPages: 1 };
    vi.mocked(http.get).mockResolvedValueOnce({ data: pageResponse });

    const result = await vehicleApi.list({
      page: 1,
      size: 15,
      dealerId: 5,
      search: "  Toyota Corolla  ",
    });

    expect(http.get).toHaveBeenCalledWith("/vehicles", {
      params: {
        page: 1,
        size: 15,
        sort: "id,asc",
        dealerId: 5,
        search: "Toyota Corolla",
      },
    });
    expect(result).toEqual(pageResponse);
  });

  it("should fetch all vehicles using listAll with optional dealerId", async () => {
    const mockContent = [{ id: 1, brand: "Toyota" }];
    vi.mocked(http.get).mockResolvedValueOnce({ data: { content: mockContent } });

    const result = await vehicleApi.listAll(3);

    expect(http.get).toHaveBeenCalledWith("/vehicles", {
      params: { page: 0, size: 1000, sort: "id,asc", dealerId: 3 },
    });
    expect(result).toEqual(mockContent);
  });

  it("should create a vehicle via POST /vehicles", async () => {
    const input = {
      brand: "Honda",
      model: "Civic",
      year: 2023,
      plate: "ABC1D23",
      color: "Preto",
      fuelType: "FLEX" as const,
      dealerId: null,
    };
    const createdVehicle = { id: 1, ...input };
    vi.mocked(http.post).mockResolvedValueOnce({ data: createdVehicle });

    const result = await vehicleApi.create(input);

    expect(http.post).toHaveBeenCalledWith("/vehicles", input);
    expect(result).toEqual(createdVehicle);
  });

  it("should update a vehicle via PUT /vehicles/:id", async () => {
    const input = {
      brand: "Honda",
      model: "Civic Touring",
      year: 2023,
      plate: "ABC1D23",
      color: "Preto",
      fuelType: "FLEX" as const,
      dealerId: null,
    };
    const updatedVehicle = { id: 1, ...input };
    vi.mocked(http.put).mockResolvedValueOnce({ data: updatedVehicle });

    const result = await vehicleApi.update(1, input);

    expect(http.put).toHaveBeenCalledWith("/vehicles/1", input);
    expect(result).toEqual(updatedVehicle);
  });

  it("should delete a vehicle via DELETE /vehicles/:id", async () => {
    vi.mocked(http.delete).mockResolvedValueOnce({});

    await vehicleApi.remove(1);

    expect(http.delete).toHaveBeenCalledWith("/vehicles/1");
  });

  it("should ignore empty or whitespace-only search string in list query params", async () => {
    const pageResponse = { content: [], totalElements: 0, totalPages: 0 };
    vi.mocked(http.get).mockResolvedValueOnce({ data: pageResponse });

    await vehicleApi.list({ search: "   " });

    expect(http.get).toHaveBeenCalledWith("/vehicles", {
      params: { page: 0, size: 10, sort: "id,asc" },
    });
  });

  it("should propagate errors when vehicleApi API calls fail", async () => {
    vi.mocked(http.get).mockRejectedValueOnce(new Error("Network Error"));

    await expect(vehicleApi.list()).rejects.toThrow("Network Error");
  });
});

import { http } from "@/shared/api/http";
import type { Vehicle, VehicleInput } from "@/modules/vehicles/types/vehicle";
import type { PageResponse, PageParams } from "@/shared/types/api";

export interface VehicleQueryParams extends PageParams {
  dealerId?: number;
  search?: string;
}

export const vehicleApi = {
  async list(params?: VehicleQueryParams): Promise<PageResponse<Vehicle>> {
    const { data } = await http.get<PageResponse<Vehicle>>("/vehicles", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "id,asc",
        ...(params?.dealerId ? { dealerId: params.dealerId } : {}),
        ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
      },
    });
    return data;
  },

  async listAll(dealerId?: number): Promise<Vehicle[]> {
    const data = await vehicleApi.list({ page: 0, size: 1000, dealerId });
    return data.content;
  },

  async create(input: VehicleInput): Promise<Vehicle> {
    const { data } = await http.post<Vehicle>("/vehicles", input);
    return data;
  },

  async update(id: number, input: VehicleInput): Promise<Vehicle> {
    const { data } = await http.put<Vehicle>(`/vehicles/${id}`, input);
    return data;
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/vehicles/${id}`);
  },
};

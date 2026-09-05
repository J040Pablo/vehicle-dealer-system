import { http } from "@/shared/api/http";
import type { Vehicle, VehicleInput } from "@/modules/vehicles/types/vehicle";

export const vehicleApi = {
  async list(dealerId?: number): Promise<Vehicle[]> {
    const { data } = await http.get<Vehicle[]>("/vehicles", {
      params: dealerId ? { dealerId } : undefined,
    });
    return data;
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

import { api } from '@/lib/axios';
import { Vehicle, VehicleInput } from '@/types/vehicle';

export const vehicleService = {
  async getAll(dealerId?: number): Promise<Vehicle[]> {
    const params = dealerId ? { dealerId } : {};
    const response = await api.get<Vehicle[]>('/vehicles', { params });
    return response.data;
  },

  async getById(id: number): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  async create(data: VehicleInput): Promise<Vehicle> {
    const response = await api.post<Vehicle>('/vehicles', data);
    return response.data;
  },

  async update(id: number, data: VehicleInput): Promise<Vehicle> {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  },

  async associateDealer(vehicleId: number, dealerId: number): Promise<Vehicle> {
    const response = await api.put<Vehicle>(`/vehicles/${vehicleId}/dealer/${dealerId}`);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },
};

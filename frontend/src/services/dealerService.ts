import { api } from '@/lib/axios';
import { Dealer, DealerInput } from '@/types/dealer';

export const dealerService = {
  async getAll(): Promise<Dealer[]> {
    const response = await api.get<Dealer[]>('/dealer');
    return response.data;
  },

  async getById(id: number): Promise<Dealer> {
    const response = await api.get<Dealer>(`/dealer/${id}`);
    return response.data;
  },

  async create(data: DealerInput): Promise<Dealer> {
    const response = await api.post<Dealer>('/dealer', data);
    return response.data;
  },

  async update(id: number, data: DealerInput): Promise<Dealer> {
    const response = await api.put<Dealer>(`/dealer/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/dealer/${id}`);
  },
};

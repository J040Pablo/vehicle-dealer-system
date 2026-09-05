import { http } from "@/shared/api/http";
import type { Dealer, DealerInput } from "@/modules/dealers/types/dealer";

export const dealerApi = {
  async list(): Promise<Dealer[]> {
    const { data } = await http.get<Dealer[]>("/dealer");
    return data;
  },

  async create(input: DealerInput): Promise<Dealer> {
    const { data } = await http.post<Dealer>("/dealer", input);
    return data;
  },

  async update(id: number, input: DealerInput): Promise<Dealer> {
    const { data } = await http.put<Dealer>(`/dealer/${id}`, input);
    return data;
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/dealer/${id}`);
  },
};

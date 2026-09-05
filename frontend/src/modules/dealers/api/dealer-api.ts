import { http } from "@/shared/api/http";
import type { Dealer, DealerInput } from "@/modules/dealers/types/dealer";
import type { PageResponse, PageParams } from "@/shared/types/api";

export const dealerApi = {
  async list(params?: PageParams): Promise<PageResponse<Dealer>> {
    const { data } = await http.get<PageResponse<Dealer>>("/dealer", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "id,asc",
      },
    });
    return data;
  },

  async listAll(): Promise<Dealer[]> {
    const data = await dealerApi.list({ page: 0, size: 1000 });
    return data.content;
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

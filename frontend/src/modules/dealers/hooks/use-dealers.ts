import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { dealerApi } from "@/modules/dealers/api/dealer-api";

export const dealerKeys = {
  all: ["dealers"] as const,
  paginated: (page: number, size: number, search?: string) => ["dealers", page, size, search ?? ""] as const,
};

export function useDealersPaginated(page = 0, size = 10, search?: string) {
  return useQuery({
    queryKey: dealerKeys.paginated(page, size, search),
    queryFn: () => dealerApi.list({ page, size, search }),
    placeholderData: keepPreviousData,
  });
}

/** Hook helper for fetching full dealers list (e.g. for dashboard metrics / dropdowns) */
export function useDealers() {
  return useQuery({
    queryKey: [...dealerKeys.all, "all"],
    queryFn: () => dealerApi.listAll(),
  });
}

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { dealerApi } from "@/modules/dealers/api/dealer-api";

export const dealerKeys = {
  all: ["dealers"] as const,
  paginated: (page: number, size: number) => ["dealers", page, size] as const,
};

export function useDealersPaginated(page = 0, size = 10) {
  return useQuery({
    queryKey: dealerKeys.paginated(page, size),
    queryFn: () => dealerApi.list({ page, size }),
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

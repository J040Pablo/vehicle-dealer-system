import { useQuery } from "@tanstack/react-query";

import { dealerApi } from "@/modules/dealers/api/dealer-api";

export const dealerKeys = {
  all: ["dealers"] as const,
};

export function useDealers() {
  return useQuery({
    queryKey: dealerKeys.all,
    queryFn: dealerApi.list,
  });
}

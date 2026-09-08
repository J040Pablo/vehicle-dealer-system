import { useQuery } from "@tanstack/react-query";
import { cepApi, type CepAddress } from "@/shared/api/cep-api";

export function useCepLookup(cep: string) {
  const cleanCep = (cep || "").replace(/\D/g, "");
  const isValidCep = cleanCep.length === 8;

  return useQuery<CepAddress, Error>({
    queryKey: ["cep", cleanCep],
    queryFn: () => cepApi.getAddressByCep(cleanCep),
    enabled: isValidCep,
    staleTime: 1000 * 60 * 60, // 1 hour caching
    gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

import type { FuelType } from "@/modules/vehicles/types/vehicle";

/** Formats a string of digits as a CNPJ mask (XX.XXX.XXX/XXXX-XX) as the user types. */
export function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/** Formats a string of digits as a CEP mask (XXXXX-XXX) as the user types. */
export function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  GASOLINA: "Gasolina",
  ETANOL: "Etanol",
  FLEX: "Flex",
  DIESEL: "Diesel",
  ELETRICO: "Elétrico",
  HIBRIDO: "Híbrido",
};

export const FUEL_TYPE_OPTIONS: { value: FuelType; label: string }[] = (
  Object.keys(FUEL_TYPE_LABELS) as FuelType[]
).map((value) => ({ value, label: FUEL_TYPE_LABELS[value] }));

/** Badge color tokens per fuel type — kept in one place so the table and form stay in sync. */
export const FUEL_TYPE_BADGE_CLASSES: Record<FuelType, string> = {
  GASOLINA: "bg-amber-50 text-amber-700 border-amber-200",
  ETANOL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FLEX: "bg-sky-50 text-sky-700 border-sky-200",
  DIESEL: "bg-zinc-100 text-zinc-700 border-zinc-200",
  ELETRICO: "bg-teal-50 text-teal-700 border-teal-200",
  HIBRIDO: "bg-violet-50 text-violet-700 border-violet-200",
};

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

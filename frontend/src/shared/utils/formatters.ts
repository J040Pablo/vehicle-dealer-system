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

/** Validates official CNPJ check digits (Receita Federal Módulo 11 algorithm). */
export function isValidCnpj(rawCnpj: string): boolean {
  if (!rawCnpj) return false;
  const cnpj = rawCnpj.replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  try {
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i), 10) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cnpj.charAt(12), 10) !== digit1) return false;

    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i), 10) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cnpj.charAt(13), 10) === digit2;
  } catch {
    return false;
  }
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

/** Badge color tokens per fuel type — kept in one place so tables and forms stay in sync. */
export const FUEL_TYPE_BADGE_CLASSES: Record<FuelType, string> = {
  GASOLINA: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium",
  ETANOL: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium",
  FLEX: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30 font-medium",
  DIESEL: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/30 font-medium",
  ELETRICO: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 font-medium",
  HIBRIDO: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30 font-medium",
};

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

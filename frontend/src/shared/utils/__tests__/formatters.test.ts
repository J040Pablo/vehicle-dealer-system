import { describe, expect, it } from "vitest";
import {
  maskCnpj,
  isValidCnpj,
  maskCep,
  formatDate,
  FUEL_TYPE_LABELS,
  FUEL_TYPE_OPTIONS,
  FUEL_TYPE_BADGE_CLASSES,
} from "../formatters";

describe("formatters utils", () => {
  describe("maskCnpj", () => {
    it("should format a partial CNPJ string as user types", () => {
      expect(maskCnpj("11")).toBe("11");
      expect(maskCnpj("112")).toBe("11.2");
      expect(maskCnpj("11222")).toBe("11.222");
      expect(maskCnpj("11222333")).toBe("11.222.333");
      expect(maskCnpj("112223330001")).toBe("11.222.333/0001");
      expect(maskCnpj("11222333000181")).toBe("11.222.333/0001-81");
    });

    it("should ignore non-digit characters and truncate at 14 digits", () => {
      expect(maskCnpj("11.222.333/0001-81999")).toBe("11.222.333/0001-81");
    });
  });

  describe("isValidCnpj", () => {
    it("should return false for empty or invalid length strings", () => {
      expect(isValidCnpj("")).toBe(false);
      expect(isValidCnpj("123")).toBe(false);
      expect(isValidCnpj("11.222.333/0001")).toBe(false);
    });

    it("should return false for repeated digits CNPJs", () => {
      expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
      expect(isValidCnpj("11.111.111/1111-11")).toBe(false);
      expect(isValidCnpj("99999999999999")).toBe(false);
    });

    it("should return true for valid official CNPJs", () => {
      expect(isValidCnpj("11.444.777/0001-61")).toBe(true);
      expect(isValidCnpj("11444777000161")).toBe(true);
      expect(isValidCnpj("00.000.000/0001-91")).toBe(true);
    });

    it("should return false for invalid check digits", () => {
      expect(isValidCnpj("11.444.777/0001-60")).toBe(false);
      expect(isValidCnpj("11.444.777/0001-00")).toBe(false);
    });
  });

  describe("maskCep", () => {
    it("should format partial and complete CEP strings", () => {
      expect(maskCep("40000")).toBe("40000");
      expect(maskCep("40000000")).toBe("40000-000");
    });

    it("should ignore non-digit characters and truncate at 8 digits", () => {
      expect(maskCep("40000-000999")).toBe("40000-000");
    });
  });

  describe("formatDate", () => {
    it("should return fallback '—' when value is null, undefined or empty string", () => {
      expect(formatDate(null)).toBe("—");
      expect(formatDate(undefined)).toBe("—");
      expect(formatDate("")).toBe("—");
    });

    it("should format valid ISO date strings to pt-BR date format", () => {
      const formatted = formatDate("2026-09-07T12:00:00Z");
      expect(formatted).toMatch(/07\/09\/2026/);
    });
  });

  describe("fuel type constants", () => {
    it("should contain labels and options for all fuel types", () => {
      expect(FUEL_TYPE_LABELS.GASOLINA).toBe("Gasolina");
      expect(FUEL_TYPE_LABELS.FLEX).toBe("Flex");
      expect(FUEL_TYPE_OPTIONS.length).toBe(6);
      expect(Object.keys(FUEL_TYPE_BADGE_CLASSES).length).toBe(6);
    });
  });
});

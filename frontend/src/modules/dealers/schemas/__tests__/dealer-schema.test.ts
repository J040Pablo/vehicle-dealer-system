import { describe, expect, it } from "vitest";
import { dealerSchema, dealerFormDefaults } from "../dealer-schema";

describe("dealerSchema", () => {
  const VALID_CNPJ_MASKED = "11.444.777/0001-61";
  const VALID_CNPJ_UNMASKED = "11444777000161";

  it("should validate a completely valid dealer payload", () => {
    const validData = {
      name: "Concessionária Auto VIP",
      cnpj: VALID_CNPJ_MASKED,
      cep: "40000-000",
      street: "Avenida Principal",
      neighborhood: "Centro",
      city: "Salvador",
      state: "BA",
    };

    const result = dealerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept unmasked valid CNPJ and 8-digit CEP", () => {
    const validData = {
      name: "Dealer Express",
      cnpj: VALID_CNPJ_UNMASKED,
      cep: "40000000",
    };

    const result = dealerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty", () => {
    const result = dealerSchema.safeParse({
      ...dealerFormDefaults,
      name: "",
      cnpj: VALID_CNPJ_MASKED,
      cep: "40000-000",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "A Razão Social / Nome da concessionária é obrigatório."
      );
    }
  });

  it("should fail when CNPJ is empty", () => {
    const result = dealerSchema.safeParse({
      ...dealerFormDefaults,
      name: "Auto Shop",
      cnpj: "",
      cep: "40000-000",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.cnpj).toContain("O CNPJ é obrigatório.");
    }
  });

  it("should fail when CNPJ has invalid format (wrong number of digits)", () => {
    const result = dealerSchema.safeParse({
      ...dealerFormDefaults,
      name: "Auto Shop",
      cnpj: "123.456",
      cep: "40000-000",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.cnpj).toContain(
        "O CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou 14 dígitos numéricos."
      );
    }
  });

  it("should fail when CNPJ has valid format but invalid check digits (isValidCnpj fails)", () => {
    const result = dealerSchema.safeParse({
      ...dealerFormDefaults,
      name: "Auto Shop",
      cnpj: "11.444.777/0001-00", // Invalid check digits
      cep: "40000-000",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.cnpj).toContain(
        "CNPJ inválido (dígitos verificadores incorretos)."
      );
    }
  });

  it("should fail when CEP is empty", () => {
    const result = dealerSchema.safeParse({
      ...dealerFormDefaults,
      name: "Auto Shop",
      cnpj: VALID_CNPJ_MASKED,
      cep: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.cep).toContain("O CEP é obrigatório.");
    }
  });

  it("should fail when CEP format is invalid", () => {
    const result = dealerSchema.safeParse({
      ...dealerFormDefaults,
      name: "Auto Shop",
      cnpj: VALID_CNPJ_MASKED,
      cep: "1234",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.cep).toContain(
        "O CEP deve estar no formato XXXXX-XXX ou 8 dígitos numéricos."
      );
    }
  });
});

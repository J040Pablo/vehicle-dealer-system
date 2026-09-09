import { describe, expect, it } from "vitest";
import { vehicleSchema } from "../vehicle-schema";

describe("vehicleSchema", () => {
  const currentYear = new Date().getFullYear();

  const validBaseVehicle = {
    brand: "Toyota",
    model: "Corolla",
    year: 2022,
    plate: "ABC1D23",
    color: "Preto",
    fuelType: "FLEX" as const,
    dealerId: 1,
  };

  it("should validate a valid vehicle form payload (Traditional & Mercosul)", () => {
    const validMercosul = {
      ...validBaseVehicle,
      plate: "ABC1D23",
    };

    const resultMercosul = vehicleSchema.safeParse(validMercosul);
    expect(resultMercosul.success).toBe(true);
    if (resultMercosul.success) {
      expect(resultMercosul.data.plate).toBe("ABC1D23");
      expect(resultMercosul.data.brand).toBe("Toyota");
    }

    const validTraditional = {
      ...validBaseVehicle,
      plate: "ABC1234",
    };
    const resultTraditional = vehicleSchema.safeParse(validTraditional);
    expect(resultTraditional.success).toBe(true);
  });

  it("should allow null dealerId", () => {
    const validData = {
      ...validBaseVehicle,
      dealerId: null,
    };

    const result = vehicleSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail when brand is empty or whitespace only", () => {
    const invalidData = {
      ...validBaseVehicle,
      brand: "   ",
    };

    const result = vehicleSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.brand).toContain("A marca do veículo é obrigatória.");
    }
  });

  it("should fail when model is empty", () => {
    const invalidData = {
      ...validBaseVehicle,
      model: "",
    };

    const result = vehicleSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.model).toContain("O modelo do veículo é obrigatório.");
    }
  });

  it("should validate year boundaries (min 1900, max CURRENT_YEAR + 1)", () => {
    // Year too small
    const resultMin = vehicleSchema.safeParse({
      ...validBaseVehicle,
      year: 1899,
    });
    expect(resultMin.success).toBe(false);
    if (!resultMin.success) {
      expect(resultMin.error.flatten().fieldErrors.year).toContain("O ano informado é inválido.");
    }

    // Year too high
    const resultMax = vehicleSchema.safeParse({
      ...validBaseVehicle,
      year: currentYear + 2,
    });
    expect(resultMax.success).toBe(false);
    if (!resultMax.success) {
      expect(resultMax.error.flatten().fieldErrors.year).toContain("O ano informado é inválido.");
    }

    // Boundary year should pass
    const resultValidMax = vehicleSchema.safeParse({
      ...validBaseVehicle,
      year: currentYear + 1,
    });
    expect(resultValidMax.success).toBe(true);
  });

  it("should validate fuelType enum values and error message for invalid fuelType", () => {
    const validFuelTypes = ["GASOLINA", "ETANOL", "FLEX", "DIESEL", "ELETRICO", "HIBRIDO"];
    validFuelTypes.forEach((fuelType) => {
      const res = vehicleSchema.safeParse({
        ...validBaseVehicle,
        fuelType,
      });
      expect(res.success).toBe(true);
    });

    const invalidRes = vehicleSchema.safeParse({
      ...validBaseVehicle,
      fuelType: "NOT_A_FUEL",
    });
    expect(invalidRes.success).toBe(false);
    if (!invalidRes.success) {
      expect(invalidRes.error.flatten().fieldErrors.fuelType).toContain("Selecione o tipo de combustível.");
    }
  });
});

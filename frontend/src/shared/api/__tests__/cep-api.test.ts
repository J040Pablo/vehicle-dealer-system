import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { cepApi } from "../cep-api";

vi.mock("axios");

describe("cepApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if CEP does not contain 8 numeric digits", async () => {
    await expect(cepApi.getAddressByCep("12345")).rejects.toThrow(
      "O CEP deve conter 8 dígitos numéricos."
    );
  });

  it("should throw error when ViaCEP API returns erro: true", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { erro: true } });

    await expect(cepApi.getAddressByCep("99999-999")).rejects.toThrow("CEP não encontrado.");
  });

  it("should throw error when ViaCEP API returns erro: 'true' as string", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { erro: "true" } });

    await expect(cepApi.getAddressByCep("99999-999")).rejects.toThrow("CEP não encontrado.");
  });

  it("should return formatted CepAddress when ViaCEP returns valid response", async () => {
    const mockViaCepResponse = {
      cep: "40000-000",
      logradouro: "Rua Chile",
      bairro: "Centro",
      localidade: "Salvador",
      uf: "BA",
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockViaCepResponse });

    const result = await cepApi.getAddressByCep("40000-000");

    expect(axios.get).toHaveBeenCalledWith("https://viacep.com.br/ws/40000000/json/");
    expect(result).toEqual({
      cep: "40000-000",
      street: "Rua Chile",
      neighborhood: "Centro",
      city: "Salvador",
      state: "BA",
    });
  });

  it("should use empty fallback values for missing optional fields in ViaCEP response", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: {} });

    const result = await cepApi.getAddressByCep("40000-000");

    expect(result).toEqual({
      cep: "40000-000",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
    });
  });
});

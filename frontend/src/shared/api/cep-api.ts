import axios from "axios";

export interface CepAddress {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

export const cepApi = {
  /**
   * Fetches address details from ViaCEP API given a valid 8-digit CEP.
   * Throws an error if CEP is not found or invalid.
   */
  async getAddressByCep(cep: string): Promise<CepAddress> {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      throw new Error("O CEP deve conter 8 dígitos numéricos.");
    }

    const response = await axios.get<ViaCepResponse>(
      `https://viacep.com.br/ws/${cleanCep}/json/`
    );

    if (response.data.erro === true || response.data.erro === "true") {
      throw new Error("CEP não encontrado.");
    }

    return {
      cep: response.data.cep || cep,
      street: response.data.logradouro || "",
      neighborhood: response.data.bairro || "",
      city: response.data.localidade || "",
      state: response.data.uf || "",
    };
  },
};

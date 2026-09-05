export interface Dealer {
  id: number;
  name: string;
  cnpj: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  totalVehicles: number;
  createdAt: string;
  updatedAt: string;
}

/** Address fields (street/neighborhood/city/state) are filled server-side via ViaCEP. */
export interface DealerInput {
  name: string;
  cnpj: string;
  cep: string;
}

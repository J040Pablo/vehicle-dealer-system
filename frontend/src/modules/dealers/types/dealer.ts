export interface Dealer {
  id: number;
  name: string;
  cnpj: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  imageUrl?: string | null;
  totalVehicles: number;
  createdAt: string;
  updatedAt: string;
}

/** Address fields (street/neighborhood/city/state) can be auto-filled via ViaCEP or specified manually. */
export interface DealerInput {
  name: string;
  cnpj: string;
  cep: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  imageUrl?: string | null;
}


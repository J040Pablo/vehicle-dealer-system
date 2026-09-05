export type FuelType = 'GASOLINA' | 'ETANOL' | 'FLEX' | 'DIESEL' | 'ELETRICO' | 'HIBRIDO';

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  fuelType: FuelType;
  dealerId?: number | null;
  dealerName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleInput {
  brand: string;
  model: string;
  year: number;
  plate: string;
  fuelType: FuelType;
  dealerId?: number | null;
}

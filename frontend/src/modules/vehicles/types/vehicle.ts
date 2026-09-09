export type FuelType = "GASOLINA" | "ETANOL" | "FLEX" | "DIESEL" | "ELETRICO" | "HIBRIDO";

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  fuelType: FuelType;
  chassis?: string | null;
  value?: number | null;
  imageUrl?: string | null;
  dealerId: number | null;
  dealerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInput {
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  fuelType: FuelType;
  chassis?: string | null;
  value?: number | null;
  imageUrl?: string | null;
  dealerId: number | null;
}

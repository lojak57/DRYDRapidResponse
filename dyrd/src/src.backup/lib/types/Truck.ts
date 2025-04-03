export enum TruckStatus {
  AVAILABLE = "AVAILABLE",
  ASSIGNED = "ASSIGNED", // Status inferred from schedule, AVAILABLE means not assigned on a given day
  MAINTENANCE = "MAINTENANCE",
  OTHER = "OTHER"
}

export interface Truck {
  id: string;
  name: string; // e.g., "Truck 1", "Ford Transit", "License Plate XYZ"
  status: TruckStatus; // Represents the general status, not daily assignment
  capacity?: string; // Optional: e.g., "1 Ton", "Standard Van"
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 
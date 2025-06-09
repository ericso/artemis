import { vi } from 'vitest';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  name: string | null;
  vin: string;
  initial_mileage: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateCarDto {
  make: string;
  model: string;
  year: number;
  name?: string;
  vin?: string;
  initial_mileage: number;
}

export const CarService = {
  getCars: vi.fn(),
  createCar: vi.fn(),
  updateCar: vi.fn(),
  deleteCar: vi.fn()
}; 
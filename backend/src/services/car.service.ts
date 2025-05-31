import { Car } from '@models/car';

export interface CarService {
  findById(id: string): Promise<Car | undefined>;
  findByUserId(userId: string): Promise<Car[]>;
  create(car: Car): Promise<Car>;
  update(id: string, car: Partial<Car>): Promise<Car | undefined>;
  softDelete(id: string): Promise<void>;
} 
import { Fillup } from '@models/fillup';

export interface FillupService {
  findById(id: string): Promise<Fillup | undefined>;
  findByCarId(carId: string): Promise<Fillup[]>;
  create(fillup: Fillup): Promise<Fillup>;
  update(id: string, fillup: Partial<Fillup>): Promise<Fillup | undefined>;
  softDelete(id: string): Promise<void>;
} 
import axios from '@/lib/axios';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  name: string | null;
  initial_mileage: number;
  user_id: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface CreateCarDto {
  make: string;
  model: string;
  year: number;
  vin?: string;
  name?: string;
  initial_mileage: number;
}

export const CarService = {
  async getCars(): Promise<Car[]> {
    const response = await axios.get<Car[]>('/cars');
    return response.data.map(car => ({
      ...car,
      created_at: new Date(car.created_at),
      updated_at: car.updated_at ? new Date(car.updated_at) : null,
      deleted_at: car.deleted_at ? new Date(car.deleted_at) : null,
    }));
  },

  async createCar(car: CreateCarDto): Promise<Car> {
    const response = await axios.post<Car>('/cars', car);
    const newCar = response.data;
    return {
      ...newCar,
      created_at: new Date(newCar.created_at),
      updated_at: newCar.updated_at ? new Date(newCar.updated_at) : null,
      deleted_at: newCar.deleted_at ? new Date(newCar.deleted_at) : null,
    };
  },

  async updateCar(id: string, car: Partial<CreateCarDto>): Promise<Car> {
    const response = await axios.put<Car>(`/cars/${id}`, car);
    const updatedCar = response.data;
    return {
      ...updatedCar,
      created_at: new Date(updatedCar.created_at),
      updated_at: updatedCar.updated_at ? new Date(updatedCar.updated_at) : null,
      deleted_at: updatedCar.deleted_at ? new Date(updatedCar.deleted_at) : null,
    };
  },

  async deleteCar(id: string): Promise<void> {
    await axios.delete(`/cars/${id}`);
  }
}; 
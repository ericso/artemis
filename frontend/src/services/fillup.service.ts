import axios from '@/lib/axios';

export interface Fillup {
  id: string;
  car_id: string;
  date: Date;
  gallons: number;
  total_cost: number;
  odometer_reading: number;
  station_address: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface CreateFillupDto {
  car_id: string;
  date: Date;
  gallons: number;
  total_cost: number;
  odometer_reading: number;
  station_address?: string;
  notes?: string;
}

export const FillupService = {
  async getFillups(carId: string): Promise<Fillup[]> {
    const response = await axios.get<Fillup[]>(`/fillups?carId=${carId}`);
    return response.data.map(fillup => ({
      ...fillup,
      date: new Date(fillup.date),
      created_at: new Date(fillup.created_at),
      updated_at: fillup.updated_at ? new Date(fillup.updated_at) : null,
      deleted_at: fillup.deleted_at ? new Date(fillup.deleted_at) : null,
    }));
  },

  async createFillup(fillupData: CreateFillupDto): Promise<Fillup> {
    const response = await axios.post<Fillup>('/fillups', fillupData);
    const fillup = response.data;
    return {
      ...fillup,
      date: new Date(fillup.date),
      created_at: new Date(fillup.created_at),
      updated_at: fillup.updated_at ? new Date(fillup.updated_at) : null,
      deleted_at: fillup.deleted_at ? new Date(fillup.deleted_at) : null,
    };
  },

  async updateFillup(id: string, fillupData: Partial<CreateFillupDto>): Promise<Fillup> {
    const response = await axios.put<Fillup>(`/fillups/${id}`, fillupData);
    const fillup = response.data;
    return {
      ...fillup,
      date: new Date(fillup.date),
      created_at: new Date(fillup.created_at),
      updated_at: fillup.updated_at ? new Date(fillup.updated_at) : null,
      deleted_at: fillup.deleted_at ? new Date(fillup.deleted_at) : null,
    };
  },

  async deleteFillup(id: string): Promise<void> {
    await axios.delete(`/fillups/${id}`);
  }
}; 
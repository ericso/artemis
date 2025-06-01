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
  updated_at?: Date | null;
  deleted_at?: Date | null;
} 
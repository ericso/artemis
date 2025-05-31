export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  name: string | null;
  user_id: string;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
} 
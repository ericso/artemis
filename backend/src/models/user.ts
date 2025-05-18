export interface User {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
} 
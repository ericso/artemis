import { User } from '@models/user';

export interface UserService {
  findByEmail(email: string): Promise<User | undefined>;
  create(user: User): Promise<User>;
  softDelete(email: string): Promise<void>;
}

import {User} from "@models/user";
import {UserService} from "@services/user.service";

export class InMemoryUserService implements UserService {
    private users: User[] = [];

    async findByEmail(email: string): Promise<User | undefined> {
        return this.users.find(u => u.email === email && !u.deleted_at);
    }

    async create(user: User): Promise<User> {
        const newUser = {
            ...user,
            created_at: new Date(),
            updated_at: null,
            deleted_at: null
        };
        this.users.push(newUser);
        return newUser;
    }

    async softDelete(email: string): Promise<void> {
        const user = this.users.find(u => u.email === email && !u.deleted_at);
        if (user) {
            user.deleted_at = new Date();
        }
    }

    // Test utility method
    __test_reset(): void {
        this.users = [];
    }
}
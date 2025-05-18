import { InMemoryUserService } from './in-memory-user.service';
import { User } from '@models/user';

describe('InMemoryUserService', () => {
  let userService: InMemoryUserService;
  
  beforeEach(() => {
    userService = new InMemoryUserService();
  });

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    created_at: new Date('2024-01-01'),
    updated_at: null,
    deleted_at: null
  };

  describe('create', () => {
    it('should successfully create a user', async () => {
      const createdUser = await userService.create(mockUser);
      
      expect(createdUser.id).toBe(mockUser.id);
      expect(createdUser.email).toBe(mockUser.email);
      expect(createdUser.password).toBe(mockUser.password);
      expect(createdUser.created_at).toBeInstanceOf(Date);
      expect(createdUser.updated_at).toBeNull();
      expect(createdUser.deleted_at).toBeNull();
    });

    it('should store the created user', async () => {
      const createdUser = await userService.create(mockUser);
      
      const foundUser = await userService.findByEmail(mockUser.email);
      expect(foundUser).toEqual(createdUser);
    });
  });

  describe('findByEmail', () => {
    it('should return undefined for non-existent user', async () => {
      const user = await userService.findByEmail('nonexistent@example.com');
      
      expect(user).toBeUndefined();
    });

    it('should find existing user by email', async () => {
      const createdUser = await userService.create(mockUser);
      
      const foundUser = await userService.findByEmail(mockUser.email);
      expect(foundUser).toEqual(createdUser);
    });

    it('should not find user with different email', async () => {
      await userService.create(mockUser);
      
      const foundUser = await userService.findByEmail('different@example.com');
      expect(foundUser).toBeUndefined();
    });

    it('should not find soft-deleted users', async () => {
      await userService.create(mockUser);
      await userService.softDelete(mockUser.email);
      
      const foundUser = await userService.findByEmail(mockUser.email);
      expect(foundUser).toBeUndefined();
    });
  });

  describe('softDelete', () => {
    it('should set deleted_at timestamp on user', async () => {
      await userService.create(mockUser);
      await userService.softDelete(mockUser.email);
      
      const users = (userService as any).users;
      const deletedUser = users.find((u: User) => u.email === mockUser.email);
      expect(deletedUser.deleted_at).toBeInstanceOf(Date);
      expect(deletedUser.updated_at).toBeNull();
    });

    it('should not affect other users', async () => {
      const otherUser: User = {
        ...mockUser,
        id: '2',
        email: 'other@example.com'
      };
      
      await userService.create(mockUser);
      await userService.create(otherUser);
      await userService.softDelete(mockUser.email);
      
      const foundOtherUser = await userService.findByEmail(otherUser.email);
      expect(foundOtherUser).toBeDefined();
      expect(foundOtherUser?.deleted_at).toBeNull();
    });
  });

  describe('__test_reset', () => {
    it('should clear all stored users', async () => {
      await userService.create(mockUser);
      userService.__test_reset();
      
      const foundUser = await userService.findByEmail(mockUser.email);
      expect(foundUser).toBeUndefined();
    });
  });
}); 
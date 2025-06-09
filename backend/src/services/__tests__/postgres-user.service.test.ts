import { Pool, QueryResult } from 'pg';
import { PostgresUserService } from '@services/postgres-user.service';
import { User } from '@models/user';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PostgresUserService', () => {
  let mockPool: { 
    query: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  };
  let userService: PostgresUserService;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
      end: vi.fn(),
    };

    userService = new PostgresUserService(mockPool as unknown as Pool);
  });

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword123',
    created_at: new Date('2024-01-01'),
    updated_at: null,
    deleted_at: null
  };

  describe('create', () => {
    it('should create a user in the database', async () => {
      const mockCreatedUser = {
        ...mockUser,
        created_at: new Date('2024-01-01')
      };
      (mockPool.query as any).mockResolvedValue({
        rows: [mockCreatedUser],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<User>);

      const result = await userService.create(mockUser);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [mockUser.id, mockUser.email, mockUser.password]
      );
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('findByEmail', () => {
    it('should find existing user by email', async () => {
      (mockPool.query as any).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<User>);

      const result = await userService.findByEmail(mockUser.email);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        [mockUser.email]
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined for non-existent user', async () => {
      (mockPool.query as any).mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<User>);

      const result = await userService.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });

    it('should not find soft-deleted users', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      (mockPool.query as any).mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<User>);

      const result = await userService.findByEmail(deletedUser.email);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND deleted_at IS NULL'),
        [deletedUser.email]
      );
      expect(result).toBeUndefined();
    });
  });

  describe('softDelete', () => {
    it('should set deleted_at timestamp and only affect non-deleted users', async () => {
      await userService.softDelete(mockUser.email);

      // The actual query in the implementation has line breaks and spacing
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users') &&
        expect.stringContaining('SET deleted_at = CURRENT_TIMESTAMP') &&
        expect.stringContaining('WHERE email = $1 AND deleted_at IS NULL'),
        [mockUser.email]
      );
    });
  });
}); 
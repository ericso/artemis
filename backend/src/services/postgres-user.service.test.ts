import { Pool, QueryResult } from 'pg';
import { PostgresUserService } from '@services/postgres-user.service';
import { User } from '@models/user';

describe('PostgresUserService', () => {
  let mockPool: { 
    query: jest.Mock<Promise<QueryResult<User>>>;
    end: jest.Mock;
  };
  let userService: PostgresUserService;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
      end: jest.fn(),
    };

    userService = new PostgresUserService(mockPool as unknown as Pool);
  });

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword',
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
      mockPool.query.mockResolvedValue({
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
      mockPool.query.mockResolvedValue({
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
      mockPool.query.mockResolvedValue({
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
      mockPool.query.mockResolvedValue({
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
    it('should set deleted_at timestamp', async () => {
      await userService.softDelete(mockUser.email);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET deleted_at = CURRENT_TIMESTAMP'),
        [mockUser.email]
      );
    });

    it('should only delete non-deleted users', async () => {
      await userService.softDelete(mockUser.email);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1 AND deleted_at IS NULL'),
        [mockUser.email]
      );
    });
  });
}); 
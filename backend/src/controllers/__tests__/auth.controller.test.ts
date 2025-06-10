import { Response } from 'express';
import { AuthController, AuthRequestBody, AuthResponse } from '@controllers/auth.controller';
import { UserService } from '@services/user.service';
import { hashPassword, comparePassword, generateToken } from '@utils/auth.utils';
import { User } from '@models/user';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { AuthRequest } from '@middleware/auth.middleware';

// Mock the utils
vi.mock('@utils/auth.utils', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  generateToken: vi.fn()
}));

describe('AuthController', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response<AuthResponse>>;
  let mockNext: Mock;
  let mockUserService: UserService;
  let authController: AuthController;

  beforeEach(() => {
    mockUserService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      softDelete: vi.fn()
    } as unknown as UserService;

    authController = new AuthController(mockUserService);

    mockRequest = {
      body: {} as AuthRequestBody
    };
    
    mockResponse = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis()
    };

    mockNext = vi.fn();

    vi.clearAllMocks();
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully register a new user', async () => {
      mockRequest.body = validRegistrationData;
      (mockUserService.findByEmail as any).mockResolvedValue(undefined);
      (mockUserService.create as any).mockImplementation((user: Partial<User>) => Promise.resolve({
        ...user,
        created_at: new Date(),
        updated_at: undefined,
        deleted_at: undefined
      }));
      (hashPassword as any).mockResolvedValue('hashedPassword');
      (generateToken as any).mockReturnValue('mockToken');

      await authController.register(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockUserService.create).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User registered successfully',
        token: 'mockToken'
      }));
    });

    it('should return 400 if user already exists', async () => {
      mockRequest.body = validRegistrationData;
      (mockUserService.findByEmail as any).mockResolvedValue({
        id: '1',
        email: validRegistrationData.email,
        password: 'hashedPassword',
        created_at: new Date(),
        updated_at: undefined,
        deleted_at: undefined
      });

      await authController.register(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockUserService.create).not.toHaveBeenCalled();
    });

    it('should return 500 if registration fails', async () => {
      mockRequest.body = validRegistrationData;
      (mockUserService.findByEmail as any).mockResolvedValue(undefined);
      (hashPassword as any).mockRejectedValue(new Error('Hash failed'));

      await authController.register(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockUserService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const validUser: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      created_at: new Date(),
      updated_at: undefined,
      deleted_at: undefined
    };

    it('should successfully login an existing user', async () => {
      mockRequest.body = {
        email: validUser.email,
        password: 'password123'
      };
      (mockUserService.findByEmail as any).mockResolvedValue(validUser);
      (comparePassword as any).mockResolvedValue(true);
      (generateToken as any).mockReturnValue('loginToken');

      await authController.login(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Login successful',
        token: 'loginToken',
        user: expect.objectContaining({
          id: validUser.id,
          email: validUser.email
        })
      }));
    });

    it('should return 401 for non-existent user', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      (mockUserService.findByEmail as any).mockResolvedValue(undefined);

      await authController.login(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 for soft-deleted user', async () => {
      mockRequest.body = {
        email: validUser.email,
        password: 'password123'
      };
      // findByEmail will return undefined for soft-deleted users
      (mockUserService.findByEmail as any).mockResolvedValue(undefined);

      await authController.login(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 for invalid password', async () => {
      mockRequest.body = {
        email: validUser.email,
        password: 'wrongpassword'
      };
      (mockUserService.findByEmail as any).mockResolvedValue(validUser);
      (comparePassword as any).mockResolvedValue(false);

      await authController.login(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 500 if login fails', async () => {
      mockRequest.body = {
        email: validUser.email,
        password: validUser.password
      };
      (mockUserService.findByEmail as any).mockRejectedValue(new Error('Database error'));

      await authController.login(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error logging in'
      });
    });
  });
}); 
import { Request, Response } from 'express';
import { AuthController, AuthRequestBody, AuthResponse } from '@controllers/auth.controller';
import { UserService } from '@services/user.service';
import { hashPassword, comparePassword, generateToken } from '@utils/auth.utils';
import { User } from '@models/user';

// Mock the utils
jest.mock('@utils/auth.utils', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn()
}));

type AuthRequest = Request<Record<string, never>, AuthResponse, AuthRequestBody>;

describe('AuthController', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response<AuthResponse>>;
  let mockUserService: jest.Mocked<UserService>;
  let authController: AuthController;

  beforeEach(() => {
    mockUserService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      softDelete: jest.fn()
    };

    authController = new AuthController(mockUserService);

    mockRequest = {
      body: {} as AuthRequestBody
    };
    
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully register a new user', async () => {
      mockRequest.body = validRegistrationData;
      mockUserService.findByEmail.mockResolvedValue(undefined);
      mockUserService.create.mockImplementation(user => Promise.resolve({
        ...user,
        created_at: new Date(),
        updated_at: undefined,
        deleted_at: undefined
      }));
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (generateToken as jest.Mock).mockReturnValue('mockToken');

      await authController.register(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockUserService.create).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User registered successfully',
        token: 'mockToken'
      }));
    });

    it('should return 400 if user already exists', async () => {
      mockRequest.body = validRegistrationData;
      mockUserService.findByEmail.mockResolvedValue({
        id: '1',
        email: validRegistrationData.email,
        password: 'hashedPassword',
        created_at: new Date(),
        updated_at: undefined,
        deleted_at: undefined
      });

      await authController.register(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockUserService.create).not.toHaveBeenCalled();
    });

    it('should return 500 if registration fails', async () => {
      mockRequest.body = validRegistrationData;
      mockUserService.findByEmail.mockResolvedValue(undefined);
      (hashPassword as jest.Mock).mockRejectedValue(new Error('Hash failed'));

      await authController.register(mockRequest as AuthRequest, mockResponse as Response);

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
      mockUserService.findByEmail.mockResolvedValue(validUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('loginToken');

      await authController.login(mockRequest as AuthRequest, mockResponse as Response);

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
      mockUserService.findByEmail.mockResolvedValue(undefined);

      await authController.login(mockRequest as AuthRequest, mockResponse as Response);

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
      mockUserService.findByEmail.mockResolvedValue(undefined);

      await authController.login(mockRequest as AuthRequest, mockResponse as Response);

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
      mockUserService.findByEmail.mockResolvedValue(validUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await authController.login(mockRequest as AuthRequest, mockResponse as Response);

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
      mockUserService.findByEmail.mockRejectedValue(new Error('Database error'));

      await authController.login(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error logging in'
      });
    });
  });
}); 
import { Response } from 'express';
import { CarController } from '@controllers/car.controller';
import { PostgresCarService } from '@services/postgres-car.service';
import { Car } from '@models/car';
import { AuthRequest } from '@middleware/auth.middleware';
import { Pool } from 'pg';

// Mock the uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}));

describe('CarController', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockCarService: jest.Mocked<PostgresCarService>;
  let carController: CarController;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress console.error messages
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockCarService = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      db: {} as Pool,
      mapRowToCar: jest.fn()
    } as unknown as jest.Mocked<PostgresCarService>;

    carController = new CarController();
    // Replace the private carService with our mock
    (carController as any).carService = mockCarService;

    mockRequest = {
      user: {
        id: 'user-123',
        email: 'test@example.com'
      },
      body: {},
      params: {}
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('createCar', () => {
    const validCarData = {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'ABC123XYZ',
      name: 'My Car'
    };

    it('should successfully create a new car', async () => {
      mockRequest.body = validCarData;
      const expectedCar: Car = {
        ...validCarData,
        id: 'mock-uuid',
        user_id: 'user-123',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null
      };

      mockCarService.create.mockResolvedValue(expectedCar);

      await carController.createCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.create).toHaveBeenCalledWith(expect.objectContaining({
        ...validCarData,
        id: 'mock-uuid',
        user_id: 'user-123'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedCar);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.body = validCarData;
      mockRequest.user = undefined;

      await carController.createCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
    });

    it('should return 500 if creation fails', async () => {
      mockRequest.body = validCarData;
      mockCarService.create.mockRejectedValue(new Error('Database error'));

      await carController.createCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error creating car'
      });
    });
  });

  describe('updateCar', () => {
    const carId = 'car-123';
    const updateData = {
      name: 'Updated Car Name',
      year: 2021
    };
    const existingCar: Car = {
      id: carId,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'ABC123XYZ',
      name: 'Original Name',
      user_id: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    it('should successfully update a car', async () => {
      mockRequest.params = { id: carId };
      mockRequest.body = updateData;
      mockCarService.findById.mockResolvedValue(existingCar);
      mockCarService.update.mockResolvedValue({
        ...existingCar,
        ...updateData,
        updated_at: new Date()
      });

      await carController.updateCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.update).toHaveBeenCalledWith(carId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        ...existingCar,
        ...updateData,
        updated_at: expect.any(Date)
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.params = { id: carId };
      mockRequest.body = updateData;
      mockRequest.user = undefined;

      await carController.updateCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if car does not exist', async () => {
      mockRequest.params = { id: carId };
      mockRequest.body = updateData;
      mockCarService.findById.mockResolvedValue(undefined);

      await carController.updateCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if user does not own the car', async () => {
      mockRequest.params = { id: carId };
      mockRequest.body = updateData;
      mockCarService.findById.mockResolvedValue({
        ...existingCar,
        user_id: 'different-user'
      });

      await carController.updateCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should return 500 if update fails', async () => {
      mockRequest.params = { id: carId };
      mockRequest.body = updateData;
      mockCarService.findById.mockResolvedValue(existingCar);
      mockCarService.update.mockRejectedValue(new Error('Database error'));

      await carController.updateCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteCar', () => {
    const carId = 'car-123';
    const existingCar: Car = {
      id: carId,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'ABC123XYZ',
      name: 'Car to Delete',
      user_id: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    it('should successfully delete a car', async () => {
      mockRequest.params = { id: carId };
      mockCarService.findById.mockResolvedValue(existingCar);
      mockCarService.softDelete.mockResolvedValue();

      await carController.deleteCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.softDelete).toHaveBeenCalledWith(carId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.params = { id: carId };
      mockRequest.user = undefined;

      await carController.deleteCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if car does not exist', async () => {
      mockRequest.params = { id: carId };
      mockCarService.findById.mockResolvedValue(undefined);

      await carController.deleteCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if user does not own the car', async () => {
      mockRequest.params = { id: carId };
      mockCarService.findById.mockResolvedValue({
        ...existingCar,
        user_id: 'different-user'
      });

      await carController.deleteCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should return 500 if deletion fails', async () => {
      mockRequest.params = { id: carId };
      mockCarService.findById.mockResolvedValue(existingCar);
      mockCarService.softDelete.mockRejectedValue(new Error('Database error'));

      await carController.deleteCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
}); 
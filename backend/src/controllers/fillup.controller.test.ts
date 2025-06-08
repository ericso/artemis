import { Response } from 'express';
import { FillupController } from '@controllers/fillup.controller';
import { PostgresFillupService } from '@services/postgres-fillup.service';
import { PostgresCarService } from '@services/postgres-car.service';
import { Fillup } from '@models/fillup';
import { Car } from '@models/car';
import { AuthRequest } from '@middleware/auth.middleware';
import { Pool } from 'pg';

// Mock the uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}));

describe('FillupController', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockFillupService: jest.Mocked<PostgresFillupService>;
  let mockCarService: jest.Mocked<PostgresCarService>;
  let fillupController: FillupController;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress console.error messages
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockFillupService = {
      findById: jest.fn(),
      findByCarId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      db: {} as Pool,
      mapRowToFillup: jest.fn()
    } as unknown as jest.Mocked<PostgresFillupService>;

    mockCarService = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      db: {} as Pool,
      mapRowToCar: jest.fn()
    } as unknown as jest.Mocked<PostgresCarService>;

    fillupController = new FillupController();
    // Replace the private services with our mocks using type assertion
    (fillupController as unknown as { 
      fillupService: PostgresFillupService;
      carService: PostgresCarService;
    }).fillupService = mockFillupService;
    (fillupController as unknown as { 
      fillupService: PostgresFillupService;
      carService: PostgresCarService;
    }).carService = mockCarService;

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
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('createFillup', () => {
    const validFillupData: Omit<Fillup, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> = {
      car_id: 'car-123',
      date: new Date('2024-03-15T10:00:00Z'),
      gallons: 12.345,
      total_cost: 45.67,
      odometer_reading: 50000,
      station_address: '123 Gas Station St',
      notes: 'Regular fill-up'
    };

    const userOwnedCar: Car = {
      id: 'car-123',
      user_id: 'user-123',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'ABC123XYZ',
      name: 'My Car',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    };

    it('should successfully create a new fillup for user owned car', async () => {
      mockRequest.body = validFillupData;
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      const expectedFillup: Fillup = {
        ...validFillupData,
        id: 'mock-uuid',
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      };

      mockFillupService.create.mockResolvedValue(expectedFillup);

      await fillupController.createFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.findById).toHaveBeenCalledWith(validFillupData.car_id);
      expect(mockFillupService.create).toHaveBeenCalledWith(expect.objectContaining({
        ...validFillupData,
        id: 'mock-uuid'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedFillup);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.body = validFillupData;
      mockRequest.user = undefined;

      await fillupController.createFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.findById).not.toHaveBeenCalled();
      expect(mockFillupService.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
    });

    it('should return 404 if car does not exist', async () => {
      mockRequest.body = validFillupData;
      mockCarService.findById.mockResolvedValue(undefined);

      await fillupController.createFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Car not found'
      });
    });

    it('should return 403 if user does not own the car', async () => {
      mockRequest.body = validFillupData;
      mockCarService.findById.mockResolvedValue({
        ...userOwnedCar,
        user_id: 'different-user'
      });

      await fillupController.createFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
    });

    it('should return 500 if creation fails', async () => {
      mockRequest.body = validFillupData;
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.create.mockRejectedValue(new Error('Database error'));

      await fillupController.createFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error creating fillup'
      });
    });
  });

  describe('updateFillup', () => {
    const fillupId = 'fillup-123';
    const updateData: Partial<Fillup> = {
      gallons: 15.0,
      total_cost: 55.50,
      notes: 'Updated notes'
    };
    const existingFillup: Fillup = {
      id: fillupId,
      car_id: 'car-123',
      date: new Date('2024-03-15T10:00:00Z'),
      gallons: 12.345,
      total_cost: 45.67,
      odometer_reading: 50000,
      station_address: '123 Gas Station St',
      notes: 'Regular fill-up',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    };
    const userOwnedCar: Car = {
      id: 'car-123',
      user_id: 'user-123',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'ABC123XYZ',
      name: 'My Car',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    };

    it('should successfully update a fillup for user owned car', async () => {
      mockRequest.params = { id: fillupId };
      mockRequest.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      const updatedFillup: Fillup = {
        ...existingFillup,
        ...updateData,
        updated_at: new Date()
      };
      mockFillupService.update.mockResolvedValue(updatedFillup);

      await fillupController.updateFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.findById).toHaveBeenCalledWith(existingFillup.car_id);
      expect(mockFillupService.update).toHaveBeenCalledWith(fillupId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        ...existingFillup,
        ...updateData,
        updated_at: expect.any(Date)
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.params = { id: fillupId };
      mockRequest.body = updateData;
      mockRequest.user = undefined;

      await fillupController.updateFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if fillup does not exist', async () => {
      mockRequest.params = { id: fillupId };
      mockRequest.body = updateData;
      mockFillupService.findById.mockResolvedValue(undefined);

      await fillupController.updateFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Fillup not found'
      });
    });

    it('should return 404 if car does not exist', async () => {
      mockRequest.params = { id: fillupId };
      mockRequest.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(undefined);

      await fillupController.updateFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Car not found'
      });
    });

    it('should return 403 if user does not own the car', async () => {
      mockRequest.params = { id: fillupId };
      mockRequest.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue({
        ...userOwnedCar,
        user_id: 'different-user'
      });

      await fillupController.updateFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
    });

    it('should return 500 if update fails', async () => {
      mockRequest.params = { id: fillupId };
      mockRequest.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.update.mockRejectedValue(new Error('Database error'));

      await fillupController.updateFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should return 404 if update operation returns undefined', async () => {
      mockRequest.params = { id: fillupId };
      mockRequest.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.update.mockResolvedValue(undefined);

      await fillupController.updateFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Fillup not found'
      });
    });
  });

  describe('deleteFillup', () => {
    const fillupId = 'fillup-123';
    const existingFillup: Fillup = {
      id: fillupId,
      car_id: 'car-123',
      date: new Date('2024-03-15T10:00:00Z'),
      gallons: 12.345,
      total_cost: 45.67,
      odometer_reading: 50000,
      station_address: '123 Gas Station St',
      notes: 'Fill-up to delete',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    };
    const userOwnedCar: Car = {
      id: 'car-123',
      user_id: 'user-123',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'ABC123XYZ',
      name: 'My Car',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null
    };

    it('should successfully delete a fillup for user owned car', async () => {
      mockRequest.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.softDelete.mockResolvedValue();

      await fillupController.deleteFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.findById).toHaveBeenCalledWith(existingFillup.car_id);
      expect(mockFillupService.softDelete).toHaveBeenCalledWith(fillupId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.params = { id: fillupId };
      mockRequest.user = undefined;

      await fillupController.deleteFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if fillup does not exist', async () => {
      mockRequest.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(undefined);

      await fillupController.deleteFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Fillup not found'
      });
    });

    it('should return 404 if car does not exist', async () => {
      mockRequest.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(undefined);

      await fillupController.deleteFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Car not found'
      });
    });

    it('should return 403 if user does not own the car', async () => {
      mockRequest.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue({
        ...userOwnedCar,
        user_id: 'different-user'
      });

      await fillupController.deleteFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockFillupService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
    });

    it('should return 500 if deletion fails', async () => {
      mockRequest.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.softDelete.mockRejectedValue(new Error('Database error'));

      await fillupController.deleteFillup(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
}); 
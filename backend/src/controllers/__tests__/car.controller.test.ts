import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { Response } from 'express';
import { CarController } from '@controllers/car.controller';
import { PostgresCarService } from '@services/postgres-car.service';
import { Car } from '@models/car';
import { AuthRequest } from '@middleware/auth.middleware';

// Mock the uuid generation
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid')
}));

describe('CarController', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockCarService: {
    create: Mock;
    findById: Mock;
    update: Mock;
    findByUserId: Mock;
    softDelete: Mock;
  };
  let carController: CarController;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.error messages
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockCarService = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      findByUserId: vi.fn(),
      softDelete: vi.fn(),
    };

    carController = new CarController();
    // Replace the private carService with our mock using type assertion
    (carController as unknown as { carService: PostgresCarService }).carService = mockCarService as unknown as PostgresCarService;

    mockRequest = {
      user: {
        id: 'user-123',
        email: 'test@example.com'
      },
      body: {},
      params: {}
    };

    mockResponse = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    } as Partial<Response>;

    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('createCar', () => {
    const validCarData: Omit<Car, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'> = {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'ABC123XYZ',
      name: 'My Car',
      initial_mileage: 50000
    };

    it('should successfully create a new car', async () => {
      mockRequest.body = validCarData;
      const expectedCar: Car = {
        ...validCarData,
        id: 'mock-uuid',
        user_id: 'user-123',
        created_at: new Date(),
        updated_at: new Date(),
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

    it('should set initial_mileage to 0 if not provided', async () => {
      const carDataWithoutMileage = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: 'ABC123XYZ',
        name: 'My Car',
        initial_mileage: 0
      };
      mockRequest.body = carDataWithoutMileage;
      
      await carController.createCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.create).toHaveBeenCalledWith(expect.objectContaining({
        ...carDataWithoutMileage,
        id: 'mock-uuid',
        user_id: 'user-123'
      }));
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
    const updateData: Partial<Car> = {
      name: 'Updated Car Name',
      year: 2021,
      initial_mileage: 55000
    };
    const existingCar: Car = {
      id: carId,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      vin: 'ABC123XYZ',
      name: 'Original Name',
      initial_mileage: 50000,
      user_id: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    it('should successfully update a car', async () => {
      mockRequest.params = { id: carId };
      mockRequest.body = updateData;
      mockCarService.findById.mockResolvedValue(existingCar);
      const updatedCar: Car = {
        ...existingCar,
        ...updateData,
        updated_at: new Date()
      };
      mockCarService.update.mockResolvedValue(updatedCar);

      await carController.updateCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.update).toHaveBeenCalledWith(carId, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        ...existingCar,
        ...updateData,
        updated_at: expect.any(Date)
      }));
    });

    it('should preserve initial_mileage when updating other fields', async () => {
      const updateWithoutMileage: Partial<Car> = {
        name: 'Updated Car Name',
        year: 2021
      };
      mockRequest.params = { id: carId };
      mockRequest.body = updateWithoutMileage;
      mockCarService.findById.mockResolvedValue(existingCar);
      const updatedCar = {
        ...existingCar,
        ...updateWithoutMileage,
        updated_at: new Date()
      };
      mockCarService.update.mockResolvedValue(updatedCar);
      
      await carController.updateCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.update).toHaveBeenCalledWith(carId, updateWithoutMileage);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        ...existingCar,
        ...updateWithoutMileage,
        initial_mileage: existingCar.initial_mileage,
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
      initial_mileage: 50000,
      user_id: 'user-123',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    it('should successfully delete a car', async () => {
      mockRequest.params = { id: carId };
      (mockCarService.findById as any).mockResolvedValue(existingCar);
      (mockCarService.softDelete as any).mockResolvedValue();

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
      (mockCarService.findById as any).mockResolvedValue(undefined);

      await carController.deleteCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if user does not own the car', async () => {
      mockRequest.params = { id: carId };
      (mockCarService.findById as any).mockResolvedValue({
        ...existingCar,
        user_id: 'different-user'
      });

      await carController.deleteCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockCarService.softDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should return 500 if deletion fails', async () => {
      mockRequest.params = { id: carId };
      (mockCarService.findById as any).mockResolvedValue(existingCar);
      (mockCarService.softDelete as any).mockRejectedValue(new Error('Database error'));

      await carController.deleteCar(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
}); 
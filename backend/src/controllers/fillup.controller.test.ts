import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Response } from 'express';
import { FillupController } from './fillup.controller';
import { Fillup } from '../models/fillup';
import { Car } from '../models/car';
import { AuthRequest } from '../middleware/auth.middleware';

// Mock the services
vi.mock('../services/fillup.service');
vi.mock('../services/car.service');

describe('FillupController', () => {
  let mockFillupService: {
    create: Mock;
    findById: Mock;
    findByCarId: Mock;
    update: Mock;
    softDelete: Mock;
  };
  let mockCarService: {
    findById: Mock;
    findByUserId: Mock;
  };
  let fillupController: FillupController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockFillupService = {
      create: vi.fn(),
      findById: vi.fn(),
      findByCarId: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };

    mockCarService = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
    };

    fillupController = new FillupController();
    // Replace the private services with our mocks using type assertion
    (fillupController as any).fillupService = mockFillupService;
    (fillupController as any).carService = mockCarService;
    
    mockReq = {
      user: {
        id: 'user-123',
        email: 'test@example.com'
      },
      query: {},
      params: {},
      body: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
  });

  describe('getFillups', () => {
    const userCars: Car[] = [
      {
        id: 'car-1',
        user_id: 'user-123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: 'ABC123',
        name: 'Car 1',
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      },
      {
        id: 'car-2',
        user_id: 'user-123',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        vin: 'DEF456',
        name: 'Car 2',
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      }
    ];

    const fillups: Fillup[] = [
      {
        id: 'fillup-1',
        car_id: 'car-1',
        date: new Date(),
        gallons: 10,
        total_cost: 30,
        odometer_reading: 50000,
        station_address: 'Station 1',
        notes: 'Note 1',
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      },
      {
        id: 'fillup-2',
        car_id: 'car-2',
        date: new Date(),
        gallons: 12,
        total_cost: 36,
        odometer_reading: 60000,
        station_address: 'Station 2',
        notes: 'Note 2',
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      }
    ];

    it('should return all fillups for all user cars when no carId is provided', async () => {
      mockCarService.findByUserId.mockResolvedValue(userCars);
      mockFillupService.findByCarId.mockImplementation(async (carId) => {
        return fillups.filter(f => f.car_id === carId);
      });

      await fillupController.getFillups(mockReq as AuthRequest, mockRes as Response);

      expect(mockCarService.findByUserId).toHaveBeenCalledWith('user-123');
      expect(mockFillupService.findByCarId).toHaveBeenCalledTimes(2);
      expect(mockRes.json).toHaveBeenCalledWith(fillups);
    });

    it('should return fillups for a specific car when carId is provided', async () => {
      mockReq.query = { carId: 'car-1' };
      mockCarService.findById.mockResolvedValue(userCars[0]);
      mockFillupService.findByCarId.mockResolvedValue([fillups[0]]);

      await fillupController.getFillups(mockReq as AuthRequest, mockRes as Response);

      expect(mockCarService.findById).toHaveBeenCalledWith('car-1');
      expect(mockFillupService.findByCarId).toHaveBeenCalledWith('car-1');
      expect(mockRes.json).toHaveBeenCalledWith([fillups[0]]);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await fillupController.getFillups(mockReq as AuthRequest, mockRes as Response);

      expect(mockCarService.findByUserId).not.toHaveBeenCalled();
      expect(mockFillupService.findByCarId).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
    });

    it('should return 404 if specified car is not found', async () => {
      mockReq.query = { carId: 'non-existent-car' };
      mockCarService.findById.mockResolvedValue(undefined);

      await fillupController.getFillups(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.findByCarId).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Car not found'
      });
    });

    it('should return 403 if user does not own the specified car', async () => {
      mockReq.query = { carId: 'car-3' };
      mockCarService.findById.mockResolvedValue({
        ...userCars[0],
        id: 'car-3',
        user_id: 'different-user'
      });

      await fillupController.getFillups(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.findByCarId).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
    });

    it('should return 500 if an error occurs', async () => {
      mockCarService.findByUserId.mockRejectedValue(new Error('Database error'));

      await fillupController.getFillups(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error fetching fillups'
      });
    });
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
      mockReq.body = validFillupData;
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      const expectedFillup: Fillup = {
        ...validFillupData,
        id: 'mock-uuid',
        created_at: new Date(),
        updated_at: null,
        deleted_at: null
      };

      mockFillupService.create.mockResolvedValue(expectedFillup);

      await fillupController.createFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockCarService.findById).toHaveBeenCalledWith(validFillupData.car_id);
      expect(mockFillupService.create).toHaveBeenCalledWith(expect.objectContaining({
        ...validFillupData,
        id: expect.any(String),
        created_at: expect.any(Date)
      }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        ...validFillupData,
        id: expect.any(String),
        created_at: expect.any(Date),
        updated_at: null,
        deleted_at: null
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.body = validFillupData;
      mockReq.user = undefined;

      await fillupController.createFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockCarService.findById).not.toHaveBeenCalled();
      expect(mockFillupService.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
    });

    it('should return 404 if car does not exist', async () => {
      mockReq.body = validFillupData;
      mockCarService.findById.mockResolvedValue(undefined);

      await fillupController.createFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Car not found'
      });
    });

    it('should return 403 if user does not own the car', async () => {
      mockReq.body = validFillupData;
      mockCarService.findById.mockResolvedValue({
        ...userOwnedCar,
        user_id: 'different-user'
      });

      await fillupController.createFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
    });

    it('should return 500 if creation fails', async () => {
      mockReq.body = validFillupData;
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.create.mockRejectedValue(new Error('Database error'));

      await fillupController.createFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
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
      mockReq.params = { id: fillupId };
      mockReq.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      const updatedFillup: Fillup = {
        ...existingFillup,
        ...updateData,
        updated_at: new Date()
      };
      mockFillupService.update.mockResolvedValue(updatedFillup);

      await fillupController.updateFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockCarService.findById).toHaveBeenCalledWith(existingFillup.car_id);
      expect(mockFillupService.update).toHaveBeenCalledWith(fillupId, updateData);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        ...existingFillup,
        ...updateData,
        updated_at: expect.any(Date)
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.params = { id: fillupId };
      mockReq.body = updateData;
      mockReq.user = undefined;

      await fillupController.updateFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if fillup does not exist', async () => {
      mockReq.params = { id: fillupId };
      mockReq.body = updateData;
      mockFillupService.findById.mockResolvedValue(undefined);

      await fillupController.updateFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Fillup not found'
      });
    });

    it('should return 404 if car does not exist', async () => {
      mockReq.params = { id: fillupId };
      mockReq.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(undefined);

      await fillupController.updateFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Car not found'
      });
    });

    it('should return 403 if user does not own the car', async () => {
      mockReq.params = { id: fillupId };
      mockReq.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue({
        ...userOwnedCar,
        user_id: 'different-user'
      });

      await fillupController.updateFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
    });

    it('should return 500 if update fails', async () => {
      mockReq.params = { id: fillupId };
      mockReq.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.update.mockRejectedValue(new Error('Database error'));

      await fillupController.updateFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should return 404 if update operation returns undefined', async () => {
      mockReq.params = { id: fillupId };
      mockReq.body = updateData;
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.update.mockResolvedValue(undefined);

      await fillupController.updateFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Fillup not found'
      });
    });
  });

  describe('deleteFillup', () => {
    const fillupId = 'fillup-123';
    const existingFillup: Fillup = {
      id: fillupId,
      car_id: 'car-123',
      date: new Date('2024-01-01'),
      gallons: 12.345,
      total_cost: 45.67,
      odometer_reading: 50000,
      station_address: '123 Gas Station St',
      notes: 'Regular fill-up',
      created_at: new Date('2024-01-01'),
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
      mockReq.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.softDelete.mockResolvedValueOnce(undefined);

      await fillupController.deleteFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockCarService.findById).toHaveBeenCalledWith(existingFillup.car_id);
      expect(mockFillupService.softDelete).toHaveBeenCalledWith(fillupId);
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockReq.params = { id: fillupId };
      mockReq.user = undefined;

      await fillupController.deleteFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.softDelete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if fillup does not exist', async () => {
      mockReq.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(undefined);

      await fillupController.deleteFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.softDelete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Fillup not found'
      });
    });

    it('should return 404 if car does not exist', async () => {
      mockReq.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(undefined);

      await fillupController.deleteFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.softDelete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Car not found'
      });
    });

    it('should return 403 if user does not own the car', async () => {
      mockReq.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue({
        ...userOwnedCar,
        user_id: 'different-user'
      });

      await fillupController.deleteFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockFillupService.softDelete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Forbidden'
      });
    });

    it('should return 500 if deletion fails', async () => {
      mockReq.params = { id: fillupId };
      mockFillupService.findById.mockResolvedValue(existingFillup);
      mockCarService.findById.mockResolvedValue(userOwnedCar);
      mockFillupService.softDelete.mockRejectedValue(new Error('Database error'));

      await fillupController.deleteFillup(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
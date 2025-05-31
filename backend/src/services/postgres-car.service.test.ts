import { Pool, QueryResult } from 'pg';
import { PostgresCarService } from '@services/postgres-car.service';
import { Car } from '@models/car';

describe('PostgresCarService', () => {
  let mockPool: { 
    query: jest.Mock<Promise<QueryResult<Car>>>;
    end: jest.Mock;
  };
  let carService: PostgresCarService;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
      end: jest.fn(),
    };

    carService = new PostgresCarService(mockPool as unknown as Pool);
  });

  const mockCar: Car = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    vin: 'ABC123XYZ',
    name: 'My Car',
    user_id: '987fcdeb-51a2-43f7-9abc-def012345678',
    created_at: new Date('2024-01-01'),
    updated_at: null,
    deleted_at: null
  };

  describe('findById', () => {
    it('should find existing car by id', async () => {
      mockPool.query.mockResolvedValue({
        rows: [mockCar],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.findById(mockCar.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM cars'),
        [mockCar.id]
      );
      expect(result).toEqual(mockCar);
    });

    it('should return undefined for non-existent car', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.findById('nonexistent-id');

      expect(result).toBeUndefined();
    });

    it('should not find soft-deleted cars', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.findById(mockCar.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND deleted_at IS NULL'),
        [mockCar.id]
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should find all cars for a user', async () => {
      const mockCars = [mockCar, { ...mockCar, id: 'another-id', name: 'Second Car' }];
      mockPool.query.mockResolvedValue({
        rows: mockCars,
        rowCount: 2,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.findByUserId(mockCar.user_id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM cars WHERE user_id = $1'),
        [mockCar.user_id]
      );
      expect(result).toEqual(mockCars);
    });

    it('should return empty array when user has no cars', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.findByUserId('user-with-no-cars');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a car in the database', async () => {
      const mockCreatedCar = {
        ...mockCar,
        created_at: new Date('2024-01-01')
      };
      mockPool.query.mockResolvedValue({
        rows: [mockCreatedCar],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.create(mockCar);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cars'),
        [mockCar.id, mockCar.make, mockCar.model, mockCar.year, mockCar.vin, mockCar.name, mockCar.user_id]
      );
      expect(result).toEqual(mockCreatedCar);
    });
  });

  describe('update', () => {
    it('should update specified fields of a car', async () => {
      const updateData = {
        make: 'Honda',
        model: 'Accord'
      };
      const updatedCar = { ...mockCar, ...updateData, updated_at: new Date() };
      mockPool.query.mockResolvedValue({
        rows: [updatedCar],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.update(mockCar.id, updateData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE cars.*make.*model.*updated_at/s),
        expect.arrayContaining([updateData.make, updateData.model, mockCar.id])
      );
      expect(result).toEqual(updatedCar);
    });

    it('should return undefined when updating non-existent car', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.update('nonexistent-id', { make: 'Honda' });

      expect(result).toBeUndefined();
    });

    it('should handle empty update object by returning existing car', async () => {
      mockPool.query.mockResolvedValue({
        rows: [mockCar],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Car>);

      const result = await carService.update(mockCar.id, {});

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM cars'),
        [mockCar.id]
      );
      expect(result).toEqual(mockCar);
    });
  });

  describe('softDelete', () => {
    it('should set deleted_at timestamp on car', async () => {
      await carService.softDelete(mockCar.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE cars.*SET deleted_at/s),
        [mockCar.id]
      );
    });

    it('should only delete non-deleted cars', async () => {
      await carService.softDelete(mockCar.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND deleted_at IS NULL'),
        [mockCar.id]
      );
    });
  });
}); 
import { Pool, QueryResult } from 'pg';
import { PostgresFillupService } from './postgres-fillup.service';
import { Fillup } from '../models/fillup';

describe('PostgresFillupService', () => {
  let mockPool: { 
    query: jest.Mock<Promise<QueryResult<Fillup>>>;
    end: jest.Mock;
  };
  let fillupService: PostgresFillupService;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
      end: jest.fn(),
    };

    fillupService = new PostgresFillupService(mockPool as unknown as Pool);
  });

  const mockFillup: Fillup = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    car_id: '987fcdeb-51a2-43f7-9abc-def012345678',
    date: new Date('2024-03-15T10:00:00Z'),
    gallons: 12.345,
    total_cost: 45.67,
    odometer_reading: 50000,
    station_address: '123 Gas Station St',
    notes: 'Regular fill-up',
    created_at: new Date('2024-03-15T10:00:00Z'),
    updated_at: null,
    deleted_at: null
  };

  describe('findById', () => {
    it('should find existing fillup by id', async () => {
      mockPool.query.mockResolvedValue({
        rows: [mockFillup],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.findById(mockFillup.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM fillups'),
        [mockFillup.id]
      );
      expect(result).toEqual(mockFillup);
    });

    it('should return undefined for non-existent fillup', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.findById('nonexistent-id');

      expect(result).toBeUndefined();
    });

    it('should not find soft-deleted fillups', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.findById(mockFillup.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND deleted_at IS NULL'),
        [mockFillup.id]
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findByCarId', () => {
    it('should find all fillups for a car', async () => {
      const mockFillups = [
        mockFillup,
        { ...mockFillup, id: 'another-id', date: new Date('2024-03-14T10:00:00Z') }
      ];
      mockPool.query.mockResolvedValue({
        rows: mockFillups,
        rowCount: 2,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.findByCarId(mockFillup.car_id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM fillups WHERE car_id = $1'),
        [mockFillup.car_id]
      );
      expect(result).toEqual(mockFillups);
    });

    it('should return empty array when car has no fillups', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.findByCarId('car-with-no-fillups');

      expect(result).toEqual([]);
    });

    it('should order fillups by date descending', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      await fillupService.findByCarId(mockFillup.car_id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY date DESC'),
        [mockFillup.car_id]
      );
    });
  });

  describe('create', () => {
    it('should create a fillup in the database', async () => {
      const mockCreatedFillup = {
        ...mockFillup,
        created_at: new Date('2024-03-15T10:00:00Z')
      };
      mockPool.query.mockResolvedValue({
        rows: [mockCreatedFillup],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.create(mockFillup);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO fillups'),
        [
          mockFillup.id,
          mockFillup.car_id,
          mockFillup.date,
          mockFillup.gallons,
          mockFillup.total_cost,
          mockFillup.odometer_reading,
          mockFillup.station_address,
          mockFillup.notes
        ]
      );
      expect(result).toEqual(mockCreatedFillup);
    });
  });

  describe('update', () => {
    it('should update specified fields of a fillup', async () => {
      const updateData = {
        gallons: 15.0,
        total_cost: 55.50
      };
      const updatedFillup = { ...mockFillup, ...updateData, updated_at: new Date() };
      mockPool.query.mockResolvedValue({
        rows: [updatedFillup],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.update(mockFillup.id, updateData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE fillups.*gallons.*total_cost.*updated_at/s),
        expect.arrayContaining([updateData.gallons, updateData.total_cost, mockFillup.id])
      );
      expect(result).toEqual(updatedFillup);
    });

    it('should return undefined when updating non-existent fillup', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.update('nonexistent-id', { gallons: 15.0 });

      expect(result).toBeUndefined();
    });

    it('should handle empty update object by returning existing fillup', async () => {
      mockPool.query.mockResolvedValue({
        rows: [mockFillup],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.update(mockFillup.id, {});

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM fillups'),
        [mockFillup.id]
      );
      expect(result).toEqual(mockFillup);
    });
  });

  describe('softDelete', () => {
    it('should set deleted_at timestamp on fillup', async () => {
      await fillupService.softDelete(mockFillup.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE fillups.*SET deleted_at/s),
        [mockFillup.id]
      );
    });

    it('should only delete non-deleted fillups', async () => {
      await fillupService.softDelete(mockFillup.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND deleted_at IS NULL'),
        [mockFillup.id]
      );
    });
  });
}); 
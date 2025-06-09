import { Pool, QueryResult } from 'pg';
import { PostgresFillupService } from '@services/postgres-fillup.service';
import { Fillup } from '@models/fillup';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PostgresFillupService', () => {
  let mockPool: { 
    query: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  };
  let fillupService: PostgresFillupService;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
      end: vi.fn(),
    };

    fillupService = new PostgresFillupService(mockPool as unknown as Pool);
  });

  const mockFillup: Fillup = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    car_id: '987fcdeb-51a2-43f7-9abc-def012345678',
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

  describe('findById', () => {
    it('should find existing fillup by id', async () => {
      (mockPool.query as any).mockResolvedValue({
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
      (mockPool.query as any).mockResolvedValue({
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
      (mockPool.query as any).mockResolvedValue({
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
      const fillups = [mockFillup, { ...mockFillup, id: 'fillup-2' }];
      (mockPool.query as any).mockResolvedValue({
        rows: fillups,
        rowCount: fillups.length,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.findByCarId(mockFillup.car_id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM fillups'),
        [mockFillup.car_id]
      );
      expect(result).toEqual(fillups);
    });

    it('should return empty array when car has no fillups', async () => {
      (mockPool.query as any).mockResolvedValue({
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
      const fillups = [
        { ...mockFillup, date: new Date('2024-01-02') },
        { ...mockFillup, date: new Date('2024-01-01') }
      ];
      (mockPool.query as any).mockResolvedValue({
        rows: fillups,
        rowCount: fillups.length,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.findByCarId(mockFillup.car_id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY date DESC'),
        [mockFillup.car_id]
      );
      expect(result).toEqual(fillups);
    });
  });

  describe('create', () => {
    it('should create a fillup in the database', async () => {
      const newFillup = { ...mockFillup };
      (mockPool.query as any).mockResolvedValue({
        rows: [newFillup],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.create(newFillup);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO fillups'),
        expect.arrayContaining([
          newFillup.car_id,
          newFillup.date,
          newFillup.gallons,
          newFillup.total_cost,
          newFillup.odometer_reading,
          newFillup.station_address,
          newFillup.notes
        ])
      );
      expect(result).toEqual(newFillup);
    });
  });

  describe('update', () => {
    it('should update specified fields of a fillup', async () => {
      const updates = {
        odometer_reading: 55000,
        notes: 'Updated notes'
      };
      const updatedFillup = { ...mockFillup, ...updates };
      (mockPool.query as any).mockResolvedValue({
        rows: [updatedFillup],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.update(mockFillup.id, updates);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE fillups'),
        expect.arrayContaining([mockFillup.id])
      );
      expect(result).toEqual(updatedFillup);
    });

    it('should return undefined when updating non-existent fillup', async () => {
      (mockPool.query as any).mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.update('nonexistent-id', { notes: 'New notes' });

      expect(result).toBeUndefined();
    });

    it('should handle empty update object by returning existing fillup', async () => {
      (mockPool.query as any).mockResolvedValue({
        rows: [mockFillup],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      const result = await fillupService.update(mockFillup.id, {});

      expect(result).toEqual(mockFillup);
    });
  });

  describe('softDelete', () => {
    it('should set deleted_at timestamp on fillup', async () => {
      const deletedFillup = { ...mockFillup, deleted_at: new Date() };
      (mockPool.query as any).mockResolvedValue({
        rows: [deletedFillup],
        rowCount: 1,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      await fillupService.softDelete(mockFillup.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET deleted_at = CURRENT_TIMESTAMP'),
        [mockFillup.id]
      );
    });

    it('should only delete non-deleted fillups', async () => {
      (mockPool.query as any).mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: '',
        fields: [],
        oid: 0,
      } as QueryResult<Fillup>);

      await fillupService.softDelete(mockFillup.id);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND deleted_at IS NULL'),
        [mockFillup.id]
      );
    });
  });
}); 
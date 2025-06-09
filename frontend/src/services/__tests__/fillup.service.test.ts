import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FillupService, type Fillup, type CreateFillupDto } from '@/services/fillup.service';
import axios from '@/lib/axios';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('FillupService', () => {
  const mockFillup: Fillup = {
    id: '1',
    car_id: 'car1',
    date: new Date('2024-03-15'),
    gallons: 10.5,
    total_cost: 35.75,
    odometer_reading: 50000,
    station_address: 'Test Station',
    notes: 'Test Notes',
    created_at: new Date('2024-03-15T10:00:00Z'),
    updated_at: new Date('2024-03-15T11:00:00Z'),
    deleted_at: null
  };

  const mockCreateFillupDto: CreateFillupDto = {
    car_id: 'car1',
    date: new Date('2024-03-15'),
    gallons: 10.5,
    total_cost: 35.75,
    odometer_reading: 50000,
    station_address: 'Test Station',
    notes: 'Test Notes'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFillups', () => {
    it('should fetch and transform fillups data', async () => {
      const mockResponse = {
        data: [{
          ...mockFillup,
          date: mockFillup.date.toISOString(),
          created_at: mockFillup.created_at.toISOString(),
          updated_at: mockFillup.updated_at?.toISOString(),
          deleted_at: null
        }]
      };

      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      const result = await FillupService.getFillups(mockFillup.car_id);

      expect(axios.get).toHaveBeenCalledWith(`/fillups?carId=${mockFillup.car_id}`);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockFillup);
      expect(result[0].date).toBeInstanceOf(Date);
      expect(result[0].created_at).toBeInstanceOf(Date);
      expect(result[0].updated_at).toBeInstanceOf(Date);
    });

    it('should handle errors', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(FillupService.getFillups(mockFillup.car_id)).rejects.toThrow('Network error');
    });
  });

  describe('createFillup', () => {
    it('should create and transform fillup data', async () => {
      const mockResponse = {
        data: {
          ...mockFillup,
          date: mockFillup.date.toISOString(),
          created_at: mockFillup.created_at.toISOString(),
          updated_at: mockFillup.updated_at?.toISOString(),
          deleted_at: null
        }
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      const result = await FillupService.createFillup(mockCreateFillupDto);

      expect(axios.post).toHaveBeenCalledWith('/fillups', mockCreateFillupDto);
      expect(result).toEqual(mockFillup);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should handle errors', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(FillupService.createFillup(mockCreateFillupDto)).rejects.toThrow('Network error');
    });
  });

  describe('updateFillup', () => {
    const updateData: Partial<CreateFillupDto> = {
      gallons: 11.5,
      total_cost: 40.25
    };

    it('should update and transform fillup data', async () => {
      const mockResponse = {
        data: {
          ...mockFillup,
          gallons: 11.5,
          total_cost: 40.25,
          date: mockFillup.date.toISOString(),
          created_at: mockFillup.created_at.toISOString(),
          updated_at: mockFillup.updated_at?.toISOString(),
          deleted_at: null
        }
      };

      vi.mocked(axios.put).mockResolvedValueOnce(mockResponse);

      const result = await FillupService.updateFillup(mockFillup.id, updateData);

      expect(axios.put).toHaveBeenCalledWith(`/fillups/${mockFillup.id}`, updateData);
      expect(result.gallons).toBe(11.5);
      expect(result.total_cost).toBe(40.25);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should handle errors', async () => {
      vi.mocked(axios.put).mockRejectedValueOnce(new Error('Network error'));

      await expect(FillupService.updateFillup(mockFillup.id, updateData)).rejects.toThrow('Network error');
    });
  });

  describe('deleteFillup', () => {
    it('should delete a fillup', async () => {
      vi.mocked(axios.delete).mockResolvedValueOnce({});

      await FillupService.deleteFillup(mockFillup.id);

      expect(axios.delete).toHaveBeenCalledWith(`/fillups/${mockFillup.id}`);
    });

    it('should handle errors', async () => {
      vi.mocked(axios.delete).mockRejectedValueOnce(new Error('Network error'));

      await expect(FillupService.deleteFillup(mockFillup.id)).rejects.toThrow('Network error');
    });
  });
}); 
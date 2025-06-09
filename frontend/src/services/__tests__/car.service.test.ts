import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CarService, type Car, type CreateCarDto } from '@/services/car.service';
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

describe('CarService', () => {
  const mockCar: Car = {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: 'ABC123',
    name: 'Daily Driver',
    user_id: 'user1',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-02'),
    deleted_at: null
  };

  const mockCreateCarDto: CreateCarDto = {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: 'ABC123',
    name: 'Daily Driver'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCars', () => {
    it('should fetch and transform cars data', async () => {
      const mockResponse = {
        data: [{
          ...mockCar,
          created_at: mockCar.created_at.toISOString(),
          updated_at: mockCar.updated_at?.toISOString(),
          deleted_at: null
        }]
      };

      vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

      const result = await CarService.getCars();

      expect(axios.get).toHaveBeenCalledWith('/cars');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCar);
      expect(result[0].created_at).toBeInstanceOf(Date);
      expect(result[0].updated_at).toBeInstanceOf(Date);
    });

    it('should handle errors', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(CarService.getCars()).rejects.toThrow('Network error');
    });
  });

  describe('createCar', () => {
    it('should create and transform car data', async () => {
      const mockResponse = {
        data: {
          ...mockCar,
          created_at: mockCar.created_at.toISOString(),
          updated_at: mockCar.updated_at?.toISOString(),
          deleted_at: null
        }
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

      const result = await CarService.createCar(mockCreateCarDto);

      expect(axios.post).toHaveBeenCalledWith('/cars', mockCreateCarDto);
      expect(result).toEqual(mockCar);
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should handle errors', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(CarService.createCar(mockCreateCarDto)).rejects.toThrow('Network error');
    });
  });

  describe('updateCar', () => {
    const updateData: Partial<CreateCarDto> = {
      name: 'Updated Name'
    };

    it('should update and transform car data', async () => {
      const mockResponse = {
        data: {
          ...mockCar,
          name: 'Updated Name',
          created_at: mockCar.created_at.toISOString(),
          updated_at: mockCar.updated_at?.toISOString(),
          deleted_at: null
        }
      };

      vi.mocked(axios.put).mockResolvedValueOnce(mockResponse);

      const result = await CarService.updateCar(mockCar.id, updateData);

      expect(axios.put).toHaveBeenCalledWith(`/cars/${mockCar.id}`, updateData);
      expect(result.name).toBe('Updated Name');
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should handle errors', async () => {
      vi.mocked(axios.put).mockRejectedValueOnce(new Error('Network error'));

      await expect(CarService.updateCar(mockCar.id, updateData)).rejects.toThrow('Network error');
    });
  });

  describe('deleteCar', () => {
    it('should delete a car', async () => {
      vi.mocked(axios.delete).mockResolvedValueOnce({});

      await CarService.deleteCar(mockCar.id);

      expect(axios.delete).toHaveBeenCalledWith(`/cars/${mockCar.id}`);
    });

    it('should handle errors', async () => {
      vi.mocked(axios.delete).mockRejectedValueOnce(new Error('Network error'));

      await expect(CarService.deleteCar(mockCar.id)).rejects.toThrow('Network error');
    });
  });
}); 
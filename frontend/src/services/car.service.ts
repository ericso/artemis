import axios from 'axios';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  name: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface CreateCarDto {
  make: string;
  model: string;
  year: number;
  vin?: string;
  name?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the request configuration for debugging
    console.log('Car Service Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      token: token ? 'Present' : 'Not found'
    });
    return config;
  },
  (error) => {
    console.error('Car Service Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Car Service Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Car Service Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const CarService = {
  async getCars(): Promise<Car[]> {
    const response = await api.get('/cars');
    return response.data;
  },

  async createCar(car: CreateCarDto): Promise<Car> {
    const response = await api.post('/cars', car);
    return response.data;
  },

  async updateCar(id: string, car: Partial<CreateCarDto>): Promise<Car> {
    const response = await api.put(`/cars/${id}`, car);
    return response.data;
  },

  async deleteCar(id: string): Promise<void> {
    await api.delete(`/cars/${id}`);
  }
}; 
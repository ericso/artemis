import api from '@/lib/axios'

export interface RegisterData {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  token: string
  user: {
    id: string
    email: string
  }
}

export const auth = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async login(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  }
}

export default api 
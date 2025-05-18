import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { auth } from '@/services/api'
import type { AuthResponse } from '@/services/api'

vi.mock('@/services/api', () => ({
  auth: {
    login: vi.fn(),
    register: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('login', () => {
    it('successfully logs in user', async () => {
      const store = useAuthStore()
      const mockResponse: AuthResponse = {
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com'
        }
      }

      // Mock the auth service login method
      vi.mocked(auth.login).mockResolvedValueOnce(mockResponse)

      const success = await store.login('test@example.com', 'password123')

      expect(success).toBe(true)
      expect(store.token).toBe(mockResponse.token)
      expect(store.user).toEqual(mockResponse.user)
      expect(store.error).toBe(null)
      expect(store.loading).toBe(false)
      expect(localStorage.getItem('token')).toBe(mockResponse.token)
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.user))
    })

    it('handles login failure', async () => {
      const store = useAuthStore()
      const error = new Error('Invalid credentials') as Error & {
        response?: { data: { message: string } }
      }
      error.response = { data: { message: 'Invalid credentials' } }

      // Mock the auth service login method to throw an error
      vi.mocked(auth.login).mockRejectedValueOnce(error)

      const success = await store.login('test@example.com', 'wrong-password')

      expect(success).toBe(false)
      expect(store.token).toBe(null)
      expect(store.user).toBe(null)
      expect(store.error).toBe('Invalid credentials')
      expect(store.loading).toBe(false)
      expect(localStorage.getItem('token')).toBe(null)
      expect(localStorage.getItem('user')).toBe(null)
    })

    it('sets default error message when server error is unclear', async () => {
      const store = useAuthStore()
      
      // Mock the auth service login method to throw a generic error
      vi.mocked(auth.login).mockRejectedValueOnce(new Error('Network error'))

      const success = await store.login('test@example.com', 'password123')

      expect(success).toBe(false)
      expect(store.error).toBe('Login failed')
    })

    it('sets loading state during login', async () => {
      const store = useAuthStore()
      // Mock the auth service login method to never resolve
      vi.mocked(auth.login).mockImplementationOnce(() => new Promise(() => {}))

      store.login('test@example.com', 'password123')
      expect(store.loading).toBe(true)
    })
  })

  describe('logout', () => {
    it('clears user session', () => {
      const store = useAuthStore()
      const mockToken = 'some-token'
      const mockUser = { id: '1', email: 'test@example.com' }
      
      // Set up initial state
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      store.$patch({
        token: mockToken,
        user: mockUser
      })

      store.logout()

      expect(store.token).toBe(null)
      expect(store.user).toBe(null)
      expect(store.error).toBe(null)
      expect(localStorage.getItem('token')).toBe(null)
      expect(localStorage.getItem('user')).toBe(null)
    })
  })
}) 
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, type AuthResponse } from '@/services/api'

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string
    }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<AuthResponse['user'] | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )
  const error = ref<string | null>(null)
  const loading = ref(false)

  function setAuthData(data: AuthResponse) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function clearAuthData() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function register(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      const response = await auth.register({ email, password })
      setAuthData(response)
      return true
    } catch (err: unknown) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      const response = await auth.login({ email, password })
      setAuthData(response)
      return true
    } catch (err: unknown) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    clearAuthData()
  }

  return {
    token,
    user,
    error,
    loading,
    register,
    login,
    logout
  }
}) 
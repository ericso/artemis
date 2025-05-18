import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../LoginView.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Mock router with all necessary routes
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: { template: '<div>Home</div>' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: { template: '<div>Register</div>' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: { template: '<div>Dashboard</div>' }
    }
  ]
})

describe('LoginView', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
    // Initialize router
    router.push('/')
  })

  it('renders properly', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          }),
          router
        ]
      }
    })

    expect(wrapper.find('h1').text()).toBe('Login')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login')
  })

  it('shows loading state when submitting', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { loading: true }
            }
          }),
          router
        ]
      }
    })

    expect(wrapper.find('button[type="submit"]').text()).toBe('Logging in...')
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('displays error message when login fails', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { error: 'Invalid credentials' }
            }
          }),
          router
        ]
      }
    })

    expect(wrapper.find('.error').text()).toBe('Invalid credentials')
  })

  it('calls login action and redirects on successful submission', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn
          }),
          router
        ]
      }
    })

    const authStore = useAuthStore()
    // Mock successful login
    vi.mocked(authStore.login).mockResolvedValue(true)

    // Fill in form
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')

    // Submit form
    await wrapper.find('form').trigger('submit')

    // Verify login was called with correct parameters
    expect(authStore.login).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('disables form inputs while loading', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { loading: true }
            }
          }),
          router
        ]
      }
    })

    expect(wrapper.find('input[type="email"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('input[type="password"]').attributes('disabled')).toBeDefined()
  })
}) 
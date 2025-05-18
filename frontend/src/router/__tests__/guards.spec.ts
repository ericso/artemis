import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

describe('Router Guards', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: HomeView
        },
        {
          path: '/login',
          name: 'login',
          component: LoginView,
          meta: { requiresGuest: true }
        },
        {
          path: '/dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { requiresAuth: true }
        }
      ]
    })

    // Add navigation guards
    router.beforeEach((to, from, next) => {
      const authStore = useAuthStore()
      const isAuthenticated = !!authStore.token

      if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
      } else if (to.meta.requiresGuest && isAuthenticated) {
        next('/dashboard')
      } else {
        next()
      }
    })
  })

  it('redirects to login when accessing protected route without auth', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ token: null })

    await router.push('/')
    await router.push('/dashboard')

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows access to protected route when authenticated', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ token: 'valid-token' })

    await router.push('/')
    await router.push('/dashboard')

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('redirects to dashboard when accessing guest route while authenticated', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ token: 'valid-token' })

    await router.push('/')
    await router.push('/login')

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('allows access to guest route when not authenticated', async () => {
    const authStore = useAuthStore()
    authStore.$patch({ token: null })

    await router.push('/')
    await router.push('/login')

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('allows access to public routes regardless of auth state', async () => {
    const authStore = useAuthStore()
    
    // Test when authenticated
    authStore.$patch({ token: 'valid-token' })
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')

    // Test when not authenticated
    authStore.$patch({ token: null })
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')
  })
}) 
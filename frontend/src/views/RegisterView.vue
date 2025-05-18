<template>
  <div class="register">
    <h1>Create Account</h1>
    <form @submit.prevent="handleSubmit" class="register-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="Enter your email"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="Enter your password"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          placeholder="Confirm your password"
          :disabled="loading"
        />
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="validationError" class="error">{{ validationError }}</div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating Account...' : 'Create Account' }}
      </button>

      <div class="login-link">
        Already have an account? <RouterLink to="/login">Log in</RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const validationError = ref('')

const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

async function handleSubmit() {
  validationError.value = ''

  if (password.value !== confirmPassword.value) {
    validationError.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    validationError.value = 'Password must be at least 8 characters long'
    return
  }

  const success = await authStore.register(email.value, password.value)
  if (success) {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #2c3e50;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #42b983;
}

button {
  background-color: #42b983;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #3aa876;
}

button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  font-size: 14px;
}

.login-link {
  text-align: center;
  font-size: 14px;
}

.login-link a {
  color: #42b983;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 
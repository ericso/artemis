<script setup lang="ts">
</script>

<template>
  <main class="home">
    <h1>Welcome to Prometheus</h1>
    <div class="auth-links">
      <RouterLink to="/login" class="auth-button login">Login</RouterLink>
      <RouterLink to="/register" class="auth-button register">Create Account</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 60px auto;
  text-align: center;
}

h1 {
  color: #2c3e50;
  font-size: 2.5em;
  margin-bottom: 40px;
}

.auth-links {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.auth-button {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;
}

.login {
  background-color: #42b983;
  color: white;
}

.login:hover {
  background-color: #3aa876;
}

.register {
  background-color: #2c3e50;
  color: white;
}

.register:hover {
  background-color: #34495e;
}
</style>

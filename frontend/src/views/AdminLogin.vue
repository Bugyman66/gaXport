<template>
  <div class="admin-login-container">
    <div class="admin-login-card">
      <h2>Admin Login</h2>
      <form @submit.prevent="loginAdmin" class="admin-form">
        <div class="input-group">
          <input 
            type="text" 
            v-model="username" 
            required 
            placeholder="Username"
          />
        </div>

        <div class="input-group">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="password" 
            required 
            placeholder="Password"
          />
          <button 
            type="button" 
            class="toggle-password" 
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLogging">
          {{ isLogging ? 'Logging in...' : 'Login' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      isLogging: false,
      error: null
    }
  },
  methods: {
    async loginAdmin() {
      try {
        this.isLogging = true;
        this.error = null;
        
        const response = await fetch('http://localhost:8081/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_role', data.admin.role);
        this.$router.push('/admin/dashboard');
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLogging = false;
      }
    }
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  padding: 2rem;
}

.admin-login-card {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #fff;
  text-align: center;
  margin-bottom: 2rem;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 4px;
  background: #333;
  color: #fff;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #666;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.submit-btn {
  background: #4a90e2;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #357abd;
}

.submit-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  text-align: center;
  margin-top: 1rem;
}
</style>
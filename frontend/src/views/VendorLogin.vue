<template>
  <div class="vendor-login-page cyberpunk-bg">
    <div class="content-wrapper">
      <h2 class="section-title">Vendor Login</h2>
      
      <div class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="loginData.email" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="loginData.password" />
        </div>

        <button @click="loginVendor" class="login-btn" :disabled="isLogging">
          {{ isLogging ? 'Logging in...' : 'Login' }}
        </button>

        <p class="register-link">
          Don't have an account? <router-link to="/vendor/register">Register here</router-link>
        </p>

        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VendorLogin',
  data() {
    return {
      loginData: {
        email: '',
        password: ''
      },
      isLogging: false,
      error: null
    }
  },
  methods: {
    async loginVendor() {
      try {
        this.isLogging = true;
        this.error = null;
        
        const response = await fetch('http://localhost:8081/api/vendor/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.loginData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('vendor_token', data.token);
        this.$router.push('/vendor/dashboard');
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
.vendor-login-page {
  min-height: 100vh;
  padding: 2rem;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}

.cyberpunk-bg {
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
}

.content-wrapper {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
}

.login-form {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 8px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border: none;
  border-radius: 8px;
  color: #1a0b2e;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.register-link a {
  color: #00fff3;
  text-decoration: none;
}

.error-message {
  margin-top: 1rem;
  padding: 0.8rem;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.3);
  border-radius: 8px;
  color: #ff4d4d;
  text-align: center;
}
</style>

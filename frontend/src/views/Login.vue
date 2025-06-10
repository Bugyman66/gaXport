<template>
  <div class="login-container">
    <div class="cyber-grid"></div>
    <div class="floating-particles"></div>
    
    <div class="login-card glass-effect">
      <div class="logo-section">
        <span class="neon-text"></span>
        <span class="gradient-text"></span>
      </div>

      <h2 class="title-glow">Login Page</h2>
      
      <form @submit.prevent="loginUser" class="cyber-form">
        <div class="input-group">
          <input type="email" v-model="email" required>
          <label class="cyber-label">Email</label>
          <span class="focus-border"></span>
        </div>

        <div class="input-group">
          <input :type="showPassword ? 'text' : 'password'" 
                 v-model="password" 
                 required>
          <label class="cyber-label">Password</label>
          <button type="button" 
                  class="toggle-password" 
                  @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
          <span class="focus-border"></span>
        </div>

        <router-link to="/forgot-password" class="forgot-link">
          Forgot Password?
        </router-link>

        <button type="submit" class="submit-btn">
          <span class="btn-text">Login</span>
          <span class="btn-glow"></span>
        </button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <p class="register-link">
        New to VCGasConnekt? 
        <router-link to="/register" class="neon-link">Create Account</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      showPassword: false
    };
  },
  methods: {
    async loginUser() {
      try {
        const response = await fetch("http://localhost:8081/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // ✅ Store token and user email in localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("user_email", this.email); // ✅ Store email

          // ✅ Redirect to dashboard
          this.$router.push("/dashboard");
        } else {
          this.errorMessage = data.message;
        }
      } catch (error) {
        this.errorMessage = "Login failed. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600&display=swap');

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f2c 0%, #1a1b46 50%, #0a2463 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.cyber-grid {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, rgba(0,255,243,0.03) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0,255,243,0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(30px); }
}

.floating-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(0,255,243,0.1) 0%, transparent 50%);
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  border-radius: 20px;
  position: relative;
  z-index: 1;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 243, 0.1);
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.title-glow {
  font-family: 'Orbitron', sans-serif;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
}

.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.cyber-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-group input {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00fff3;
  box-shadow: 0 0 15px rgba(0, 255, 243, 0.2);
  outline: none;
}

.input-group input:focus + .cyber-label,
.input-group input:valid + .cyber-label {
  top: 0;
  left: 0.5rem;
  font-size: 0.8rem;
  padding: 0 0.5rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.toggle-password:hover {
  opacity: 1;
}

.forgot-link {
  display: block;
  text-align: right;
  color: #00fff3;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.forgot-link:hover {
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.4);
}

.error-message {
  color: #ff4d4d;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
  margin-top: 1rem;
  font-size: 0.9rem;
}

.register-link {
  text-align: center;
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Space Grotesk', sans-serif;
}

.neon-link {
  color: #00fff3;
  text-decoration: none;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
  transition: all 0.3s ease;
}

.neon-link:hover {
  text-shadow: 0 0 20px rgba(0, 255, 243, 0.8);
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem;
  }
  
  .title-glow {
    font-size: 2rem;
  }
}
</style>

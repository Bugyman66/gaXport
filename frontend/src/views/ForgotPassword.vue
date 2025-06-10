<template>
  <div class="register-container">
    <div class="cyber-grid"></div>
    <div class="floating-particles"></div>
    
    <div class="register-box glass-effect">
      <div class="logo-section animate-in">
        <div class="logo-container">
          <span class="gradient-text">Password Recovery</span>
        </div>
      </div>

      <form @submit.prevent="sendResetLink" class="cyber-form">
        <div class="input-group">
          <input type="email" v-model="email" required>
          <label class="cyber-label">Email Address</label>
          <span class="focus-border"></span>
        </div>

        <p v-if="message" :class="['status-message', messageType]">{{ message }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span class="btn-text">{{ loading ? "Sending..." : "Reset Password" }}</span>
        </button>

        <p class="login-link">
          Remember password? 
          <router-link to="/login" class="neon-link">Login here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      loading: false,
      message: "",
      messageType: "", // success or error
    };
  },
  methods: {
    async sendResetLink() {
      if (!this.email) {
        this.message = "Email is required.";
        this.messageType = "error";
        return;
      }

      this.loading = true;
      this.message = "";

      try {
        const response = await axios.post("http://localhost:8081/api/auth/forgot-password", {
          email: this.email,
        });

        this.message = response.data.message;
        this.messageType = "success";
      } catch (error) {
        this.message = error.response?.data?.message || "An error occurred.";
        this.messageType = "error";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

.register-container {
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

.register-box {
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  border-radius: 20px;
  position: relative;
  z-index: 1;
  background: rgba(13, 17, 38, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(89, 195, 255, 0.2);
  box-shadow: 0 8px 32px rgba(9, 14, 44, 0.7);
}

.gradient-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 2rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(0, 255, 243, 0.3);
}

.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.cyber-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-group input {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(89, 195, 255, 0.3);
  border-radius: 8px;
  color: #e4f1ff;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.input-group input:focus {
  outline: none;
  border-color: #00fff3;
  box-shadow: 0 0 15px rgba(0, 255, 243, 0.2);
}

.input-group input:focus + .cyber-label,
.input-group input:valid + .cyber-label {
  top: -25px;
  left: 0;
  color: #00fff3;
  font-size: 0.8rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 243, 0.3);
}

.status-message {
  margin: 1rem 0;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Space Grotesk', sans-serif;
}

.success {
  color: #4dffb4;
  text-shadow: 0 0 10px rgba(77, 255, 180, 0.7);
}

.error {
  color: #ff7676;
  text-shadow: 0 0 10px rgba(255, 118, 118, 0.7);
}

.login-link {
  margin-top: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Space Grotesk', sans-serif;
}

.neon-link {
  color: #00fff3;
  text-decoration: none;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.neon-link:hover {
  text-shadow: 0 0 20px rgba(0, 255, 243, 0.8);
}

@keyframes gridMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(30px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}
</style>

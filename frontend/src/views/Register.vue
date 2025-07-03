<template>
  <div class="register-container">
    <div class="cyber-grid"></div>
    <div class="floating-particles"></div>
    
    <div class="register-box glass-effect">
      <div class="logo-section animate-in">
        <div class="logo-container">
          <span class="neon-text">VC</span>
          <span class="connector">||</span>
          <span class="gradient-text">Gas<span class="highlight">Connekt</span></span>
        </div>
      </div>

      
      
      <div class="progress-bar">
        <div class="progress-step active"></div>
        <div class="progress-step" :class="{ active: name && email }"></div>
        <div class="progress-step" :class="{ active: password && confirmPassword }"></div>
      </div>

      <form @submit.prevent="registerUser" class="cyber-form">
        <div class="input-group">
          <input type="text" v-model="name" required>
          <label class="cyber-label">Full Name</label>
          <span class="focus-border"></span>
        </div>

        <div class="input-group">
          <input type="email" v-model="email" required>
          <label class="cyber-label">Email</label>
          <span class="focus-border"></span>
        </div>

        <div class="input-group">
          <input type="text" v-model="phone" required>
          <label class="cyber-label">Phone Number</label>
          <span class="focus-border"></span>
        </div>

        <div class="input-group">
          <input type="text" v-model="referralCode">
          <label class="cyber-label">Referral Code (Optional)</label>
          <span class="focus-border"></span>
        </div>

        <div class="input-group">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" required>
          <label class="cyber-label">Password</label>
          <span class="focus-border"></span>
          <button type="button" class="toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>

        <div class="input-group">
          <input type="password" v-model="confirmPassword" required>
          <label class="cyber-label">Confirm Password</label>
          <span class="focus-border"></span>
        </div>

        <div class="input-group pin-group">
          <input type="password" v-model="transactionPin" maxlength="4" required>
          <label class="cyber-label">Transaction Pin</label>
          <span class="focus-border"></span>
        </div>

        <button type="submit" class="submit-btn">
          <span class="btn-text">Create Account</span>
          <span class="btn-glow"></span>
        </button>
      </form>

      <p class="login-link">
        Already registered? 
        <router-link to="/login" class="neon-link">Login here</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      email: "",
      phone: "",
      referralCode: "",
      password: "",
      confirmPassword: "",
      transactionPin: "",
      passwordError: "",
      formError: "",
      showPassword: false,
    };
  },
  methods: {
    async registerUser() {
      // **Client-side validation**
      if (!this.name || !this.email || !this.phone || !this.password || !this.confirmPassword || !this.transactionPin) {
        this.formError = "All fields are required!";
        console.log("Validation failed: All fields are required");
        return;
      }
      if (this.password.length < 8) {
        this.passwordError = "Password must be at least 8 characters";
        console.log("Validation failed: Password must be at least 8 characters");
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.passwordError = "Passwords do not match";
        console.log("Validation failed: Passwords do not match");
        return;
      }
      if (this.transactionPin.length !== 4 || isNaN(this.transactionPin)) {
        this.formError = "Transaction Pin must be 4 digits";
        console.log("Validation failed: Transaction Pin must be 4 digits");
        return;
      }

      this.passwordError = "";
      this.formError = "";

      const userData = {
        name: this.name,
        email: this.email,
        phone: this.phone,
        referralCode: this.referralCode,
        password: this.password,
        transaction_pin: this.transactionPin,
      };

      console.log("Sending user data to backend:", userData);

      try {
        const response = await fetch("https://gasfee-evw8.onrender.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        
        if (!response.ok) {
          this.formError = data.message || "Registration failed. Please try again.";
          console.log("Error from backend:", data);
        } else {
          alert("Registration successful! You can now log in.");
          this.$router.push("/login");
        }
      } catch (error) {
        console.error("Registration failed", error);
        this.formError = "Network error. Please try again.";
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

.register-box {
  width: 100%;
  max-width: 500px;
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
  margin-bottom: 2.5rem;
  opacity: 0;
  transform: translateY(-20px);
  animation: fadeInDown 0.8s ease forwards;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.1);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.neon-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 2rem;
  color: #00fff3;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
  margin-right: 0.5rem;
}

.gradient-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.progress-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.progress-step {
  width: 50px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.progress-step.active {
  background: linear-gradient(90deg, #00fff3, #7700ff);
  box-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
}

.input-group {
  position: relative;
  margin-bottom: 2rem;
  opacity: 1; /* was previously 0 */
  transform: none; /* removed animation transform */
}

.input-group input {
  width: 100%;
  padding: 1.2rem 1rem 0.4rem;
  background: rgba(13, 17, 38, 0.95);
  border: 1px solid rgba(89, 195, 255, 0.3);
  border-radius: 8px;
  color: #e4f1ff;
  font-size: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
  z-index: 1;
}

.cyber-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  position: absolute;
  left: 1rem;
  top: -0.5rem;
  padding: 0 0.5rem;
  background: rgba(13, 17, 38, 0.95);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  z-index: 2;
}

.input-group input:focus {
  border-color: #00fff3;
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.2);
  background: rgba(13, 17, 38, 0.98);
}

.input-group input:focus + .cyber-label {
  color: #00fff3;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
}

/* Remove all animation delays */
/* .input-group:nth-child(1) { animation-delay: 0.2s; } */

.submit-btn {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
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

.login-link {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.neon-link {
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  color: #00fff3;
  text-decoration: none;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
  transition: all 0.3s ease;
}

.neon-link:hover {
  text-shadow: 0 0 20px rgba(0, 255, 243, 0.8);
}

@media (max-width: 768px) {
  .register-box {
    padding: 1.5rem;
  }
  
  .neon-text {
    font-size: 1.5rem;
  }
  
  .gradient-text {
    font-size: 1.2rem;
  }
}
</style>
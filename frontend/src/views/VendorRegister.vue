<template>
  <div class="vendor-register-page cyberpunk-bg">
    <div class="content-wrapper">
      <h2 class="section-title">Vendor Registration</h2>
      
      <div class="register-form">
        <div class="form-group">
          <label>Business Name</label>
          <input type="text" v-model="vendorData.businessName" />
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="vendorData.email" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="vendorData.password" />
        </div>

        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" v-model="vendorData.phone" />
        </div>

        <div class="form-group">
          <label>Address</label>
          <textarea v-model="vendorData.address"></textarea>
        </div>

        <button @click="registerVendor" class="register-btn" :disabled="isRegistering">
          {{ isRegistering ? 'Registering...' : 'Register' }}
        </button>

        <p class="login-link">
          Already have an account? <router-link to="/vendor/login">Login here</router-link>
        </p>

        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VendorRegister',
  data() {
    return {
      vendorData: {
        businessName: '',
        email: '',
        password: '',
        phone: '',
        address: ''
      },
      isRegistering: false,
      error: null
    }
  },
  methods: {
    async registerVendor() {
      try {
        this.isRegistering = true;
        this.error = null;
        
        const response = await fetch('https://gasfee-evw8.onrender.com/api/vendor/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.vendorData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        await response.json();
        this.$router.push('/vendor/login');
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isRegistering = false;
      }
    }
  }
}
</script>

<style scoped>
.vendor-register-page {
  min-height: 100vh;
  padding: 2rem;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}

.cyberpunk-bg {
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
}

.content-wrapper {
  max-width: 600px;
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

.register-form {
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

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 8px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.register-btn {
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

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.login-link a {
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

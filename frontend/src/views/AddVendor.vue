<template>
  <div class="add-vendor-page cyberpunk-bg">
    <nav class="admin-nav glass-card">
      <div class="nav-left">
        <button @click="$router.push('/admin/dashboard')" class="back-btn">
          ← Back to Dashboard
        </button>
      </div>
      <h1>Add New Vendor</h1>
    </nav>

    <div class="form-container glass-card">
      <h2>Create Vendor Account</h2>
      
      <form @submit.prevent="createVendor" class="vendor-form">
        <div class="input-group">
          <label>Email *</label>
          <input 
            type="email" 
            v-model="vendorData.email" 
            required
            placeholder="vendor@example.com"
          />
        </div>
        
        <div class="input-group">
          <label>Password *</label>
          <div class="password-input-container">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="vendorData.password" 
              required
              placeholder="Create a strong password"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>
        
        <div class="input-group">
          <label>Initial Balance (₦)</label>
          <input 
            type="number" 
            v-model="vendorData.balance" 
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="create-btn" 
            :disabled="isCreating"
          >
            {{ isCreating ? 'Creating...' : 'Create Vendor' }}
          </button>
        </div>
      </form>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddVendor',
  data() {
    return {
      vendorData: {
        email: '',
        password: '',
        balance: 0
      },
      showPassword: false,
      isCreating: false,
      message: null,
      messageType: 'success'
    }
  },
  mounted() {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      this.$router.push('/admin/login');
    }
  },
  methods: {
    async createVendor() {
      if (!this.vendorData.email || !this.vendorData.password) {
        this.showMessage('Email and password are required', 'error');
        return;
      }

      this.isCreating = true;
      this.message = null;

      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('https://gasfee-evw8.onrender.com/api/admin/create-vendor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.vendorData)
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create vendor');
        }

        this.showMessage('Vendor created successfully!', 'success');
        // Reset form
        this.vendorData = {
          email: '',
          password: '',
          balance: 0
        };
      } catch (error) {
        this.showMessage(error.message, 'error');
      } finally {
        this.isCreating = false;
      }
    },

    showMessage(text, type = 'success') {
      this.message = text;
      this.messageType = type;
      
      // Clear message after 5 seconds
      setTimeout(() => {
        this.message = null;
      }, 5000);
    }
  }
}
</script>

<style scoped>
.add-vendor-page {
  min-height: 100vh;
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
  color: #fff;
  padding: 20px;
}

.admin-nav {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.nav-left {
  display: flex;
  align-items: center;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 12px;
}

.back-btn {
  background: none;
  border: none;
  color: #00fff3;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-5px);
  text-shadow: 0 0 8px rgba(0, 255, 243, 0.8);
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-container h2 {
  margin-bottom: 2rem;
  color: #fff;
  font-size: 1.5rem;
  text-align: center;
}

.vendor-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.input-group input {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
}

.input-group input:focus {
  outline: none;
  border-color: rgba(0, 255, 243, 0.6);
  box-shadow: 0 0 8px rgba(0, 255, 243, 0.4);
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.5rem;
}

.toggle-password:hover {
  color: #00fff3;
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.create-btn {
  padding: 0.8rem 2rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 243, 0.4);
}

.create-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.message.success {
  background: rgba(0, 255, 163, 0.1);
  border: 1px solid rgba(0, 255, 163, 0.3);
  color: #00ffa3;
}

.message.error {
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: #ff4d4d;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .admin-nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .form-container {
    padding: 1.5rem;
  }
}
</style>
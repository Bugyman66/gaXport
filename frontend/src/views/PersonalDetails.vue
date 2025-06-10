<template>
  <div class="profile-page cyberpunk-bg">
    <div class="content-wrapper">
      <div class="header-section">
        <button class="back-button" @click="$router.push('/profile')">
          <i class="mdi mdi-chevron-left"></i>
          <span>Back to Profile</span>
        </button>
      </div>

      <h2 class="page-title">
        <span class="emoji">👤</span> Personal Details
      </h2>

      <div v-if="error" class="error-message glass-panel">
        {{ error }}
        <button @click="fetchUserData" class="retry-btn">Retry</button>
      </div>
      
      <div v-else-if="isLoading" class="loading-message glass-panel">
        <div class="spinner"></div>
        Loading your details...
      </div>
      
      <div v-else-if="userData" class="section">
        <div class="form-group">
          <label class="cyber-label">Name</label>
          <input 
            type="text" 
            v-model="userData.name" 
            class="cyber-input"
            required 
          />
        </div>
        <div class="form-group">
          <label class="cyber-label">Email</label>
          <input 
            type="email" 
            v-model="userData.email" 
            class="cyber-input" 
            disabled 
          />
          <small class="field-hint">Email cannot be changed</small>
        </div>
        <div class="form-group">
          <label class="cyber-label">Phone</label>
          <input 
            type="tel" 
            v-model="userData.phone" 
            class="cyber-input"
            required 
          />
        </div>
        <div v-if="updateStatus" :class="['status-message', updateStatus.type]">
          {{ updateStatus.message }}
        </div>
        <button 
          @click="updateProfile" 
          :disabled="isUpdating || !hasChanges" 
          class="cyber-button"
        >
          <span class="button-content">
            {{ isUpdating ? 'Updating...' : 'Update Details' }}
          </span>
          <div class="button-glow"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PersonalDetails',
  data() {
    return {
      userData: null,
      originalData: null,
      isLoading: true,
      isUpdating: false,
      error: null,
      updateStatus: null
    };
  },
  computed: {
    hasChanges() {
      if (!this.userData || !this.originalData) return false;
      return this.userData.name !== this.originalData.name || 
             this.userData.phone !== this.originalData.phone;
    }
  },
  methods: {
    async fetchUserData() {
      try {
        this.isLoading = true;
        this.error = null;
        this.updateStatus = null;

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch('http://localhost:8081/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user details');
        }

        const result = await response.json();
        if (result.status === "success" && result.data) {
          this.userData = { ...result.data };
          // Store the original data for comparison
          this.originalData = { ...result.data };
          // Also store in localStorage for persistence
          localStorage.setItem('userData', JSON.stringify(result.data));
        } else {
          throw new Error('Failed to fetch user details');
        }
      } catch (error) {
        this.error = error.message;
        if (error.message === 'Authentication required') {
          this.$router.push('/login');
        }
      } finally {
        this.isLoading = false;
      }
    },
    async updateProfile() {
      try {
        if (!this.hasChanges) return;
        
        this.isUpdating = true;
        this.updateStatus = null;
        this.error = null;

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch('http://localhost:8081/api/user/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.userData.name,
            phone: this.userData.phone
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        }

        const result = await response.json();
        if (result.status === "success") {
          // Update both userData and localStorage
          this.originalData = { ...this.userData };
          localStorage.setItem('userData', JSON.stringify(this.userData));
          
          this.updateStatus = {
            type: 'success',
            message: 'Profile updated successfully'
          };
        } else {
          throw new Error(result.message || 'Failed to update profile');
        }
      } catch (error) {
        this.updateStatus = {
          type: 'error',
          message: error.message
        };
        if (error.message === 'Authentication required') {
          this.$router.push('/login');
        }
      } finally {
        this.isUpdating = false;
      }
    }
  },
  mounted() {
    // Try to load data from localStorage first
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.userData = { ...parsedData };
      this.originalData = { ...parsedData };
      this.isLoading = false;
    }
    // Then fetch fresh data from the server
    this.fetchUserData();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400&family=Space+Grotesk:wght@300;400&display=swap');

.profile-page {
  min-height: 100vh;
  padding: 1rem;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}

.cyberpunk-bg {
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
  position: relative;
  overflow: hidden;
}

.cyberpunk-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 255, 243, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 243, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: center center;
  pointer-events: none;
}

.content-wrapper {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

.header-section {
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(0, 255, 243, 0.1) 0%, rgba(119, 0, 255, 0.1) 100%);
  border: 1px solid rgba(0, 255, 243, 0.4);
  color: #00fff3;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
}

.back-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 243, 0.2),
    transparent
  );
  transition: 0.5s;
}

.back-button:hover::before {
  left: 100%;
}

.back-button:hover {
  background: linear-gradient(135deg, rgba(0, 255, 243, 0.15) 0%, rgba(119, 0, 255, 0.15) 100%);
  transform: translateX(-4px);
  box-shadow: 0 6px 20px rgba(0, 255, 243, 0.15);
}

.page-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.2rem;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.emoji {
  font-size: 2rem;
}

.section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.cyber-label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
}

.cyber-input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 8px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
}

.cyber-input:focus {
  outline: none;
  border-color: #00fff3;
  box-shadow: 0 0 15px rgba(0, 255, 243, 0.2);
}

.cyber-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.field-hint {
  display: block;
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.cyber-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(90deg, #666, #999);
}

.cyber-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 243, 0.3);
}

.button-content {
  position: relative;
  z-index: 1;
}

.button-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(0, 255, 243, 0.4) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cyber-button:not(:disabled):hover .button-glow {
  opacity: 1;
  animation: rotate 4s linear infinite;
}

.status-message {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.status-message.success {
  background: rgba(0, 255, 163, 0.1);
  border: 1px solid rgba(0, 255, 163, 0.3);
  color: #00ffa3;
}

.status-message.error {
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: #ff4d4d;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #00fff3;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 255, 243, 0.3);
  border-top-color: #00fff3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .section {
    padding: 1.5rem;
  }

  .cyber-button {
    padding: 0.8rem;
  }
}

@media screen and (max-width: 480px) {
  .content-wrapper {
    padding: 0.75rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .emoji {
    font-size: 1.5rem;
  }

  .section {
    padding: 1rem;
  }
}
</style>

<template>
  <div class="vendor-profile cyberpunk-bg">
    <div class="cyber-grid"></div>
    
    <div class="content-wrapper">
      <div class="header-section">
        <button class="back-button" @click="$router.push('/vendor/dashboard')">
          <i class="mdi mdi-chevron-left"></i>
          <span>Back to Dashboard</span>
        </button>
      </div>

      <h2 class="page-title">
        <span class="emoji">👤</span> Vendor Profile
      </h2>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchProfile" class="retry-button">Retry</button>
      </div>

      <!-- Profile Content -->
      <div v-else class="profile-content">
        <div class="profile-card glass-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <span class="emoji">🏪</span>
            </div>
            <div class="profile-status">
              <span :class="['status-badge', profile.is_active ? 'active' : 'inactive']">
                {{ profile.is_active ? 'Online' : 'Offline' }}
              </span>
              <button @click="toggleStatus" class="toggle-status-btn">
                {{ profile.is_active ? 'Go Offline' : 'Go Online' }}
              </button>
            </div>
          </div>

          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="profile.email" disabled />
            </div>

            <div class="form-group">
              <label>Name</label>
              <input 
                type="text" 
                v-model="profile.name" 
                placeholder="Enter your name"
                :disabled="isUpdating"
              />
            </div>

            <div class="form-group">
              <label>Phone</label>
              <input 
                type="tel" 
                v-model="profile.phone" 
                placeholder="Enter your phone number"
                :disabled="isUpdating"
              />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea 
                v-model="profile.description" 
                placeholder="Enter a description of your services"
                :disabled="isUpdating"
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="update-btn" 
                :disabled="isUpdating || !hasChanges"
              >
                <span v-if="isUpdating" class="loader"></span>
                <span v-else>Update Profile</span>
              </button>
            </div>
          </form>
        </div>

        <div v-if="statusMessage" :class="['status-message', statusMessage.type]">
          {{ statusMessage.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VendorProfile',
  data() {
    return {
      profile: {
        email: '',
        name: '',
        phone: '',
        description: '',
        is_active: true
      },
      originalProfile: null,
      loading: true,
      error: null,
      isUpdating: false,
      statusMessage: null
    }
  },
  computed: {
    hasChanges() {
      if (!this.originalProfile) return false;
      return JSON.stringify(this.profile) !== JSON.stringify(this.originalProfile);
    }
  },
  created() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('vendor_token');
        const response = await fetch('https://gasfee-evw8.onrender.com/api/vendor/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        this.profile = {
          email: data.email,
          name: data.name || '',
          phone: data.phone || '',
          description: data.description || '',
          is_active: data.is_active
        };
        this.originalProfile = JSON.parse(JSON.stringify(this.profile));
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile() {
      if (!this.hasChanges || this.isUpdating) return;

      this.isUpdating = true;
      this.statusMessage = null;

      try {
        const token = localStorage.getItem('vendor_token');
        const response = await fetch('https://gasfee-evw8.onrender.com/api/vendor/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.profile.name,
            phone: this.profile.phone,
            description: this.profile.description
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        const data = await response.json();
        this.profile = {
          ...this.profile,
          name: data.vendor.name,
          phone: data.vendor.phone,
          description: data.vendor.description
        };
        this.originalProfile = JSON.parse(JSON.stringify(this.profile));
        this.showStatus('Profile updated successfully!', 'success');
      } catch (error) {
        this.showStatus(error.message, 'error');
      } finally {
        this.isUpdating = false;
      }
    },

    async toggleStatus() {
      try {
        const token = localStorage.getItem('vendor_token');
        const response = await fetch('https://gasfee-evw8.onrender.com/api/vendor/toggle-status', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to toggle status');
        }

        const data = await response.json();
        this.profile.is_active = data.is_active;
        this.originalProfile.is_active = data.is_active;
        this.showStatus(data.message, 'success');
      } catch (error) {
        this.showStatus(error.message, 'error');
      }
    },

    showStatus(text, type = 'success') {
      this.statusMessage = { text, type };
      setTimeout(() => {
        this.statusMessage = null;
      }, 5000);
    }
  }
}
</script>

<style scoped>
.vendor-profile {
  min-height: 100vh;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  position: relative;
  overflow: hidden;
}

.cyberpunk-bg {
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
}

.cyber-grid {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(90deg, rgba(0, 255, 243, 0.03) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 255, 243, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.header-section {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.back-button:hover {
  background: rgba(0, 255, 243, 0.1);
  transform: translateX(-4px);
  box-shadow: 0 6px 20px rgba(0, 255, 243, 0.15);
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.emoji {
  font-size: 2.5rem;
}

.profile-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-avatar {
  font-size: 3rem;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
}

.status-badge.active {
  background: rgba(0, 255, 163, 0.2);
  color: #00ffa3;
}

.status-badge.inactive {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

.toggle-status-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.3);
  border-radius: 8px;
  color: #00fff3;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-status-btn:hover {
  background: rgba(0, 255, 243, 0.1);
  transform: translateY(-2px);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 8px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
}

.form-group input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00fff3;
  box-shadow: 0 0 0 2px rgba(0, 255, 243, 0.1);
}

.form-actions {
  margin-top: 1rem;
}

.update-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #00fff3, #7700ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.update-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.update-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.status-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.status-message.success {
  background: rgba(0, 255, 163, 0.1);
  border: 1px solid rgba(0, 255, 163, 0.2);
  color: #00ffa3;
}

.status-message.error {
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00fff3;
  animation: spin 1s linear infinite;
}

.retry-button {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #00fff3, #7700ff);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .profile-status {
    flex-direction: column;
  }

  .toggle-status-btn {
    width: 100%;
  }
}
</style>
<template> 
  <div class="security-page cyberpunk-bg">
    <div class="content-wrapper">
      <button @click="goBack" class="back-btn">
        <span class="back-icon">←</span>
        <span class="back-text">Back to Profile</span>
      </button>

      <h2 class="section-title">Security Settings</h2>

      <div class="security-sections">
        <!-- Change Password Form -->
        <div class="security-card">
          <h3>Change Password</h3>
          <form @submit.prevent="changePassword" class="security-form">
            <div class="form-group">
              <input type="password" v-model="passwordForm.current" placeholder="Current Password" required>
            </div>
            <div class="form-group">
              <input type="password" v-model="passwordForm.new" placeholder="New Password" 
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$" 
                title="Password must be at least 8 characters long and include both letters and numbers"
                required>
            </div>
            <div class="form-group">
              <input type="password" v-model="passwordForm.confirm" placeholder="Confirm New Password" required>
            </div>
            <p v-if="passwordMessage" :class="['message', passwordMessage.type]">{{ passwordMessage.text }}</p>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </div>

        <!-- Change Transfer PIN Form -->
        <div class="security-card">
          <h3>Change Transfer PIN</h3>
          <form @submit.prevent="updatePin" class="security-form">
            <div class="form-group">
              <input type="password" v-model="pinForm.current" placeholder="Current PIN" maxlength="4" pattern="[0-9]*" inputmode="numeric" required>
            </div>
            <div class="form-group">
              <input type="password" v-model="pinForm.new" placeholder="New PIN" maxlength="4" pattern="[0-9]*" inputmode="numeric" required>
            </div>
            <div class="form-group">
              <input type="password" v-model="pinForm.confirm" placeholder="Confirm New PIN" maxlength="4" pattern="[0-9]*" inputmode="numeric" required>
            </div>
            <p v-if="pinMessage" :class="['message', pinMessage.type]">{{ pinMessage.text }}</p>
            <button type="submit" class="submit-btn" :disabled="isPinLoading">
              {{ isPinLoading ? 'Updating...' : 'Update PIN' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const API_BASE_URL = 'http://localhost:8081/api';

export default {
  name: 'SecuritySettings',
  data() {
    return {
      passwordForm: { current: '', new: '', confirm: '' },
      pinForm: { current: '', new: '', confirm: '' },
      isLoading: false,
      passwordMessage: null,
      isPinLoading: false,
      pinMessage: null,
    };
  },
  methods: {
    goBack() {
      if (this.$router) {
        this.$router.push('/profile');
      } else {
        window.location.href = '/profile';
      }
    },
    async updatePin() {
      if (this.pinForm.new !== this.pinForm.confirm) {
        this.pinMessage = { type: 'error', text: 'New PINs do not match' };
        return;
      }
      if (!/^\d{4}$/.test(this.pinForm.new)) {
        this.pinMessage = { type: 'error', text: 'PIN must be exactly 4 digits' };
        return;
      }
      this.isPinLoading = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(`${API_BASE_URL}/auth/update-pin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPin: this.pinForm.current,
            transaction_pin: this.pinForm.new
          })
        });
        
        const data = await response.json();
        if (data.status === 'error') {
          throw new Error(data.message);
        }
        
        this.pinMessage = { type: 'success', text: data.message };
        this.pinForm = { current: '', new: '', confirm: '' };
      } catch (error) {
        console.error('PIN update error:', error);
        this.pinMessage = { 
          type: 'error', 
          text: error.message || 'Failed to update PIN. Please try again.' 
        };
      } finally {
        this.isPinLoading = false;
      }
    }
  }
};
</script>


<style scoped>
/* Style remains the same as in your original code */
.security-page {
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
  padding-top: 3rem;
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

.security-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.security-card h3 {
  color: #00fff3;
  margin-bottom: 1.5rem;
}

.security-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.3);
  border-radius: 8px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}

.form-group input:focus {
  outline: none;
  border-color: #00fff3;
}

.submit-btn {
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border: none;
  padding: 1rem;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

.back-btn {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 243, 0.3);
  border-radius: 12px;
  color: #00fff3;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(0, 255, 243, 0.1);
  transform: translateY(-2px);
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  text-align: center;
  font-size: 0.9rem;
}

.success {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.error {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4d4d;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
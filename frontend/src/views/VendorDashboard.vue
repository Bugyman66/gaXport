<template>
  <div class="vendor-dashboard cyberpunk-bg">
    <div class="cyber-grid"></div>
    
    <div class="content-wrapper">
      <div class="header-section">
        <button class="back-button" @click="$router.push('/vendor/login')">
          <i class="mdi mdi-chevron-left"></i>
          <span>Back to Login</span>
        </button>
        <button class="profile-button" @click="$router.push('/vendor/profile')">
          <i class="mdi mdi-account"></i>
          <span>Profile</span>
        </button>
      </div>

      <h2 class="page-title">
        <span class="emoji">🏪</span> Vendor Dashboard
      </h2>
      
      <div class="section balance-section">
        <h3>Available Balance</h3>
        <div class="balance">₦{{ vendorBalance.toFixed(2) }}</div>
      </div>

      <div class="section">
        <h3 class="section-title">Transfer Balance</h3>
        
        <!-- Step 1: Search User -->
        <div class="search-step" :class="{ 'active': !searchedUser }">
          <div class="step-header">
            <div class="step-number">1</div>
            <h4>Search User</h4>
          </div>

          <div class="search-form">
            <div class="form-group">
              <label class="cyber-label">User Email</label>
              <div class="search-input-container">
                <input 
                  type="email" 
                  v-model="balanceData.userEmail" 
                  class="cyber-input"
                  placeholder="Enter user email"
                  :disabled="searchedUser"
                />
                <button 
                  @click="searchUser" 
                  class="search-btn"
                  :disabled="!balanceData.userEmail || isSearching"
                >
                  <span v-if="isSearching" class="loader"></span>
                  <span v-else>Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: User Details & Fund Transfer -->
        <div v-if="searchedUser" class="user-details-step">
          <div class="step-header">
            <div class="step-number">2</div>
            <h4>User Details & Transfer</h4>
          </div>

          <div class="user-card glass-card">
            <div class="user-header">
              <span class="emoji">👤</span>
              <button class="change-user-btn" @click="resetSearch">
                Change User
              </button>
            </div>

            <div class="user-info-grid">
              <div class="info-item">
                <label>Name</label>
                <span>{{ searchedUser.name }}</span>
              </div>
              <div class="info-item">
                <label>Email</label>
                <span>{{ searchedUser.email }}</span>
              </div>
              <div class="info-item">
                <label>Phone</label>
                <span>{{ searchedUser.phone }}</span>
              </div>
              <div class="info-item">
                <label>Current Balance</label>
                <span class="user-balance">₦{{ searchedUser.balance?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="info-item verification-status">
                <label>Verification Status</label>
                <span :class="['status-badge', searchedUser.is_verified ? 'verified' : 'unverified']">
                  {{ searchedUser.is_verified ? 'Verified' : 'Unverified' }}
                </span>
              </div>
            </div>

            <div class="transfer-form">
              <div class="form-group">
                <label class="cyber-label">Amount to Transfer</label>
                <div class="amount-input-container">
                  <span class="currency-symbol">₦</span>
                  <input 
                    type="number" 
                    v-model="balanceData.amount" 
                    min="0" 
                    step="0.01"
                    :max="vendorBalance"
                    class="cyber-input"
                    placeholder="0.00"
                  />
                </div>
                <div v-if="balanceData.amount > vendorBalance" class="error-hint">
                  Amount exceeds your available balance
                </div>
              </div>

              <button 
                @click="addBalance" 
                class="cyber-button" 
                :disabled="isProcessing || !canTransfer"
              >
                <span class="button-content">
                  {{ isProcessing ? 'Processing...' : 'Transfer Balance' }}
                </span>
                <div class="button-glow"></div>
              </button>
            </div>
          </div>
        </div>

        <div v-if="statusMessage" :class="['status-message', 'glass-card', statusMessage.type]">
          <div class="status-content">
            <span class="status-icon">{{ statusMessage.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ statusMessage.text }}</span>
          </div>
        </div>
      </div>

      <div class="section" v-if="transactions.length">
        <h3 class="section-title">Recent Transactions</h3>
        <div class="transaction-list">
          <div v-for="tx in transactions" :key="tx.id" class="transaction-item glass-card">
            <div class="tx-user">
              <span class="emoji">👤</span>
              <span>{{ tx.userEmail }}</span>
            </div>
            <div class="tx-amount">₦{{ tx.amount.toFixed(2) }}</div>
            <div class="tx-date">{{ new Date(tx.timestamp).toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VendorDashboard',
  data() {
    return {
      balanceData: {
        userEmail: '',
        amount: 0
      },
      vendorBalance: 0,
      isProcessing: false,
      isSearching: false,
      statusMessage: null,
      transactions: [],
      searchedUser: null
    }
  },
  computed: {
    canTransfer() {
      return this.searchedUser && 
             this.balanceData.amount > 0 && 
             this.balanceData.amount <= this.vendorBalance;
    }
  },
  created() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      try {
        const token = localStorage.getItem('vendor_token');
        const response = await fetch('http://localhost:8081/api/vendor/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const data = await response.json();
        this.vendorBalance = data.balance;
        this.transactions = data.recentTransactions;
      } catch (error) {
        this.showStatus(error.message, 'error');
      }
    },

    resetSearch() {
      this.searchedUser = null;
      this.balanceData.userEmail = '';
      this.balanceData.amount = 0;
    },

    async searchUser() {
      if (!this.balanceData.userEmail || this.isSearching) return;

      this.isSearching = true;
      try {
        const token = localStorage.getItem('vendor_token');
        const response = await fetch(`http://localhost:8081/api/vendor/search-user?email=${this.balanceData.userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found');
          }
          throw new Error('Failed to search user');
        }

        const data = await response.json();
        this.searchedUser = data.user;
        this.showStatus('User found successfully!', 'success');
      } catch (error) {
        this.showStatus(error.message, 'error');
        this.searchedUser = null;
      } finally {
        this.isSearching = false;
      }
    },

    async addBalance() {
      if (!this.canTransfer) return;

      try {
        this.isProcessing = true;
        const token = localStorage.getItem('vendor_token');
        
        const response = await fetch('http://localhost:8081/api/vendor/transfer-balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.balanceData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to transfer balance');
        }

        const data = await response.json();
        this.showStatus('Balance transferred successfully!', 'success');
        this.resetSearch();
        await this.fetchDashboardData();
      } catch (error) {
        this.showStatus(error.message, 'error');
      } finally {
        this.isProcessing = false;
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400&family=Space+Grotesk:wght@300;400&display=swap');

/* Base styles */
.vendor-dashboard {
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

/* Layout styles */
.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* Header styles */
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

.profile-button {
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

.profile-button:hover {
  background: rgba(0, 255, 243, 0.1);
  transform: translateX(4px);
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

/* Section styles */
.section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Step styles */
.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.step-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00fff3, #7700ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: bold;
  font-size: 1.1rem;
}

.step-header h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  color: #fff;
  margin: 0;
}

/* Balance section styles */
.balance-section {
  text-align: center;
  animation: floatCard 6s ease-in-out infinite;
}

.balance {
  font-family: 'Outfit', sans-serif;
  font-size: 3.2rem;
  background: linear-gradient(90deg, #00fff3, #7700ff, #00fff3);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 1rem 0;
  animation: shimmerText 3s linear infinite;
}

/* Search form styles */
.search-input-container {
  display: flex;
  gap: 1rem;
}

.search-btn {
  padding: 0 1.5rem;
  background: linear-gradient(45deg, #00fff3, #7700ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.search-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
}

/* User card styles */
.user-card {
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(0, 255, 243, 0.2);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.user-header .emoji {
  font-size: 2.5rem;
}

.change-user-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.3);
  border-radius: 8px;
  color: #00fff3;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-user-btn:hover {
  background: rgba(0, 255, 243, 0.1);
  transform: translateX(-2px);
}

.user-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.info-item span {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  color: #fff;
}

.user-balance {
  color: #00fff3 !important;
  font-size: 1.3rem !important;
  font-weight: 500;
}

.verification-status .status-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
}

.verification-status .status-badge.verified {
  background-color: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

.verification-status .status-badge.unverified {
  background-color: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

/* Form styles */
.form-group {
  margin-bottom: 1.5rem;
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
  background: rgba(13, 14, 33, 0.6);
  border: 1px solid rgba(0, 255, 243, 0.1);
  border-radius: 12px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
}

.cyber-input:focus {
  outline: none;
  border-color: #00fff3;
  box-shadow: 0 0 15px rgba(0, 255, 243, 0.2);
}

/* Button styles */
.cyber-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #00fff3, #7700ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.cyber-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cyber-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 255, 243, 0.4);
}

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: 0.5s;
}

.cyber-button:not(:disabled):hover .button-glow {
  transform: translateX(100%);
}

/* Status message styles */
.status-message {
  margin-top: 1rem;
  animation: slideIn 0.3s ease;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.status-message.success {
  border: 1px solid rgba(0, 255, 0, 0.2);
  background: rgba(0, 255, 0, 0.1);
}

.status-message.error {
  border: 1px solid rgba(255, 77, 77, 0.2);
  background: rgba(255, 77, 77, 0.1);
}

/* Loading animation */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0) rotateX(0deg); }
  50% { transform: translateY(-10px) rotateX(2deg); }
}

@keyframes shimmerText {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Responsive styles */
@media screen and (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .user-info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .search-input-container {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
    padding: 0.8rem;
  }
}

@media screen and (max-width: 480px) {
  .section {
    padding: 1rem;
  }

  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .user-header {
    flex-direction: column;
    gap: 1rem;
  }

  .change-user-btn {
    width: 100%;
  }
}
</style>

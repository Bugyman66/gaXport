<template>
  <div class="fund-page cyberpunk-bg">
    <div class="content-wrapper">
      <div class="header-section">
        <button class="back-button" @click="$router.push('/dashboard')">
          <i class="mdi mdi-chevron-left"></i>
          <span>Back to Dashboard</span>
        </button>
      </div>

      <h2 class="page-title">
        <span class="emoji">💰</span> Fund Your Account
      </h2>

      <div class="info-card">
        <p>Select a vendor to fund your account. You'll be redirected to WhatsApp to complete the transaction.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading vendors...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchVendors" class="retry-button">Retry</button>
      </div>

      <!-- No Vendors State -->
      <div v-else-if="!vendors.length" class="no-vendors">
        <p>No active vendors available at the moment.</p>
        <p>Please try again later.</p>
      </div>

      <!-- Vendors List -->
      <div v-else class="vendors-grid">
        <div v-for="vendor in vendors" :key="vendor.email" class="vendor-card">
          <div class="vendor-info">
            <h3 class="vendor-email">{{ vendor.email }}</h3>
            <div class="vendor-balance">
              <span class="balance-label">Available Balance:</span>
              <span class="balance-amount">₦{{ formatNumber(vendor.balance) }}</span>
            </div>
          </div>
          <button @click="selectVendor(vendor)" class="select-vendor-btn">
            Select Vendor
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FundPage',
  data() {
    return {
      vendors: [],
      loading: true,
      error: null
    }
  },
  mounted() {
    this.fetchVendors();
  },
  methods: {
    async fetchVendors() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await fetch('http://localhost:8081/api/vendor/active');
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }

        const data = await response.json();
        this.vendors = data.vendors;
      } catch (err) {
        console.error('Error fetching vendors:', err);
        this.error = 'Failed to load vendors. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    formatNumber(number) {
      return new Intl.NumberFormat('en-NG').format(number);
    },
    selectVendor(vendor) {
      // Store selected vendor in localStorage
      localStorage.setItem('selected_vendor', JSON.stringify(vendor));
      
      // Construct WhatsApp message
      const message = `Hello, I would like to fund my account through you. My email is ${localStorage.getItem('user_email')}.`;
      const whatsappUrl = `https://wa.me/${vendor.phone}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
    }
  }
}
</script>

<style scoped>
.fund-page {
  min-height: 100vh;
  padding: 1rem;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}

.cyberpunk-bg {
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
  position: relative;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.back-button:hover {
  opacity: 1;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 243, 0.3);
  border-radius: 50%;
  border-top-color: #00fff3;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: #ff4444;
  margin-bottom: 1rem;
}

.retry-button {
  background: #00fff3;
  color: #1a0b2e;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.no-vendors {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.vendor-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.vendor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 255, 243, 0.1);
}

.vendor-info {
  flex: 1;
}

.vendor-email {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #00fff3;
}

.vendor-balance {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.balance-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.balance-amount {
  font-size: 1.2rem;
  font-weight: 500;
  color: #fff;
}

.select-vendor-btn {
  background: #00fff3;
  color: #1a0b2e;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.select-vendor-btn:hover {
  background: #00e6db;
}
</style> 
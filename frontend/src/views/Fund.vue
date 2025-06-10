<template>
  <div class="fund-container">
    <!-- Add back button -->
    <button @click="$router.push('/dashboard')" class="back-btn">
      <span class="back-icon">←</span>
      <span class="back-text">Back to Dashboard</span>
    </button>

    <div class="cyber-grid"></div>
    <div class="fund">
      <h2 class="cyber-text">Fund Your Account</h2>

      <div class="fund-options">
        <button class="cyber-button" @click="selectMethod('paystack')" :class="{ active: method === 'paystack' }">
          <div class="button-border"></div>
          <span class="button-text">Paystack</span>
          <div class="button-glow"></div>
        </button>
        <button class="cyber-button" @click="selectMethod('monnify')" :class="{ active: method === 'monnify' }">
          <div class="button-border"></div>
          <span class="button-text">Monnify</span>
          <div class="button-glow"></div>
        </button>
        <button class="cyber-button" @click="selectMethod('vendor')" :class="{ active: method === 'vendor' }">
          <div class="button-border"></div>
          <span class="button-text">Vendor</span>
          <div class="button-glow"></div>
        </button>
      </div>

      <div class="amount-input">
        <input type="number" v-model="amount" placeholder="Enter Amount (₦)" />
        <div class="input-glow"></div>
      </div>

      <button v-if="method === 'paystack'" @click="initializePaystack" class="pay-button">
        <span class="button-text">Fund with Paystack</span>
        <div class="button-glow"></div>
      </button>

      <div v-if="method === 'monnify'" class="bank-details glass-card">
        <h3 class="cyber-text-small">Virtual Account Details</h3>
        <div class="detail-row">
          <span class="label">Bank:</span>
          <strong class="value">Wema Bank</strong>
        </div>
        <div class="detail-row">
          <span class="label">Account No:</span>
          <strong class="value">8923651094</strong>
        </div>
        <div class="detail-row">
          <span class="label">Name:</span>
          <strong class="value">GAS FEE LIMITED</strong>
        </div>
        <p class="notice">Transaction will be processed automatically</p>
      </div>

      <div v-if="method === 'vendor'" class="vendor-section">
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
              <div class="vendor-header">
                <div class="vendor-title">
                  <h3 class="vendor-name">{{ vendor.name }}</h3>
                  <span class="vendor-email">{{ vendor.email }}</span>
                </div>
                <span :class="['status-badge', vendor.is_active ? 'online' : 'offline']">
                  {{ vendor.is_active ? 'Online' : 'Offline' }}
                </span>
              </div>
              <p class="vendor-description">{{ vendor.description }}</p>
            </div>
            <button @click="selectVendor(vendor)" class="select-vendor-btn" :disabled="!vendor.is_active">
              {{ vendor.is_active ? 'Select Vendor' : 'Currently Offline' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      amount: "",
      method: "", // Stores selected funding method
      vendors: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.loadPaystackSDK();
  },
  methods: {
    selectMethod(method) {
      this.method = method;
      if (method === 'vendor') {
        this.fetchVendors();
      }
    },

    loadPaystackSDK() {
      if (!window.PaystackPop) {
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = () => console.log("✅ Paystack SDK Loaded");
        script.onerror = () => console.error("❌ Failed to load Paystack SDK");
        document.body.appendChild(script);
      }
    },

    async initializePaystack() {
      if (!this.amount || this.amount <= 0) {
        alert("Enter a valid amount");
        return;
      }

      const userEmail = localStorage.getItem("user_email"); // Get user email

      if (!userEmail) {
        alert("User email not found. Please log in again.");
        return;
      }

      // Ensure Paystack SDK is available
      if (!window.PaystackPop) {
        alert("Paystack SDK not loaded. Please check your internet and try again.");
        return;
      }

      const handler = window.PaystackPop.setup({
        key: "pk_test_e241f51dfd995df634f6f85238ecdc530fc4bde4", // Replace with your test key
        email: userEmail,
        amount: this.amount * 100, // Convert to kobo
        currency: "NGN",
        callback: (response) => {
          console.log("Payment Successful, Reference:", response.reference);
          this.verifyTransaction(response.reference);
        },
        onClose: () => {
          alert("Transaction cancelled");
        },
      });

      handler.openIframe();
    },

    async verifyTransaction(reference) {
      console.log("Verifying transaction for reference:", reference);

      try {
        const response = await fetch("http://localhost:8081/api/paystack/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();
        console.log("Verification response:", data);

        if (data.status === "success") {
          alert("Payment successful! Your balance has been updated.");
          this.$router.push("/dashboard");
        } else {
          alert("Payment verification failed: " + (data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        alert("An error occurred while verifying payment.");
      }
    },

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
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&display=swap');

.fund-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0c0c1d 0%, #1a1a3a 100%);
  position: relative;
  overflow: hidden;
}

.cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, rgba(43, 100, 173, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(43, 100, 173, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: grid-flow 20s linear infinite;
}

.fund {
  max-width: 500px;
  width: 90%;
  padding: 30px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  z-index: 1;
}

.cyber-text {
  font-family: 'BlenderPro', sans-serif;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5),
               0 0 20px rgba(0, 255, 255, 0.3),
               0 0 30px rgba(0, 255, 255, 0.1);
  margin-bottom: 30px;
}

.cyber-text-small {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2em;
  color: #0ff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  margin-bottom: 20px;
  text-align: center;
}

.fund-options {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.cyber-button {
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  padding: 15px;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.9em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.button-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid rgba(0, 255, 255, 0.3);
  clip-path: polygon(0 10%, 10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%);
}

.cyber-button:hover, .cyber-button.active {
  background: rgba(0, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4),
              inset 0 0 20px rgba(0, 255, 255, 0.2);
}

.button-text {
  position: relative;
  z-index: 2;
  background: linear-gradient(to right, #fff, #0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: 0.5s;
}

.cyber-button:hover .button-glow {
  transform: translateX(100%);
}

.amount-input {
  position: relative;
  margin: 20px 0;
}

input {
  width: 100%;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  font-size: 1.1em;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.pay-button {
  background: linear-gradient(45deg, #00ff9d, #00ccff);
  color: #000;
  font-weight: bold;
  padding: 15px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pay-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.4);
}

.glass-card {
  background: rgba(13, 20, 40, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.detail-row .label {
  color: #88ccff;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9em;
  opacity: 0.8;
}

.detail-row .value {
  font-family: 'Orbitron', sans-serif;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  letter-spacing: 1px;
}

.notice {
  margin-top: 20px;
  color: #0ff;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.8em;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}

@keyframes grid-flow {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 30px 30px;
  }
}

/* Add this to your index.html or main CSS file */
@font-face {
  font-family: 'BlenderPro';
  src: url('/fonts/BlenderPro-Bold.woff2') format('woff2');
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
  font-weight: 300;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 100;
}

.back-btn:hover {
  background: rgba(0, 255, 243, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.2);
}

.back-icon {
  font-size: 1.2rem;
}

.back-text {
  font-size: 0.95rem;
  letter-spacing: 1px;
  white-space: nowrap;
}

@media screen and (max-width: 768px) {
  .back-btn {
    top: 1rem;
    left: 1rem;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}

.vendor-section {
  margin-top: 2rem;
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

.vendor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.vendor-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vendor-name {
  font-size: 1.2rem;
  color: #00fff3;
  margin: 0;
}

.vendor-email {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.online {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.status-badge.offline {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.vendor-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0.5rem 0;
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

.select-vendor-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.select-vendor-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>

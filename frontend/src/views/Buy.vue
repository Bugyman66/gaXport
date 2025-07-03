<template>
  <div class="buy-container">
    <div class="cyber-grid"></div>
    <div class="floating-particles"></div>
    
    <div class="buy-card glass-effect">
      <!-- Add Back Button -->
      <div class="back-nav">
        <button class="back-btn" @click="$router.go(-1)">
          <span class="back-icon">←</span>
          <span class="back-text">Back</span>
        </button>
      </div>

      <div class="card-header">
        <h2 class="title-glow">Buy Crypto</h2>
        <div class="gas-indicator">
          <span class="pulse-dot"></span>
         
        </div>
      </div>

      <form @submit.prevent="submitBuy" class="cyber-form">
        <!-- Wallet Selection -->
        <div class="input-group">
          <input type="text" v-model="wallet_address">
          <label class="cyber-label">
            <span class="icon">⬡</span>
            
          </label>
          <span class="focus-border"></span>
          <small class="hint">Enter your Wallet address </small>
        </div>

        <!-- Crypto Selection with Custom Styling -->
        <div class="select-group">
          <div class="select-wrapper">
            <select v-model="crypto" @change="updateCryptoPrice" required>
              <option value="" disabled selected>Select Cryptocurrency</option>
              <option value="ethereum">⟡ Ethereum (ETH)</option>
              <option value="solana">◎ Solana (SOL)</option>
              <option value="sui">Sui (SUI)</option>
              <option value="tron">Tron (TRX)</option>
              <option value="binancecoin">Binance Smart Chain (BNB)</option>
              <option value="matic-network">Polygon (MATIC)</option>
              <option value="near">Near Protocol (NEAR)</option>
              <option value="base-eth">Base Ethereum (BASE_ETH)</option>
              <option value="the-open-network">Toncoin (TON)</option>
              <option value="polkadot">Polkadot (DOT)</option>
            </select>
            <div class="select-arrow">▼</div>
          </div>
        </div>

        <!-- Amount Input with Enhanced UI -->
        <div class="amount-group">
          <div class="input-group">
            <input 
              type="number" 
              v-model.number="amount" 
              @input="updateConversion" 
              step="0.00000001" 
              required
              placeholder="0.00000000"
            >
            <label class="cyber-label">
              <span class="icon">₿</span>
              Amount
            </label>
            <span class="focus-border"></span>
          </div>
          
          <div class="conversion-display glass-card">
            <div class="conversion-item">
              <span class="label">USD</span>
              <span class="value">${{ (cryptoPriceUSD * amount).toFixed(2) || 0 }}</span>
            </div>
            <div class="conversion-item">
              <span class="label">NGN</span>
              <span class="value">₦{{ totalNaira || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Transaction Speed Selection -->
        <div class="speed-selector">
          <h3 class="speed-title">Transaction Speed</h3>
          <div class="speed-options">
            <button type="button" class="speed-btn" :class="{ active: speed === 'slow' }" @click="speed = 'slow'">
              <span class="speed-icon">🐢</span>
              <span class="speed-label">Slow</span>
              <span class="speed-price">Lower Fee</span>
            </button>
            <button type="button" class="speed-btn" :class="{ active: speed === 'normal' }" @click="speed = 'normal'">
              <span class="speed-icon">⚡</span>
              <span class="speed-label">Normal</span>
              <span class="speed-price">Standard Fee</span>
            </button>
            <button type="button" class="speed-btn" :class="{ active: speed === 'fast' }" @click="speed = 'fast'">
              <span class="speed-icon">🚀</span>
              <span class="speed-label">Fast</span>
              <span class="speed-price">Priority Fee</span>
            </button>
          </div>
        </div>

        <!-- Buy Button -->
        <button type="submit" class="submit-btn" :disabled="loading">
          <span class="btn-content">
            {{ loading ? 'Processing...' : 'Buy Now' }}
          </span>
          <span class="btn-glow"></span>
        </button>
      </form>

      <!-- Transaction Status -->
      <div v-if="message" class="status-container glass-effect">
        <div class="status-content" :class="messageType">
          <div class="status-icon">
            {{ messageType === 'success' ? '✓' : '⚠' }}
          </div>
          <div class="status-details">
            <p class="status-title">
              {{ messageType === 'success' ? 'Transaction Successful' : 'Transaction Failed' }}
            </p>
            <div v-if="transactionHash && messageType === 'success'" class="hash-container">
              <span class="hash-label">TX Hash:</span>
              <code class="hash-value">{{ formatHash(transactionHash) }}</code>
              <button @click="copyHash" class="copy-btn" :class="{ copied: copied }">
                {{ copied ? '✓' : '⎘' }}
              </button>
            </div>
            <p v-else class="error-text">{{ message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      wallet_address: "",
      crypto: "ethereum",
      amount: 0,
      cryptoPriceUSD: 0,
      usdToNgnRate: 1500, // Default rate (should be updated dynamically)
      totalNaira: 0,
      loading: false,
      message: "",
      messageType: "",
      speed: 'normal',
      transactionHash: '',
      copied: false,
      getCryptoIcon(crypto) {
        const icons = {
          ethereum: '⟡',
          solana: '◎',
          sui: '⬡',
          tron: '⚛',
          binancecoin: '⚡',
          'matic-network': '⬢',
          near: '⬡',
          'base-eth': '⟠',
          'the-open-network': '⚙',
          polkadot: '⚫',
        };
        return icons[crypto] || '○';
      }
    };
  },
  methods: {
    async fetchCryptoPrice() {
      try {
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,sui,tron,binancecoin,matic-network,near,the-open-network,polkadot&vs_currencies=usd`
        );

        this.cryptoPriceUSD = this.crypto === "base-eth" 
          ? res.data["ethereum"]?.usd || 0 
          : res.data[this.crypto]?.usd || 0;

        this.updateConversion();
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    },

    async fetchUsdToNgnRate() {
      try {
        const response = await fetch('https://gasfee-evw8.onrender.com/api/exchange-rate');
        const data = await response.json();
        if (response.ok) {
          this.usdToNgnRate = data.rate;
          this.updateConversion();
        } else {
          throw new Error(data.message || 'Failed to fetch exchange rate');
        }
      } catch (error) {
        console.error("Error fetching NGN rate:", error);
        // Fallback to default rate if fetch fails
        this.usdToNgnRate = 1600;
      }
    },

    updateCryptoPrice() {
      this.fetchCryptoPrice();
    },

    updateConversion() {
      if (this.cryptoPriceUSD && this.amount) {
        this.totalNaira = (this.amount * this.cryptoPriceUSD * this.usdToNgnRate).toFixed(2);
      } else {
        this.totalNaira = 0;
      }
    },

    async submitBuy() {
      if (!this.wallet_address || !this.amount || !this.crypto) {
        this.showMessage("All fields are required!", "error");
        return;
      }

      this.loading = true;
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage

        if (!token) {
          throw new Error("User is not authenticated. No token found.");
        }

        const response = await axios.post(
          "https://gasfee-evw8.onrender.com/api/buy",
          {
            crypto: this.crypto,
            amount: this.amount,
            wallet_address: this.wallet_address,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Attach token to request
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response Data:", response.data);
        if (response.data && response.data.transactionHash) {
          this.showMessage(response.data.transactionHash, "success");
        } else {
          this.showMessage("Transaction completed but no hash returned", "success");
        }
      } catch (error) {
        console.error("Transaction Error:", error.response);
        this.showMessage(
          error.response?.data?.message || "Transaction failed", 
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      this.transactionHash = type === 'success' ? text : '';
      
      // Clear message after delay
      setTimeout(() => {
        this.message = "";
        this.transactionHash = "";
        this.messageType = "";
      }, 10000);
    },

    formatHash(hash) {
      if (!hash) return '';
      return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    },

    copyHash() {
      navigator.clipboard.writeText(this.transactionHash);
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    },

    setMaxAmount() {
      // Add logic to set maximum available amount
      this.amount = 1.0; // Example value
      this.updateConversion();
    },
  },
  async mounted() {
    await this.fetchCryptoPrice();
    await this.fetchUsdToNgnRate();
    // Update interval to 10 seconds
    this.priceInterval = setInterval(() => {
      this.fetchCryptoPrice();
    }, 10000);
  },
  beforeUnmount() {
    // Clear interval when component is destroyed
    if (this.priceInterval) {
      clearInterval(this.priceInterval);
    }
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

.buy-container {
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

.buy-card {
  width: 100%;
  max-width: 600px;
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

.title-glow {
  font-family: 'Orbitron', sans-serif;
  font-size: 2.5rem;
  text-align: center;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
  margin-bottom: 2rem;
}

.input-group {
  position: relative;
  margin-bottom: 2rem;
}

.input-group input {
  width: 100%;
  padding: 1.2rem 1rem 0.8rem;
  background: rgba(13, 14, 33, 0.6);
  border: 1px solid rgba(0, 255, 243, 0.1);
  border-radius: 12px;
  color: #00fff3;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.input-group input::placeholder {
  color: rgba(0, 255, 243, 0.3);
}

.cyber-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.3);
}

.hint {
  position: absolute;
  left: 1rem;
  bottom: -1.5rem;
  font-size: 0.8rem;
  color: rgba(0, 255, 243, 0.5);
  font-family: 'Space Grotesk', sans-serif;
}

.select-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.select-wrapper {
  position: relative;
  background: rgba(13, 14, 33, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 243, 0.1);
}

select {
  width: 100%;
  padding: 1.2rem;
  background: transparent;
  border: none;
  color: #00fff3;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  cursor: pointer;
  appearance: none;
  z-index: 1;
}

select option {
  background: #0a0f2c;
  color: #00fff3;
  padding: 1rem;
  font-family: 'Space Grotesk', sans-serif;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #00fff3;
  font-size: 0.8rem;
  pointer-events: none;
}

.amount-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.amount-controls {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.max-btn {
  padding: 0.3rem 0.8rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.max-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(0, 255, 243, 0.3);
}

/* Add glowing effect for focused inputs */
.input-group input:focus,
.select-wrapper:focus-within {
  border-color: #00fff3;
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.2);
  background: rgba(13, 14, 33, 0.8);
}

.conversion-display {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: rgba(13, 14, 33, 0.6);
  border: 1px solid rgba(0, 255, 243, 0.1);
  padding: 1.5rem;
}

.conversion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-radius: 8px;
  background: rgba(0, 255, 243, 0.05);
}

.conversion-item .label {
  font-family: 'Orbitron', sans-serif;
  color: rgba(0, 255, 243, 0.7);
  font-size: 0.9rem;
}

.conversion-item .value {
  font-family: 'JetBrains Mono', monospace;
  color: #00fff3;
  font-size: 1.1rem;
  font-weight: 500;
}

.speed-selector {
  margin: 2rem 0;
}

.speed-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.speed-btn {
  background: rgba(13, 14, 33, 0.6);
  border: 1px solid rgba(0, 255, 243, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.speed-btn .speed-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.speed-btn .speed-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #00fff3;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.3);
  letter-spacing: 1px;
}

.speed-btn .speed-price {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.speed-btn:hover {
  transform: translateY(-5px);
  background: rgba(0, 255, 243, 0.1);
  border-color: #00fff3;
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.2);
}

.speed-btn.active {
  background: linear-gradient(135deg, rgba(0, 255, 243, 0.2), rgba(119, 0, 255, 0.2));
  border: 2px solid #00fff3;
  box-shadow: 0 0 30px rgba(0, 255, 243, 0.3);
}

.speed-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(0, 255, 243, 0.4);
  letter-spacing: 2px;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(45deg, #00fff3, #7700ff);
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 255, 243, 0.4);
}

.status-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .buy-card {
    padding: 1.5rem;
  }

  .title-glow {
    font-size: 2rem;
  }

  .speed-options {
    grid-template-columns: 1fr;
  }

  .conversion-display {
    grid-template-columns: 1fr;
  }

  .speed-btn {
    padding: 0.8rem;
  }

  .submit-btn {
    font-size: 1rem;
    padding: 0.8rem;
  }
}

.status-container {
  margin-top: 2rem;
  border-radius: 12px;
  overflow: hidden;
  animation: slideIn 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.status-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
}

.status-content.success {
  background: rgba(0, 255, 243, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.2);
}

.status-content.error {
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.2);
}

.status-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.success .status-icon {
  color: #00fff3;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
}

.error .status-icon {
  color: #ff4d4d;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.5);
}

.status-details {
  flex: 1;
}

.status-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.hash-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.hash-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.hash-value {
  font-family: 'JetBrains Mono', monospace;
  color: #00fff3;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.3);
}

.copy-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.copy-btn.copied {
  background: rgba(0, 255, 243, 0.2);
  color: #00fff3;
}

.error-text {
  color: #ff4d4d;
  font-size: 0.9rem;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-nav {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: rgba(13, 14, 33, 0.6);
  border: 1px solid rgba(0, 255, 243, 0.1);
  border-radius: 12px;
  color: #00fff3;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(0, 255, 243, 0.1);
  transform: translateX(-5px);
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.2);
}

.back-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-icon {
  transform: translateX(-3px);
}
</style>

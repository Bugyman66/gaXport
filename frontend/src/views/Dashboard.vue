<template>
  <div class="dashboard cyberpunk-bg">
    <!-- Header with Three-dot Menu -->
    <div class="header">
      <h1>Welcome, {{ user.email }}!</h1>
      <div class="menu">
        <button @click="toggleMenu">⋮</button>
        <ul v-if="menuOpen" class="dropdown">
          <li @click="goToProfile">Profile</li>
          <li @click="logout">Logout</li>
        </ul>
      </div>
    </div>

    <!-- Balance Section -->
    <div class="balance-section">
      <h3>My Balance</h3>
      <p class="balance">₦{{ balance.toLocaleString() }}</p>
      <p class="commission">Referral Commission: ₦0</p>
    </div>

    <!-- Quick Actions -->
    <div class="actions">
      <div class="action" @click="goToBuy">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" class="icon-buy">
            <path d="M13 19V7.83l4.88 4.88c.39.39 1.03.39 1.42 0 .39-.39.39-1.02 0-1.41l-6.59-6.59a.996.996 0 0 0-1.41 0l-6.6 6.58a.996.996 0 1 0 1.41 1.41L11 7.83V19c0 .55.45 1 1 1s1-.45 1-1z"/>
          </svg>
        </div>
        <span class="action-label">Buy Gas</span>
      </div>
      <div class="action" @click="sell">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" class="icon-sell">
            <path d="M11 5v11.17l-4.88-4.88c-.39-.39-1.03-.39-1.42 0a.996.996 0 0 0 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0l6.59-6.59a.996.996 0 1 0-1.41-1.41L13 16.17V5c0-.55-.45-1-1-1s-1 .45-1 1z"/>
          </svg>
        </div>
        <span class="action-label">Sell Gas</span>
      </div>
      <div class="action" @click="goToFund">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" class="icon-fund">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
          </svg>
        </div>
        <span class="action-label">Fund</span>
      </div>
      <div class="action" @click="goToHistory">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" class="icon-history">
            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
        </div>
        <span class="action-label">History</span>
      </div>
      <!-- New Profile Action -->
      <div class="action" @click="goToProfile">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" class="icon-profile">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <span class="action-label">Profile</span>
      </div>
    </div>

    <!-- Real-time Crypto Prices -->
    <div class="crypto-section neon-glow">
      <h3>⚡ Crypto Prices (Live)</h3>
      <div class="crypto-list">
        <div v-for="(price, key) in cryptoPrices" 
             :key="key" 
             class="crypto-card glass-card"
             :class="{'pulse': price.change > 2}">
          <div class="crypto-icon">{{ getCryptoIcon(key) }}</div>
          <div class="crypto-info">
            <span class="crypto-name">{{ price.name }}</span>
            <span class="crypto-price neon-text">${{ price.price.toLocaleString() }}</span>
          </div>
          <span :class="{'price-down': price.change < 0, 'price-up': price.change > 0}">
            {{ price.change > 0 ? '↗' : '↘' }} {{ Math.abs(price.change).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Scrolling Ticker -->
    <div class="ticker">
      <div class="ticker-content">
        <span v-for="(price, key) in cryptoPrices" :key="key" class="ticker-item">
          {{ price.name }}: ${{ price.price.toLocaleString() }} ({{ price.change > 0 ? '+' : '' }}{{ price.change.toFixed(2) }}%)
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  data() {
    return {
      user: {},
      balance: 0,
      menuOpen: false,
      cryptoPrices: {},
      lastFetchTime: 0,
      retryTimeout: null,
      selectedCoins: [
        { id: "ethereum", name: "Ethereum (ETH)" },
        { id: "solana", name: "Solana (SOL)" },
        { id: "sui", name: "Sui (SUI)" },
        { id: "tron", name: "Tron (TRX)" },
        { id: "binancecoin", name: "BNB" },
        { id: "polkadot", name: "Polkadot (DOT)" },
        { id: "matic-network", name: "Polygon (MATIC)" },
        { id: "near", name: "Near Protocol (NEAR)" },
        { id: "the-open-network", name: "Toncoin (TON)" } // Correct ID for TON
      ],
      icons: {
        ethereum: '⟡',
        solana: '◎',
        sui: '⬡',
        tron: '⚛',
        binancecoin: '⭑',
        polkadot: '●',
        'matic-network': '⬢',
        near: '◈',
        'the-open-network': '⬣' // Updated icon mapping for TON
      }
    };
  },
  mounted() {
    this.getUserData();
    this.fetchCryptoPrices();
    this.startCryptoPriceUpdates();
    this.handleActionHover();
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    getUserData() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }

      fetch("https://gasfee-evw8.onrender.com/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.user) {
            this.user = data.user;
            this.updateBalance(); // Fetch balance after user data is loaded
          } else {
            localStorage.removeItem("token");
            this.$router.push("/login");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          this.$router.push("/login");
        });
    },
    updateBalance() {
      const token = localStorage.getItem("token");
      if (!token || !this.user.email) {
        this.balance = 0;
        return;
      }

      fetch(`https://gasfee-evw8.onrender.com/api/user/balance?email=${this.user.email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            this.balance = data.balance;
          } else {
            console.error("Failed to fetch balance:", data.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching balance:", error);
        });
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("balance"); // Clear balance on logout
      this.$router.push("/login");
    },
    goToFund() {
      this.$router.push("/fund");
    },
    goToBuy() {
      this.$router.push("/buy");
    },
    goToHistory() {
      this.$router.push("/transaction-history");
    },
    goToProfile() {
      this.$router.push('/profile');
    },
    async fetchCryptoPrices() {
      try {
        const coinIds = this.selectedCoins.map(coin => coin.id).join(',');
        const response = await fetch(`/api/coingecko/simple/price?ids=${coinIds}&vs_currencies=usd&include_24h_change=true`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Update crypto prices
        this.cryptoPrices = this.selectedCoins.reduce((acc, coin) => {
          acc[coin.id] = {
            name: coin.name,
            price: data[coin.id]?.usd || 0,
            change: data[coin.id]?.usd_24h_change || 0
          };
          return acc;
        }, {});

        this.lastFetchTime = Date.now();
      } catch (error) {
        console.error("Failed to fetch crypto prices:", error);
        
        // Set fallback values if fetch fails
        this.cryptoPrices = this.selectedCoins.reduce((acc, coin) => {
          acc[coin.id] = {
            name: coin.name,
            price: 0,
            change: 0
          };
          return acc;
        }, {});

        // Retry after 10 seconds
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => this.fetchCryptoPrices(), 10000);
      }
    },
    startCryptoPriceUpdates() {
      // Initial fetch
      this.fetchCryptoPrices();
      // Update every 10 seconds
      setInterval(() => {
        this.fetchCryptoPrices();
        this.updateBalance();
      }, 10000);
    },
    getCryptoIcon(key) {
      return this.icons[key] || '○';
    },
    handleActionHover() {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        document.querySelectorAll('.action').forEach(button => {
          button.addEventListener('mousemove', e => {
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / button.clientWidth) * 100;
            const y = ((e.clientY - rect.top) / button.clientHeight) * 100;
            button.style.setProperty('--x', `${x}%`);
            button.style.setProperty('--y', `${y}%`);
          });
        });
      }, 100);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400&family=Outfit:wght@200;300;400&family=Space+Grotesk:wght@300;400&display=swap');

.cyberpunk-bg {
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
  position: relative;
  overflow-x: hidden;
  width: 100%;
  margin: 0;
  padding: 0;
}

.cyberpunk-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    repeating-linear-gradient(90deg, 
      rgba(255,255,255,0.03) 0px, 
      rgba(255,255,255,0.03) 1px,
      transparent 1px, 
      transparent 30px);
  pointer-events: none;
}

.dashboard {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 300;
  min-height: 100vh;
  width: 100%;
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
  margin: 0;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 24px -1px rgba(0, 0, 0, 0.2),
    0 0 16px rgba(0, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 
    0 8px 32px -1px rgba(0, 0, 0, 0.3),
    0 0 24px rgba(0, 255, 255, 0.2);
}

.neon-text {
  color: #fff;
  text-shadow: 
    0 0 10px rgba(0, 255, 255, 0.5),
    0 0 20px rgba(0, 255, 255, 0.3),
    0 0 30px rgba(0, 255, 255, 0.1);
}

.neon-glow {
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.crypto-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 25px;
  border-radius: 20px;
  position: relative;
}

.crypto-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.price-up {
  color: #00ffa3;
  text-shadow: 0 0 10px rgba(0, 255, 163, 0.5);
}

.price-down {
  color: #ff4d4d;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.5);
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.ticker {
  background: rgba(26, 11, 46, 0.8);
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.ticker-item {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 300;
  letter-spacing: 0.5px;
  margin-right: 50px;
  color: #00fff3;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  font-family: 'Outfit', sans-serif;
  font-weight: 200;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 1.8rem;
  letter-spacing: 1px;
}

.menu button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.menu button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.dropdown li {
  padding: 10px 20px;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.dropdown li:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #00fff3;
}

.balance-section {
  background: rgba(15, 25, 45, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 35px;
  text-align: center;
  border: 1px solid rgba(0, 255, 243, 0.2);
  margin-bottom: 30px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 50px rgba(0, 255, 243, 0.1);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  animation: floatBalance 6s ease-in-out infinite;
}

.balance-section::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: radial-gradient(
    circle at center,
    rgba(0, 255, 243, 0.1) 0%,
    transparent 70%
  );
  animation: rotatePlasma 15s linear infinite;
}

.balance {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 3.2rem;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #00fff3, #7700ff, #00fff3);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 15px 0;
  animation: shimmerText 3s linear infinite;
  text-shadow: 
    0 0 20px rgba(0, 255, 243, 0.2),
    0 0 40px rgba(0, 255, 243, 0.1);
  transform: translateZ(20px);
}

.commission {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 300;
  color: #00fff3;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  padding: 0 10px;
}

.action {
  background: rgba(15, 25, 45, 0.7);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 255, 243, 0.2);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
}

.action::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--x, 50%) var(--y, 50%),
    rgba(0, 255, 243, 0.1) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.action:hover::before {
  opacity: 1;
}

.action:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 10px 20px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(0, 255, 243, 0.3),
    inset 0 0 20px rgba(0, 255, 243, 0.1);
  border-color: rgba(0, 255, 243, 0.4);
}

.action-icon {
  margin-bottom: 12px;
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  background: rgba(0, 255, 243, 0.1);
  border-radius: 16px;
  padding: 12px;
  transition: all 0.3s ease;
}

.action:hover .action-icon {
  transform: scale(1.1);
  background: rgba(0, 255, 243, 0.2);
}

.action svg {
  width: 100%;
  height: 100%;
  fill: #00fff3;
  filter: drop-shadow(0 0 8px rgba(0, 255, 243, 0.5));
  transition: all 0.3s ease;
}

.action:hover svg {
  filter: drop-shadow(0 0 12px rgba(0, 255, 243, 0.8));
}

.action-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 0.95rem;
  color: #fff;
  letter-spacing: 0.5px;
  margin-top: 8px;
  display: block;
  transition: all 0.3s ease;
}

.action:hover .action-label {
  color: #00fff3;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
}

.icon-buy { animation: float 3s ease-in-out infinite; }
.icon-sell { animation: float 3s ease-in-out infinite 0.5s; }
.icon-fund { animation: float 3s ease-in-out infinite 1s; }
.icon-history { animation: float 3s ease-in-out infinite 1.5s; }
.icon-profile { animation: float 3s ease-in-out infinite 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.crypto-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.crypto-section h3 {
  color: #00fff3;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.crypto-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.crypto-card {
  background: rgba(15, 25, 45, 0.7);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(0, 255, 243, 0.2);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  animation: floatCard 5s ease-in-out infinite;
}

.crypto-card::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: radial-gradient(
    circle at center,
    rgba(0, 255, 243, 0.1) 0%,
    transparent 70%
  );
  animation: rotateHologram 10s linear infinite;
}

.crypto-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 200;
  font-size: 1.3rem;
  color: #fff;
  margin-bottom: 15px;
  letter-spacing: 2px;
  transform: translateZ(15px);
}

.crypto-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 2.2rem;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #00fff3, #7700ff, #00fff3);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 15px 0;
  animation: shimmerText 3s linear infinite;
  transform: translateZ(20px);
}

.red {
  color: #ff4d4d;
  font-weight: 600;
}

.green {
  color: #00ffa3;
  font-weight: 600;
}

.ticker {
  background: rgba(20, 20, 40, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 15px;
  margin-top: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ticker-content {
  display: flex;
  animation: ticker 30s linear infinite;
}

.ticker-item {
  margin-right: 50px;
  color: #00fff3;
}

@keyframes ticker {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes floatBalance {
  0%, 100% { transform: translateY(0) rotateX(0deg); }
  50% { transform: translateY(-10px) rotateX(2deg); }
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0) rotate3d(1, 1, 0, 0deg); }
  50% { transform: translateY(-8px) rotate3d(1, 1, 0, 2deg); }
}

@keyframes shimmerText {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes rotatePlasma {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes rotateHologram {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile Responsiveness */
@media screen and (max-width: 768px) {
  .dashboard {
    padding: 15px;
    min-height: 100vh;
    width: 100%;
    margin: 0;
    box-sizing: border-box;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .menu {
    position: absolute;
    top: 15px;
    right: 15px;
  }

  .balance-section {
    padding: 25px;
    margin-top: 20px;
  }

  .balance {
    font-size: 2.5rem;
  }

  .actions {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 0 5px;
  }

  .action {
    padding: 15px 10px;
  }

  .action-icon {
    height: 36px;
    width: 36px;
    padding: 8px;
  }

  .action-label {
    font-size: 0.85rem;
  }

  .crypto-section {
    padding: 20px 15px;
  }

  .crypto-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .crypto-card {
    padding: 20px;
  }

  .crypto-name {
    font-size: 1.1rem;
  }

  .crypto-price {
    font-size: 1.8rem;
  }

  .ticker {
    padding: 10px;
    margin-top: 20px;
  }

  .ticker-item {
    font-size: 0.9rem;
  }

  /* Adjust animations for better mobile performance */
  .crypto-card::before,
  .balance-section::before {
    animation: none;
  }

  .crypto-card,
  .balance-section {
    animation: none;
    transform: none !important;
  }

  .action:hover {
    transform: none;
  }
}

/* Small mobile devices */
@media screen and (max-width: 380px) {
  .actions {
    grid-template-columns: 1fr;
  }

  .balance {
    font-size: 2rem;
  }

  .crypto-card {
    padding: 15px;
  }
}

/* Adjust hover effects for touch devices */
@media (hover: none) {
  .action::before,
  .crypto-card::before,
  .balance-section::before {
    display: none;
  }

  .action:active {
    background: rgba(0, 255, 243, 0.1);
  }

  .action-icon:active {
    transform: scale(0.95);
  }

  .glass-card:active {
    transform: scale(0.98);
  }
}

@media screen and (max-width: 1200px) {
  .actions {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 480px) {
  .actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
</style>

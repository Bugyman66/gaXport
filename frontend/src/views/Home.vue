<template>
  <div class="home-container">
    <!-- Background Effects -->
    <div class="matrix-grid"></div>
    <div class="plasma-effect"></div>
    <div class="cyber-particles"></div>
    
    <main class="main-content">
      <!-- Hero Section -->
      <section class="hero-wrapper">
        <div class="hero-content glass-panel">
          <div class="brand">
            <div class="logo-wrapper">
              <div class="logo-group">
                <span class="logo-symbol">VC</span>
                <span class="logo-divider"></span>
                <span class="logo-name">Gasify</span>
              </div>
              <p class="brand-tagline">Seamless Gas, Minimal Fees, Maximum Efficiency.</p>
            </div>
          </div>

          <h1 class="title-wrapper">
            <span class="title-main">Buy & Track</span>
            <span class="title-accent">Gas Fees in Real-Time</span>
          </h1>

          <div class="auth-portal">
            <router-link to="/login" class="portal-btn login">
              <span class="btn-inner">Login</span>
              <div class="btn-holo"></div>
            </router-link>
            <router-link to="/register" class="portal-btn register">
              <span class="btn-inner">Create Account</span>
              <div class="btn-holo"></div>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Live Network Stats -->
      <section class="stats-wrapper">
        <div class="stats-container neo-glass">
          <h2 class="stats-title">Live Network Status <span class="pulse-dot"></span></h2>
          <div class="stats-grid">
            <div v-for="(network, index) in networks" 
                 :key="network.symbol" 
                 class="network-card"
                 :style="{ '--card-index': index }"
                 :class="{ 'high-activity': isPriceHigh(network.price) }">
              <div class="network-icon">{{ network.icon }}</div>
              <div class="network-info">
                <span class="network-name">{{ network.name }}</span>
                <span class="network-price">${{ formatPrice(network.price) }}</span>
                <div class="network-trend" :class="network.priceChange >= 0 ? 'up' : 'down'">
                  {{ network.priceChange >= 0 ? '▲' : '▼' }} {{ Math.abs(network.priceChange).toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="features-section glass-panel">
        <h2 class="section-title">How It Works</h2>
        <div class="features-grid">
          <div v-for="(feature, index) in features" 
               :key="index" 
               class="feature-card"
               :style="{ animationDelay: `${index * 0.2}s`, '--feature-color': feature.color }">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="site-footer glass-panel">
        <div class="footer-grid">
          <div class="footer-section">
            <h3>About Us</h3>
            <p>Leading provider of Web3 gas fee optimization solutions</p>
          </div>
          
          <div class="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><router-link to="/dashboard">Dashboard</router-link></li>
              <li><router-link to="/register">Get Started</router-link></li>
              <li><a href="#features">How It Works</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h3>Contact</h3>
            <ul>
              <li>gasify@virtual<br>connekt.com.ng</li>
              <li>+2348116089375</li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h3>Follow Us</h3>
            <div class="social-links">
              <a href="#" class="social-icon">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="social-icon">
                <i class="fab fa-telegram"></i>
              </a>
              <a href="#" class="social-icon">
                <i class="fab fa-discord"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 VirtualConnekt. All rights reserved.</p>
        </div>
      </footer>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      networks: [],
      lastFetchTime: 0,
      features: [
        {
          icon: '⚡',
          title: 'Real-Time Analytics',
          description: 'Advanced gas fee tracking with predictive AI technology for optimal transaction timing.',
          color: '#00fff3'
        },
        {
          icon: '🎯',
          title: 'Smart Automation',
          description: 'Automated transaction execution when gas fees match your target price.',
          color: '#7700ff'
        },
        {
          icon: '🔮',
          title: 'Predictive Insights',
          description: 'ML-powered forecasting to help you choose the best transaction windows.',
          color: '#ff3399'
        },
        {
          icon: '🌐',
          title: 'Cross-Chain Support',
          description: 'Seamless integration with major networks including ETH, BSC, and Polygon.',
          color: '#00ffa3'
        }
      ],
      networkIcons: {
        'ethereum': '⟡',
        'binancecoin': '⭑',
        'matic-network': '⬢',
        'solana': '◎',
        'ton': '💎',
        'sui': '⬡',
        'tron': '⚡',
        'linea': '⬨',
        'base': '🔷'
      }
    }
  },
  methods: {
    formatPrice(price) {
      if (!price) return '0.00';
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    },
    isPriceHigh(price) {
      return parseFloat(price) > 100;
    },
    async fetchPrices() {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,matic-network,solana,the-open-network,sui,tron&vs_currencies=usd&include_24h_change=true',
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        this.networks = [
          {
            symbol: 'ETH',
            name: 'Ethereum',
            icon: this.networkIcons.ethereum,
            price: data.ethereum?.usd || 0,
            priceChange: data.ethereum?.usd_24h_change || 0
          },
          {
            symbol: 'BNB',
            name: 'BSC',
            icon: this.networkIcons.binancecoin,
            price: data.binancecoin?.usd || 0,
            priceChange: data.binancecoin?.usd_24h_change || 0
          },
          {
            symbol: 'MATIC',
            name: 'Polygon',
            icon: this.networkIcons['matic-network'],
            price: data['matic-network']?.usd || 0,
            priceChange: data['matic-network']?.usd_24h_change || 0
          },
          {
            symbol: 'SOL',
            name: 'Solana',
            icon: this.networkIcons.solana,
            price: data.solana?.usd || 0,
            priceChange: data.solana?.usd_24h_change || 0
          },
          {
            symbol: 'TON',
            name: 'Toncoin',
            icon: this.networkIcons.ton,
            price: data['the-open-network']?.usd || 0,
            priceChange: data['the-open-network']?.usd_24h_change || 0
          },
          {
            symbol: 'SUI',
            name: 'Sui',
            icon: this.networkIcons.sui,
            price: data.sui?.usd || 0,
            priceChange: data.sui?.usd_24h_change || 0
          },
          {
            symbol: 'TRX',
            name: 'Tron',
            icon: this.networkIcons.tron,
            price: data.tron?.usd || 0,
            priceChange: data.tron?.usd_24h_change || 0
          },
          // Linea and Base don't have direct price feeds, using ETH price as reference
          {
            symbol: 'LINEA',
            name: 'Linea',
            icon: this.networkIcons.linea,
            price: data.ethereum?.usd || 0,
            priceChange: data.ethereum?.usd_24h_change || 0
          },
          {
            symbol: 'BASE',
            name: 'Base',
            icon: this.networkIcons.base,
            price: data.ethereum?.usd || 0,
            priceChange: data.ethereum?.usd_24h_change || 0
          }
        ];

        this.lastFetchTime = Date.now();
      } catch (error) {
        console.error('Error fetching prices:', error);
        // Set fallback values if fetch fails
        if (!this.networks.length) {
          this.networks = [
            { symbol: 'ETH', name: 'Ethereum', icon: '⟡', price: 0, priceChange: 0 },
            { symbol: 'BNB', name: 'BSC', icon: '⭑', price: 0, priceChange: 0 },
            { symbol: 'MATIC', name: 'Polygon', icon: '⬢', price: 0, priceChange: 0 }
          ];
        }
      }
    }
  },
  mounted() {
    this.fetchPrices();
    // Update prices every 30 seconds to avoid rate limiting
    setInterval(this.fetchPrices, 30000);
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400&family=Space+Grotesk:wght@300;400&family=Manrope:wght@200;300;400&display=swap');

/* Core Layout */
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #08091a 0%, #1a1b46 50%, #080b2c 100%);
  position: relative;
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
}

/* Background Effects */
.matrix-grid {
  position: fixed;
  inset: 0;
  background-image: 
    linear-gradient(90deg, rgba(0, 255, 243, 0.03) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 255, 243, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridFloat 20s linear infinite;
  z-index: 1;
}

.plasma-effect {
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(119, 0, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(0, 255, 243, 0.15) 0%, transparent 50%);
  filter: blur(100px);
  animation: plasmaPulse 10s ease infinite alternate;
  z-index: 2;
}

.cyber-particles {
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle at 50% 50%, rgba(0, 255, 243, 0.1) 0%, transparent 40%);
  opacity: 0.7;
  animation: particlesDrift 15s ease-in-out infinite;
  z-index: 3;
}

/* Main Content */
.main-content {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Hero Section */
.hero-wrapper {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.hero-content {
  text-align: center;
  padding: 3rem;
  transform-style: preserve-3d;
  animation: floatIn 1s ease-out, float 6s ease-in-out infinite;
  background: rgba(13, 17, 38, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(89, 195, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(9, 14, 44, 0.7),
    0 0 50px rgba(0, 255, 243, 0.2);
  position: relative;
  overflow: hidden;
}

.hero-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(89, 195, 255, 0.1),
    transparent
  );
  animation: holographicScan 8s linear infinite;
}

.glass-panel {
  background: rgba(13, 17, 38, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(89, 195, 255, 0.2);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(9, 14, 44, 0.7),
    0 0 0 1px rgba(89, 195, 255, 0.1);
}

.brand {
  margin-bottom: 3rem;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(0, 255, 243, 0.1);
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-symbol {
  font-family: 'Outfit', sans-serif;
  font-weight: 200;
  font-size: 3.2rem;
  font-weight: 800;
  background: linear-gradient(
    45deg,
    #00fff3,
    #7700ff,
    #ff3399,
    #00fff3
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradientFlow 8s ease infinite;
  text-shadow: 
    0 0 20px rgba(0, 255, 243, 0.5),
    0 0 40px rgba(0, 255, 243, 0.3);
}

.logo-divider {
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 0.5rem;
}

.logo-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.brand-tagline {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 300;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 1rem;
  letter-spacing: 2px;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
}

.title-main {
  font-family: 'Manrope', sans-serif;
  font-weight: 200;
  font-size: 3.5rem;
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
  letter-spacing: 2px;
}

.title-accent {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 300;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 3px;
}

/* Network Stats */
.stats-wrapper {
  margin-top: 4rem;
}

.stats-container {
  padding: 3rem;
  border-radius: 24px;
  background: rgba(13, 17, 38, 0.95);
  border: 1px solid rgba(89, 195, 255, 0.2);
  transform-style: preserve-3d;
}

.stats-title {
  font-family: 'Audiowide', cursive;
  font-size: 2rem;
  color: #fff;
  text-align: center;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: #00fff3;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.network-card {
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(89, 195, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transform-style: preserve-3d;
  animation: cardFloat 6s ease-in-out infinite;
  animation-delay: calc(var(--card-index, 0) * 0.2s);
}

.network-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    225deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  transform: translateZ(-1px);
}

.network-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.network-card:hover {
  transform: translateY(-10px) rotateX(10deg) rotateY(-10deg);
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(0, 255, 243, 0.2);
}

.network-card:hover::after {
  opacity: 1;
}

.network-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
}

.network-info {
  flex: 1;
}

.network-name {
  font-family: 'Audiowide', cursive;
  font-size: 1.2rem;
  color: #fff;
  display: block;
  margin-bottom: 0.5rem;
}

.network-price {
  font-size: 2rem;
  font-weight: 700;
  color: #00fff3;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
  display: block;
  margin-bottom: 0.5rem;
}

.network-trend {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  display: inline-block;
}

.network-trend.up {
  background: rgba(0, 255, 163, 0.1);
  color: #00ffa3;
}

.network-trend.down {
  background: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
}

/* Portal Buttons */
.auth-portal {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 3rem;
}

.portal-btn {
  font-family: 'Manrope', sans-serif;
  font-weight: 300;
  position: relative;
  padding: 1rem 3rem;
  border-radius: 12px;
  font-family: 'Audiowide', cursive;
  font-size: 1rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 2px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.portal-btn.login {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(89, 195, 255, 0.3);
  color: #fff;
}

.portal-btn.register {
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border: none;
  color: #fff;
}

.portal-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(0, 255, 243, 0.3);
}

/* Features Section */
.features-section {
  padding: 6rem 2rem;
  margin: 4rem 0;
  position: relative;
}

.section-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 200;
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
  perspective: 1000px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  animation: cardFloat 3s ease-in-out infinite;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    225deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  transform: translateZ(-1px);
}

.feature-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px) rotateX(10deg) rotateY(-10deg);
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(0, 255, 243, 0.2);
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  background: var(--feature-color, linear-gradient(135deg, #00fff3, #7700ff));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 15px rgba(0, 255, 243, 0.5));
  transform: translateZ(20px);
}

.feature-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
  letter-spacing: 1px;
  transform: translateZ(15px);
}

.feature-description {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 300;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  transform: translateZ(10px);
}

@keyframes cardFloat {
  0%, 100% {
    transform: translateY(0) rotateX(0) rotateY(0);
  }
  50% {
    transform: translateY(-10px) rotateX(5deg) rotateY(-5deg);
  }
}

/* Add this to your existing animations */
@keyframes holographicShine {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Footer Styling */
.site-footer {
  margin-top: 6rem;
  padding: 4rem 2rem 2rem;
  background: rgba(13, 17, 38, 0.95);
  transform-style: preserve-3d;
  animation: float 8s ease-in-out infinite;
  position: relative;
}

.site-footer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(89, 195, 255, 0.1),
    transparent
  );
  animation: holographicScan 12s linear infinite;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-section h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 200;
  font-size: 1.4rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 15px rgba(0, 255, 243, 0.3);
}

.footer-section p, .footer-section li {
  font-family: 'Space Grotesk', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  transition: all 0.3s ease;
}

.footer-section a {
  color: #00fff3;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.footer-section a:hover {
  color: #7700ff;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00fff3;
  transition: all 0.3s ease;
}

.social-icon:hover {
  background: rgba(0, 255, 243, 0.1);
  transform: translateY(-3px);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

/* Animations */
@keyframes gridFloat {
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
}

@keyframes plasmaPulse {
  0% { opacity: 0.3; }
  100% { opacity: 0.7; }
}

@keyframes particlesDrift {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.1); }
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 243, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 255, 243, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 243, 0); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotateX(0deg);
  }
  50% {
    transform: translateY(-10px) rotateX(2deg);
  }
}

@keyframes holographicScan {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(100%) skewX(-15deg);
  }
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .title-main {
    font-size: 2rem;
  }
  
  .auth-portal {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .portal-btn {
    width: 100%;
    text-align: center;
  }
}

/* Enhanced Mobile Responsiveness */
@media screen and (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .hero-content {
    padding: 2rem 1rem;
  }

  .logo-wrapper {
    padding: 0.5rem 1rem;
    flex-direction: column;
  }

  .logo-symbol {
    font-weight: 200;
    font-size: 2.5rem;
  }

  .logo-name {
    font-weight: 300;
    font-size: 1.8rem;
  }

  .logo-divider {
    display: none;
  }

  .brand-tagline {
    font-size: 0.9rem;
    letter-spacing: 1px;
  }

  .title-main {
    font-weight: 200;
    font-size: 2rem;
  }

  .title-accent {
    font-weight: 300;
    font-size: 1.1rem;
    letter-spacing: 2px;
  }

  .auth-portal {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .portal-btn {
    width: 100%;
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .stats-container {
    padding: 1.5rem;
  }

  .stats-title {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }

  .network-card {
    padding: 1.5rem;
    gap: 1rem;
  }

  .network-icon {
    font-size: 2rem;
  }

  .network-name {
    font-size: 1rem;
  }

  .network-price {
    font-size: 1.5rem;
  }

  .features-section {
    padding: 3rem 1rem;
    margin: 2rem 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    gap: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .feature-icon {
    font-size: 2.5rem;
  }

  .feature-title {
    font-weight: 300;
    font-size: 1.2rem;
  }

  .feature-description {
    font-size: 0.9rem;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }

  /* Optimize animations for mobile */
  .network-card,
  .feature-card,
  .hero-content {
    animation: none;
    transform: none !important;
  }

  .network-card:hover,
  .feature-card:hover {
    transform: none !important;
    box-shadow: none;
  }

  /* Adjust background effects for better mobile performance */
  .matrix-grid,
  .plasma-effect,
  .cyber-particles {
    display: none;
  }

  .site-footer {
    margin-top: 3rem;
    padding: 2rem 1rem 1rem;
  }
}

/* Small mobile devices */
@media screen and (max-width: 380px) {
  .title-main {
    font-size: 1.8rem;
  }

  .network-card {
    padding: 1rem;
  }

  .network-price {
    font-size: 1.3rem;
  }

  .feature-card {
    padding: 1.2rem;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .portal-btn:active,
  .network-card:active,
  .feature-card:active {
    transform: scale(0.98);
  }

  .network-card::after,
  .feature-card::after,
  .hero-content::before {
    display: none;
  }

  .portal-btn:hover,
  .network-card:hover,
  .feature-card:hover {
    transform: none;
    box-shadow: none;
  }
}
</style>

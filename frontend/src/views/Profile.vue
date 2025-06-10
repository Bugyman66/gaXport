<template>
  <div class="profile-page cyberpunk-bg">
    <div class="content-wrapper">
      <div class="header-section">
        <button class="back-button" @click="$router.push('/dashboard')">
          <i class="mdi mdi-chevron-left"></i>
          <span>Back to Dashboard</span>
        </button>
      </div>

      <h2 class="page-title">
        <span class="emoji">👤</span> Profile
      </h2>

      <!-- Account Management Section -->
      <div class="section">
        <div class="list-tile" @click="$router.push('/personal-details')">
          <div class="leading">
            <i class="mdi mdi-account"></i>
            <span class="emoji">👤</span>
          </div>
          <div class="title">Personal Details</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <div class="list-tile" @click="$router.push('/refer-earn')">
          <div class="leading">
            <i class="mdi mdi-gift"></i>
            <span class="emoji">🎁</span>
          </div>
          <div class="title">Refer & Earn</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <div class="list-tile" @click="$router.push('/my-team')">
          <div class="leading">
            <i class="mdi mdi-account-group"></i>
            <span class="emoji">👥</span>
          </div>
          <div class="title">My Team</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <div class="list-tile" @click="$router.push('/kyc-verification')">
          <div class="leading">
            <i class="mdi mdi-shield-account"></i>
            <span class="emoji">🔐</span>
          </div>
          <div class="title">KYC Verification</div>
          <div class="trailing">
            <span class="badge red">Unverified</span>
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <div class="list-tile" @click="$router.push('/transactions')">
          <div class="leading">
            <i class="mdi mdi-bank"></i>
            <span class="emoji">💳</span>
          </div>
          <div class="title">Transaction History</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>
      </div>

      <!-- Settings & Support Section -->
      <div class="section">
        <div class="list-tile" @click="$router.push('/security-settings')">
          <div class="leading">
            <i class="mdi mdi-cog"></i>
            <span class="emoji">⚙️</span>
          </div>
          <div class="title">Settings & Security</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <div class="list-tile" @click="$router.push('/community')">
          <div class="leading">
            <i class="mdi mdi-earth"></i>
            <span class="emoji">🌍</span>
          </div>
          <div class="title">Join Our Community</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <div class="list-tile" @click="$router.push('/terms')">
          <div class="leading">
            <i class="mdi mdi-file-document"></i>
            <span class="emoji">📜</span>
          </div>
          <div class="title">Terms & Conditions</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <div class="list-tile" @click="$router.push('/privacy')">
          <div class="leading">
            <i class="mdi mdi-lock"></i>
            <span class="emoji">🔒</span>
          </div>
          <div class="title">Privacy Policy</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <div class="list-tile" @click="$router.push('/support')">
          <div class="leading">
            <i class="mdi mdi-help-circle"></i>
            <span class="emoji">💬</span>
          </div>
          <div class="title">Support Center</div>
          <div class="trailing">
            <i class="mdi mdi-chevron-right"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile'
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 1rem;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  position: relative;
  overflow: hidden;
}

.cyberpunk-bg {
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
  position: relative;
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
  width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2.2rem;
  margin: 0.5rem 0 2rem 0;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-title .emoji {
  font-size: 2rem;
}

.section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 20px;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.section:hover {
  transform: translateY(-2px);
}

.list-tile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.3rem 0;
  position: relative;
  overflow: hidden;
}

.list-tile:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.list-tile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 243, 0.1),
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.list-tile:hover::before {
  transform: translateX(100%);
}

.leading {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(0, 255, 243, 0.1);
  border-radius: 50%;
  color: #00fff3;
  font-size: 1.4rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 255, 243, 0.3);
  overflow: hidden;
}

.leading i.mdi {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 1;
  transition: opacity 0.3s ease;
}

.leading::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, 
    rgba(0, 255, 243, 0.2) 0%,
    transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.leading::after {
  content: '';
  position: absolute;
  inset: -1px;
  background: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0%,
    rgba(0, 255, 243, 0.3) 25%,
    rgba(119, 0, 255, 0.3) 50%,
    rgba(0, 255, 243, 0.3) 75%,
    transparent 100%
  );
  border-radius: 50%;
  animation: rotate 4s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.list-tile:hover .leading::before,
.list-tile:hover .leading::after {
  opacity: 1;
}

.list-tile:hover .leading {
  background: rgba(0, 255, 243, 0.15);
  transform: scale(1.1) rotate(5deg);
  box-shadow: 
    0 0 20px rgba(0, 255, 243, 0.2),
    0 0 30px rgba(0, 255, 243, 0.1);
}

.list-tile:hover .leading i.mdi {
  opacity: 0;
}

.list-tile:hover .emoji {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.emoji {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  font-size: 1.2rem;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.title {
  flex: 1;
  margin-left: 1rem;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.trailing {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.badge.red {
  background: linear-gradient(135deg, #ff4d4d, #ff1a1a);
  box-shadow: 0 2px 10px rgba(255, 26, 26, 0.3);
}

.badge::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, 
    rgba(255, 255, 255, 0.3) 0%,
    transparent 60%);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.mdi {
  font-size: 1.4rem;
}

.mdi-chevron-right {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease;
}

.list-tile:hover .mdi-chevron-right {
  transform: translateX(3px);
  color: rgba(255, 255, 255, 0.8);
}

.header-section {
  display: flex;
  align-items: center;
  margin: 1rem 0 2.5rem 0;
  padding-top: 0.5rem;
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
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 255, 243, 0.1);
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

.back-button:active {
  transform: translateX(-2px) scale(0.98);
}

.back-button .mdi {
  font-size: 1.2rem;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 768px) {
  .content-wrapper {
    padding: 1rem 0.75rem;
  }

  .page-title {
    font-size: 1.8rem;
    margin: 0.5rem 0 1.5rem 0;
  }

  .page-title .emoji {
    font-size: 1.6rem;
  }

  .section {
    margin-bottom: 1rem;
    border-radius: 16px;
  }

  .list-tile {
    padding: 0.85rem;
    margin: 0.2rem 0;
    border-radius: 10px;
  }

  .title {
    font-size: 0.95rem;
  }

  .leading {
    width: 38px;
    height: 38px;
    font-size: 1.1rem;
  }

  .emoji {
    font-size: 1rem;
  }

  .badge {
    padding: 0.25rem 0.6rem;
    font-size: 0.7rem;
  }

  .mdi {
    font-size: 1.2rem;
  }

  .trailing {
    gap: 0.5rem;
  }

  .header-section {
    margin: 0.5rem 0 2rem 0;
  }

  .back-button {
    padding: 0.5rem 1rem;
  }
}

@media screen and (max-width: 480px) {
  .content-wrapper {
    padding: 0.75rem 0.5rem;
  }

  .page-title {
    font-size: 1.6rem;
    margin: 0.5rem 0 1.25rem 0;
  }

  .page-title .emoji {
    font-size: 1.4rem;
  }

  .list-tile {
    padding: 0.75rem;
  }

  .title {
    font-size: 0.9rem;
  }

  .leading {
    width: 34px;
    height: 34px;
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  .emoji {
    font-size: 0.9rem;
  }

  .badge {
    padding: 0.2rem 0.5rem;
    font-size: 0.65rem;
  }

  .header-section {
    margin: 0.25rem 0 1.5rem 0;
  }

  .back-button {
    padding: 0.4rem 0.9rem;
  }
}

@media (hover: none) {
  .list-tile:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.98);
  }

  .section:hover {
    transform: none;
  }

  .list-tile:hover {
    transform: none;
  }

  .list-tile:active .leading {
    transform: scale(0.95);
  }
}
</style>

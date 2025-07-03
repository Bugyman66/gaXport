<template>
  <div class="admin-dashboard cyberpunk-bg">
    <nav class="admin-nav glass-card">
      <h1>Admin Dashboard</h1>
      <div class="nav-right">
        <span>{{ admin.username }}</span>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="dashboard-content">
      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <h3>Total Users</h3>
          <p>{{ stats.totalUsers }}</p>
          <div class="stat-details">
            <span>Verified: {{ stats.userStats?.verifiedUsers || 0 }}</span>
            <span>Avg Balance: ₦{{ formatNumber(stats.userStats?.averageBalance || 0) }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <h3>Vendors</h3>
          <p>{{ stats.totalVendors }}</p>
          <div class="stat-details">
            <span>Active: {{ stats.activeVendors }}</span>
            <span>Avg Balance: ₦{{ formatNumber(stats.vendorStats?.averageBalance || 0) }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <h3>Total Top-ups</h3>
          <p>₦{{ formatNumber(stats.totalTopUps) }}</p>
          <div class="stat-details">
            <span>User Balance: ₦{{ formatNumber(stats.userStats?.totalBalance || 0) }}</span>
            <span>Vendor Balance: ₦{{ formatNumber(stats.vendorStats?.totalBalance || 0) }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <h3>Exchange Rate</h3>
          <p>$1 = ₦{{ exchangeRate }}</p>
          <button type="button" @click="showUpdateRateModal" class="update-btn">Update Rate</button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button type="button" @click="showAddVendorModal" class="action-btn add-vendor">
          <span class="icon">+</span>
          Add Vendor
        </button>
        <button type="button" @click="showUpdateRateModal" class="action-btn change-rate">
          <span class="icon">₦</span>
          Change Rate
        </button>
        <button type="button" @click="showManageVendorBalanceModal" class="action-btn manage-balance">
          <span class="icon">💰</span>
          Manage Vendor Balance
        </button>
        <button type="button" @click="exportData" class="action-btn export">
          <span class="icon">↓</span>
          Export Data
        </button>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section glass-card">
        <h2>Recent Activity</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in recentTransactions.slice(0, 5)" :key="tx._id">
                <td>{{ formatDate(tx.createdAt) }}</td>
                <td>{{ tx.email }}</td>
                <td>{{ tx.type }}</td>
                <td>₦{{ formatNumber(tx.amount) }}</td>
                <td>
                  <span :class="['status', (tx.status || 'pending').toLowerCase()]">
                    {{ tx.status || 'Pending' }}
                  </span>
                </td>
              </tr>
              <tr v-if="!recentTransactions || recentTransactions.length === 0">
                <td colspan="5" class="no-data">No recent transactions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Update Rate Modal -->
    <div v-if="showRateModal" class="modal">
      <div class="modal-content glass-card">
        <h3>Update Exchange Rate</h3>
        <div class="input-group">
          <label>New Rate (₦)</label>
          <input type="number" v-model="newRate" step="0.01" min="0">
        </div>
        <div class="modal-actions">
          <button type="button" @click.prevent="updateExchangeRate" class="confirm-btn">Update</button>
          <button type="button" @click.prevent="showRateModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
    
    <!-- Manage Vendor Balance Modal -->
    <div v-if="showVendorBalanceModal" class="modal">
      <div class="modal-content glass-card">
        <h3>Manage Vendor Balance</h3>
        
        <div v-if="step === 1">
          <!-- Step 1: Search for vendor -->
          <div class="input-group">
            <label>Vendor Email</label>
            <div class="search-input-container">
              <input 
                type="email" 
                v-model="vendorEmail" 
                placeholder="Enter vendor email"
                :disabled="isSearching"
              >
              <button 
                type="button"
                @click.prevent="searchVendor" 
                class="search-btn" 
                :disabled="!vendorEmail || isSearching"
              >
                <span v-if="isSearching">
                  <span class="loading-spinner"></span>
                </span>
                <span v-else>Search</span>
              </button>
            </div>
            <div v-if="vendorSearchError" class="error-message">
              {{ vendorSearchError }}
            </div>
          </div>
        </div>
        
        <div v-if="step === 2">
          <!-- Step 2: Vendor details and balance management -->
          <div class="vendor-details">
            <h4>Vendor Details</h4>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedVendor.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Balance:</span>
              <span class="detail-value">₦{{ formatNumber(selectedVendor.balance) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span :class="['status-indicator', selectedVendor.is_active ? 'active' : 'inactive']">
                {{ selectedVendor.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          
          <div class="balance-operations">
            <div class="operation-tabs">
              <button 
                :class="['tab-btn', operation === 'credit' ? 'active' : '']" 
                @click="operation = 'credit'"
              >
                Add Funds
              </button>
              <button 
                :class="['tab-btn', operation === 'debit' ? 'active' : '']" 
                @click="operation = 'debit'"
              >
                Deduct Funds
              </button>
            </div>
            
            <div class="input-group">
              <label>Amount (₦)</label>
              <input 
                type="number" 
                v-model="amount" 
                min="0" 
                step="0.01"
                placeholder="0.00"
              >
              <div v-if="operation === 'debit' && amount > selectedVendor.balance" class="error-message">
                Amount exceeds vendor's current balance
              </div>
            </div>
            
            <div class="input-group">
              <label>Description (Optional)</label>
              <input 
                type="text" 
                v-model="description" 
                placeholder="Reason for adjustment"
              >
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            v-if="step === 2" 
            @click.prevent="processBalanceUpdate" 
            type="button"
            class="confirm-btn"
            :disabled="isProcessing || !isValidAmount"
          >
            <span v-if="isProcessing">
              <span class="loading-spinner-small"></span>
            </span>
            <span v-else>Confirm</span>
          </button>
          <button 
            v-if="step === 2" 
            @click.prevent="step = 1" 
            type="button"
            class="back-btn"
            :disabled="isProcessing"
          >
            Back
          </button>
          <button 
            @click.prevent="closeVendorBalanceModal" 
            type="button"
            class="cancel-btn"
            :disabled="isProcessing"
          >
            {{ step === 1 ? 'Cancel' : 'Close' }}
          </button>
        </div>
        
        <div v-if="statusMessage" :class="['status-message', statusType]">
          {{ statusMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      admin: {
        username: '',
        role: ''
      },
      stats: {
        totalUsers: 0,
        totalVendors: 0,
        activeVendors: 0,
        totalTopUps: 0,
        currentRate: 1600,
        userStats: {
          totalBalance: 0,
          averageBalance: 0,
          verifiedUsers: 0
        },
        vendorStats: {
          totalBalance: 0,
          averageBalance: 0
        }
      },
      exchangeRate: 1600,
      recentUsers: [],
      recentTransactions: [],
      showRateModal: false,
      newRate: 1600,
      lastRateUpdate: null,
      updateInterval: null,
      showVendorBalanceModal: false,
      step: 1,
      vendorEmail: '',
      selectedVendor: null,
      operation: 'credit',
      amount: 0,
      description: '',
      isProcessing: false,
      isSearching: false,
      vendorSearchError: '',
      statusMessage: '',
      statusType: ''
    }
  },
  computed: {
    isValidAmount() {
      if (!this.amount || this.amount <= 0) return false;
      if (this.operation === 'debit' && this.amount > this.selectedVendor?.balance) return false;
      return true;
    }
  },
  methods: {
    async fetchDashboardData() {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          this.$router.push('/admin/login');
          return;
        }

        console.log('Fetching dashboard data...');
        const response = await fetch('https://gasfee-evw8.onrender.com/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        console.log('Dashboard data received:', data);

        // Ensure we have the stats object
        if (data && data.stats) {
          this.stats = {
            totalUsers: data.stats.totalUsers || 0,
            totalVendors: data.stats.totalVendors || 0,
            activeVendors: data.stats.activeVendors || 0,
            totalTopUps: data.stats.totalTopUps || 0,
            currentRate: data.stats.currentRate || 1600,
            userStats: {
              totalBalance: data.stats.userStats?.totalBalance || 0,
              averageBalance: data.stats.userStats?.averageBalance || 0,
              verifiedUsers: data.stats.userStats?.verifiedUsers || 0
            },
            vendorStats: {
              totalBalance: data.stats.vendorStats?.totalBalance || 0,
              averageBalance: data.stats.vendorStats?.averageBalance || 0
            }
          };
        }

        this.exchangeRate = data.stats?.currentRate || 1600;
        this.recentUsers = data.recentUsers || [];
        this.recentTransactions = data.recentTransactions || [];
        this.lastRateUpdate = data.lastRateUpdate;

        console.log('Updated stats:', this.stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.message.includes('jwt') || error.message.includes('token')) {
          localStorage.removeItem('admin_token');
          this.$router.push('/admin/login');
        }
      }
    },

    async updateExchangeRate() {
      if (!this.newRate || this.newRate <= 0) {
        alert('Please enter a valid rate');
        return;
      }

      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('https://gasfee-evw8.onrender.com/api/admin/update-rate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rate: parseFloat(this.newRate) })
        });

        const data = await response.json();
        if (response.ok) {
          this.stats.currentRate = parseFloat(this.newRate);
          this.exchangeRate = parseFloat(this.newRate);
          this.lastRateUpdate = data.lastUpdate;
          this.showRateModal = false;
          await this.fetchDashboardData();
          alert('Exchange rate updated successfully');
        } else {
          throw new Error(data.message || 'Failed to update rate');
        }
      } catch (error) {
        console.error('Error updating rate:', error);
        alert('Failed to update exchange rate: ' + error.message);
      }
    },

    showUpdateRateModal() {
      this.showRateModal = true;
      this.newRate = this.exchangeRate;
    },

    formatNumber(num) {
      return new Intl.NumberFormat().format(num || 0);
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    },

    showAddVendorModal() {
      this.$router.push('/admin/add-vendor');
    },

    async fetchExportData() {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('https://gasfee-evw8.onrender.com/api/admin/export-data', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch export data');
        }

        return await response.json();
      } catch (error) {
        console.error('Error fetching export data:', error);
        alert('Failed to export data: ' + error.message);
        return null;
      }
    },

    downloadCSV(data) {
      if (!data) return;
      
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers
      const headers = Object.keys(data.users[0] || {}).join(",");
      csvContent += headers + "\r\n";
      
      // Add user data
      data.users.forEach(user => {
        const row = Object.values(user).map(value => {
          // Handle values with commas by wrapping in quotes
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(",");
        csvContent += row + "\r\n";
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
    },

    async exportData() {
      try {
        const data = await this.fetchExportData();
        if (data) {
          this.downloadCSV(data);
        }
      } catch (error) {
        console.error('Error exporting data:', error);
        alert('Failed to export data: ' + error.message);
      }
    },

    logout() {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_role');
      this.$router.push('/admin/login');
    },

    async searchVendor() {
      if (!this.vendorEmail) {
        this.vendorSearchError = 'Please enter a vendor email';
        return;
      }

      this.isSearching = true;
      this.vendorSearchError = '';

      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          this.vendorSearchError = 'Admin session expired. Please log in again.';
          this.$router.push('/admin/login');
          return;
        }

        console.log('Using token:', token); // Debug log
        
        const response = await fetch(`https://gasfee-evw8.onrender.com/api/admin/vendor/${this.vendorEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Vendor not found');
        }

        const data = await response.json();
        this.selectedVendor = data.vendor;
        this.step = 2;
      } catch (error) {
        console.error('Error searching vendor:', error);
        this.vendorSearchError = error.message;
        
        // Check if the error is related to authentication
        if (error.message.includes('authenticate') || error.message.includes('token')) {
          localStorage.removeItem('admin_token');
          this.$router.push('/admin/login');
        }
      } finally {
        this.isSearching = false;
      }
    },

    closeVendorBalanceModal() {
      this.showVendorBalanceModal = false;
      this.step = 1;
      this.vendorEmail = '';
      this.selectedVendor = null;
      this.operation = 'credit';
      this.amount = 0;
      this.description = '';
      this.statusMessage = '';
      this.vendorSearchError = '';
    },

    async processBalanceUpdate() {
      if (!this.isValidAmount) {
        this.statusMessage = 'Please enter a valid amount';
        this.statusType = 'error';
        return;
      }

      this.isProcessing = true;
      this.statusMessage = '';

      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch('https://gasfee-evw8.onrender.com/api/admin/update-vendor-balance', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.selectedVendor.email,
            amount: this.operation === 'credit' ? parseFloat(this.amount) : -parseFloat(this.amount),
            description: this.description
          })
        });

        const data = await response.json();
        if (response.ok) {
          this.statusMessage = 'Vendor balance updated successfully';
          this.statusType = 'success';
          this.selectedVendor = data.vendor;
          this.amount = 0;
          this.description = '';
          // Refresh dashboard data to update stats
          await this.fetchDashboardData();
        } else {
          throw new Error(data.message || 'Failed to update balance');
        }
      } catch (error) {
        console.error('Error updating balance:', error);
        this.statusMessage = error.message;
        this.statusType = 'error';
      } finally {
        this.isProcessing = false;
      }
    },

    showManageVendorBalanceModal() {
      this.showVendorBalanceModal = true;
      this.step = 1;
      this.vendorEmail = '';
      this.selectedVendor = null;
      this.operation = 'credit';
      this.amount = 0;
      this.description = '';
    },
  },
  mounted() {
    const adminInfo = localStorage.getItem('admin_info');
    if (adminInfo) {
      this.admin = JSON.parse(adminInfo);
    }
    this.fetchDashboardData();
    // Update dashboard data every 30 seconds
    this.updateInterval = setInterval(this.fetchDashboardData, 30000);
  },
  beforeDestroy() {
    // Clear the interval when component is destroyed
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
  color: #fff;
  padding: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 12px;
}

.admin-nav {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.stat-card h3 {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-card p {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.trend {
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.trend.up { color: #00ffa3; }
.trend.down { color: #ff4d4d; }

.quick-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(0, 255, 243, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.2);
}

.action-btn:hover {
  transform: translateY(-2px);
  background: rgba(0, 255, 243, 0.2);
}

.action-btn .icon {
  font-size: 1.2rem;
}

.activity-section {
  padding: 1.5rem;
}

.activity-section h2 {
  margin-bottom: 1rem;
  color: #fff;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
  background: rgba(0, 255, 243, 0.1);
  color: #00fff3;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.status.completed { background: rgba(0, 255, 163, 0.2); color: #00ffa3; }
.status.pending { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
.status.failed { background: rgba(255, 77, 77, 0.2); color: #ff4d4d; }

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  padding: 2rem;
  min-width: 300px;
}

.input-group {
  margin: 1rem 0;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.input-group input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 243, 0.2);
  border-radius: 8px;
  color: #fff;
}

.search-input-container {
  display: flex;
  gap: 0.5rem;
}

.search-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  color: #fff;
  white-space: nowrap;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vendor-details {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 243, 0.1);
}

.vendor-details h4 {
  margin-bottom: 1rem;
  color: #00fff3;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: rgba(255, 255, 255, 0.7);
}

.detail-value {
  font-weight: bold;
  color: #fff;
}

.status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.status-indicator.active {
  background: rgba(0, 255, 163, 0.2);
  color: #00ffa3;
}

.status-indicator.inactive {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

.operation-tabs {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  flex: 1;
}

.tab-btn.active {
  background: linear-gradient(90deg, #00fff3, #7700ff);
  transform: scale(1.05);
}

.balance-operations {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 243, 0.1);
}

.error-message {
  color: #ff4d4d;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.status-message {
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.status-message.success {
  background: rgba(0, 255, 163, 0.2);
  color: #00ffa3;
}

.status-message.error {
  background: rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

.back-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.confirm-btn, .cancel-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn {
  background: linear-gradient(90deg, #00fff3, #7700ff);
  color: #fff;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.loading-spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid rgba(0, 255, 243, 0.8);
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-left: 0.5rem;
}

.loading-spinner-small {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid rgba(0, 255, 243, 0.8);
  border-radius: 50%;
  width: 0.8rem;
  height: 0.8rem;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-left: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media screen and (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

.stat-details {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-details span {
  display: block;
}

.update-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.update-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 243, 0.2);
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
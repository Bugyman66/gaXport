<template>
  <div class="transaction-history cyberpunk-bg">
    <div class="content-wrapper">
      <!-- Update back button to go to dashboard -->
      <button @click="$router.push('/dashboard')" class="back-btn">
        <span class="back-icon">←</span>
        <span class="back-text">Back to Dashboard</span>
      </button>

      <h2 class="section-title">Transaction History</h2>

      <div class="table-container glass-panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Crypto</th>
              <th>Amount</th>
              <th>Wallet</th>
              <th>Transaction Hash</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedTransactions.length === 0">
              <td colspan="5" class="empty-state">
                No transactions found
              </td>
            </tr>
            <tr v-for="tx in paginatedTransactions" :key="tx.id" class="transaction-row">
              <td>{{ formatDate(tx.created_at) }}</td>
              <td>{{ tx.crypto_type }}</td>
              <td>{{ tx.amount }}</td>
              <td class="wallet-cell">{{ tx.wallet_address }}</td>
              <td>
                <a :href="getExplorerLink(tx.transaction_hash, tx.crypto_type)" 
                   target="_blank" 
                   class="hash-link">
                  {{ tx.transaction_hash.slice(0, 10) }}...
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination-controls">
        <button @click="prevPage" 
                :disabled="currentPage === 1"
                class="nav-btn">
          Previous
        </button>

        <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>

        <button @click="nextPage" 
                :disabled="currentPage === totalPages"
                class="nav-btn">
          Next
        </button>
      </div>

      <button @click="downloadCSV" class="download-btn">
        <span class="btn-icon">⬇</span>
        Download CSV
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'TransactionHistory',
  data() {
    return {
      transactions: [],
      currentPage: 1,
      itemsPerPage: 7,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.transactions.length / this.itemsPerPage);
    },
    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.transactions.slice(start, start + this.itemsPerPage);
    }
  },
  methods: {
    async fetchTransactions() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Update the API endpoint to match your backend route
        const res = await axios.get("https://gasfee-evw8.onrender.com/api/transaction-history", {
          headers: { Authorization: `Bearer ${token}` },
          params: { email: localStorage.getItem('email') }
        });

        if (res.data && Array.isArray(res.data.transactions)) {
          this.transactions = res.data.transactions;
        } else if (Array.isArray(res.data)) {
          this.transactions = res.data;
        } else {
          console.error("Unexpected response format:", res.data);
          this.transactions = [];
        }
      } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        this.transactions = [];
      }
    },

    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return isNaN(date)
        ? "Invalid date"
        : date.toISOString().replace("T", " ").slice(0, 19);
    },

    getExplorerLink(hash, crypto) {
      const explorers = {
        ethereum: `https://etherscan.io/tx/${hash}`,
        solana: `https://solscan.io/tx/${hash}`,
        tron: `https://tronscan.org/#/transaction/${hash}`,
        binancecoin: `https://bscscan.com/tx/${hash}`,
        polygon_amoy: `https://amoy.polygonscan.com/tx/${hash}`, 
      };
      return explorers[crypto] || "#";
    },

    downloadCSV() {
      if (this.transactions.length === 0) {
        alert("No transactions to download.");
        return;
      }

      let csvContent = "Date,Crypto,Amount,Wallet,Transaction Hash\n";

      this.transactions.forEach((tx) => {
        const formattedDate = this.formatDate(tx.created_at);
        csvContent += `"${formattedDate}","${tx.crypto_type}","${tx.amount}","${tx.wallet_address}","${tx.transaction_hash}"\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  },
  mounted() {
    this.fetchTransactions();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400&family=Space+Grotesk:wght@300;400&display=swap');

.transaction-history {
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
}

.cyberpunk-bg {
  background: linear-gradient(125deg, #1a0b2e 0%, #1f1135 40%, #0a1a3f 100%);
  position: relative;
  overflow-x: hidden;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 200;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
}

.glass-panel {
  background: rgba(13, 17, 38, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(89, 195, 255, 0.2);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 
    0 8px 32px rgba(9, 14, 44, 0.7),
    0 0 50px rgba(0, 255, 243, 0.2);
  overflow: auto;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background: rgba(0, 255, 243, 0.1);
  padding: 1rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  text-align: left;
  color: #00fff3;
  border-bottom: 1px solid rgba(0, 255, 243, 0.2);
}

td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.transaction-row {
  transition: all 0.3s ease;
}

.transaction-row:hover {
  background: rgba(0, 255, 243, 0.05);
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 2rem;
}

.wallet-cell {
  font-family: 'Space Grotesk', monospace;
  color: rgba(255, 255, 255, 0.7);
}

.hash-link {
  color: #00fff3;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.hash-link:hover {
  color: #7700ff;
  text-shadow: 0 0 10px rgba(0, 255, 243, 0.5);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin: 2rem 0;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 243, 0.3);
  color: #fff;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 255, 243, 0.1);
  transform: translateY(-2px);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-family: 'Space Grotesk', sans-serif;
  color: rgba(255, 255, 255, 0.7);
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto;
  padding: 1rem 2rem;
  background: linear-gradient(90deg, #00fff3, #7700ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 243, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
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
  .transaction-history {
    padding: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .glass-panel {
    padding: 1rem;
    border-radius: 16px;
  }

  table {
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.8rem;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-btn {
    width: 100%;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
  }

  .back-btn {
    top: 1rem;
    left: 1rem;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>

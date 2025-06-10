<template>
  <div>
    <h2>📈 Live Crypto Prices</h2>
    <table>
      <thead>
        <tr>
          <th>Coin</th>
          <th>Price (USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(price, coin) in prices" :key="coin">
          <td>{{ coin.toUpperCase() }}</td>
          <td>${{ price.toFixed(4) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      prices: {}, // Store real-time prices
      socket: null, // WebSocket connection
      coins: ["ethereum", "solana", "tron", "sui", "base"], // Add more chains here
    };
  },
  methods: {
    connectWebSocket() {
      this.socket = new WebSocket("wss://stream.coingecko.com/price/v1");

      this.socket.onopen = () => {
        console.log("✅ WebSocket connected");
        
        // Subscribe to real-time price updates
        this.socket.send(
          JSON.stringify({
            type: "subscribe",
            channels: [
              {
                name: "ticker",
                symbols: this.coins.map((coin) => `coingecko:${coin}/usd`),
              },
            ],
          })
        );
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "ticker") {
          const coin = data.symbol.split(":")[1].split("/")[0]; // Extract coin name
          this.$set(this.prices, coin, data.price);
        }
      };

      this.socket.onclose = () => {
        console.log("❌ WebSocket disconnected. Reconnecting...");
        setTimeout(this.connectWebSocket, 3000); // Auto-reconnect
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };
    },
  },
  mounted() {
    this.connectWebSocket();
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.close();
    }
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}
th {
  background-color: #4caf50;
  color: white;
}
</style>

<template>
  <div class="reset-password-container">
    <div class="reset-password-box">
      <h2>Reset Password</h2>
      <form @submit.prevent="resetPassword">
        <input v-model="newPassword" type="password" placeholder="Enter new password" required />
        <button type="submit">Reset Password</button>
      </form>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      newPassword: "",
      message: "",
      token: this.$route.query.token, // Get token from URL
    };
  },
  methods: {
    async resetPassword() {
      try {
        const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
          token: this.token,
          newPassword: this.newPassword,
        });
        this.message = response.data.message;
      } catch (error) {
        this.message = "Error resetting password. Try again.";
      }
    },
  },
};
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
}

.reset-password-box {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

h2 {
  margin-bottom: 20px;
  color: white;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: none;
  border-radius: 5px;
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.message {
  margin-top: 10px;
  color: yellow;
}
</style>

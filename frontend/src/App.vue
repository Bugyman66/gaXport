<template>
  <div>
    <router-view />
  </div> 
</template>

<script>
export default {
  data() {
    return {
      isAuthenticated: false, // Track if user is logged in
    };
  },
  methods: {
    checkAuth() {
      // Check if token exists in localStorage
      this.isAuthenticated = !!localStorage.getItem("token");
    },
    logout() {
      // Remove token and redirect to login
      localStorage.removeItem("token");
      this.isAuthenticated = false;
      this.$router.push("/login");
    },
  },
  mounted() {
    this.checkAuth(); // Check auth when app loads
  },
  watch: {
    // Watch for route changes and check auth status
    $route() {
      this.checkAuth();
    },
  },
};
</script>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
</style>

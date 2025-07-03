<template>
  <div class="profile-page cyberpunk-bg">
    <div class="content-wrapper">
      <div class="header-section">
        <button class="back-button" @click="$router.push('/profile')">
          <i class="mdi mdi-chevron-left"></i>
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Terms',
};
</script>

<style scoped>
/* Add your styles here */
</style>
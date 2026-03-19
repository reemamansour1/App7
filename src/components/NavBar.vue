<script setup>
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <nav class="navbar">
    <div class="nav-links">
      <RouterLink v-if="route.path === '/' || route.path === '/signin'" to="/create-account">Create Account</RouterLink>
      <RouterLink v-if="route.path === '/' || route.path === '/create-account'" to="/signin">Sign In</RouterLink>
      <RouterLink v-if="route.path.startsWith('/home')" to="/">Sign Out</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 32px;
  background-color: #eaeaea;
  border-bottom: 1px solid #025269;
  box-shadow: 0 4px 9px rgba(0,0,0,0.08);
}

.nav-links {
  display: flex;
  gap: 10px;
}
.nav-links a {
  text-decoration: none;
  color: #025269;
  font-weight: 500;
  font-size: 15px;
  padding: 8px 20px;
  font-family: Georgia, 'Times New Roman', Times, serif;
  transition: all 0.2s;
}

.nav-links a:hover {
  text-decoration: underline;
}
</style>

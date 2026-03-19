<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="landing">
    <NavBar />
    <main>
      <h4>Welcome to the AIG official website!</h4>
      <img src="/ahlia.jpg" alt="Ahlia Insurance" class="logo" />
    </main>
  </div>
</template>

<style scoped>
.landing {
  height: 100vh;
  background-color: #f6f6f6;
}

main {
  display: flex;
  flex-direction: column;
  gap:30px;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 70px);
}
h4{
  font-family: Georgia, 'Times New Roman', Times, serif;
  color: #025269;
  font-weight: 500;
}

.logo {
  width: 350px;
  height: 350px;
}
</style>

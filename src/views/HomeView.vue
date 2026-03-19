<script setup>
import { onBeforeRouteLeave } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'
import NavBar from '@/components/NavBar.vue'
import SideBar from '@/components/SideBar.vue'
import ChatSection from '@/components/ChatSection.vue'

const store = useAppStore()

onBeforeRouteLeave((to) => {
  if (to.path.startsWith('/home')) return true
  const confirmed = window.confirm('Are you sure you want to sign out?')
  if (!confirmed) return false
  store.signOut()
  return true
})
</script>

<template>
  <div class="home">
    <NavBar />
    <div class="content">
      <SideBar />
      <ChatSection />
    </div>
  </div>
</template>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f6f6f6;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>

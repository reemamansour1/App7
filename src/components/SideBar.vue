<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const addInput = ref('')
const addError = ref('')
const addSuccess = ref('')

function addFriend() {
  addError.value = ''
  addSuccess.value = ''
  const result = store.sendFriendReq(addInput.value.trim())
  if (!result.success) {
    addError.value = result.error
  } else {
    addSuccess.value = `Request sent!`
    addInput.value = ''
  }
}
</script>


<template>
  <div class="sidebar">

    <div class = "user-section">
    <p>👤 {{ store.currUsername }}</p>
    </div>

    <div class="section">
      <h3>Friends</h3>
      <ul>
        <li
          v-for="friend in store.friends"
          :key="friend"
          :class="{ active: route.params.friend === friend }"
          @click="router.push(`/home/${friend}`)"
        >
          {{ friend }}
        </li>
        <li v-if="store.friends.length === 0" class="empty">No friends yet</li>
      </ul>
    </div>


  <div class="section">
  <h3>Friend Requests</h3>
  <ul>
    <li v-for="req in store.currentUser?.incomingFQ" :key="req" class="request-item">
      <span>{{ req }}</span>
      <div>
        <button @click="store.acceptFQ(req)">Accept</button>
        <button @click="store.rejectFQ(req)">Reject</button>
      </div>
    </li>
  </ul>
  <ul>
    <li v-for="req in store.currentUser?.outgoingFQ" :key="req" class="pending">
      {{ req }} <span class="tag">(pending)</span>
    </li>
  </ul>
</div>



    <div class="section">
      <h3>Add Friend</h3>
      <div class="add-row">
        <input v-model="addInput" placeholder="Username" @keyup.enter="addFriend" />
        <button @click="addFriend">Add</button>
      </div>
      <p v-if="addError" class="error">{{ addError }}</p>
      <p v-if="addSuccess" class="success">{{ addSuccess }}</p>
    </div>


  </div>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100%;
  background: #f6f6f6;
  border-right: 2px solid #025269;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 90px;
  padding: 16px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.section h3 {
  color: #025269;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  font-weight: 500;
  text-decoration: underline;
}

ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

li {
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.15s;
}

li:hover { background: #d6eaea; }
li.active { background: #025269; color: white; }

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.request-item button {
  padding: 4px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  margin-left: 4px;
  background: #025269;
  color: white;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.pending { cursor: default; opacity: 0.6; }
.tag { font-size: 11px; color: #888; margin-left: 6px; }
.add-row { display: flex; gap: 8px; }
.add-row input {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 13px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.add-row input:focus {
  outline: none;
  border-color: #025269;
}
.add-row button {
  padding: 7px 14px;
  background: #025269;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.error { color: red; font-size: 12px; margin-top: 4px; }
.success { color: green; font-size: 12px; margin-top: 4px; }
.empty { color: #888; font-style: italic; }
.user-section {
  color: #025269;
  font-size: 13px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 500;
}
</style>

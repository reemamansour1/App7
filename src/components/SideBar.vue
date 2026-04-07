<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const info = ref(null)
const friendRequests = ref([])
const addInput = ref('')
const addError = ref('')
const addSuccess = ref('')

onMounted(async () => {
  info.value = await store.getUserInfo()
  friendRequests.value = await store.getFriendRequests()
  console.log("User Information: ", info.value)
})

// incomingRequests is a cleaner version, no DUPLICATES, in our backend, we can have duplicates in the requests array.
// Deduplicate incoming requests: The API return multiple requests from the same user (if the user does so).
// This filter only keeps a request if its index is the FIRST occurrence of that username in the array.
const incomingRequests = computed(() => {
  return friendRequests.value.filter((curr, i, arr) =>
    i === arr.findIndex(r => r.sender.username === curr.sender.username)
  )
})

async function addFriend() {
  addError.value = ''; addSuccess.value = '';
  const username = addInput.value.trim();
  // edge cases:

  // 1- no empty username
  if (!username) return (addError.value = 'Enter a username');

  //2- cant add yourself
  if (username === store.currUsername) return (addError.value = 'You cannot add yourself!');

  // 3- check if user is a friend
  if (info.value?.friends?.some(f => f.username === username)) {
    return (addError.value = `You are already friends with ${username}`);
  }
  // 4- check if they ALREADY sent a FQ
  if (incomingRequests.value.some(req => req.sender.username === username)) {
    return (addError.value = `${username} already sent you a request!`);
  }

  const response = await store.findUsers(username);
  // response is going to return the object that has the user id, _id, NOT id
  const targetUser = response.find(u => u.username === username);
  if (!targetUser) return (addError.value = 'User not found');

  const result = await store.sendFriendRequest(targetUser._id);

  if (!result.success) {
    addError.value = result.error;
  } else {
    addSuccess.value = 'Request sent!';
    addInput.value = '';
    // Refresh list so the UI knows we did something
    friendRequests.value = await store.getFriendRequests();
  }
}
async function acceptDeclineFQ(requestId, accept) {
  const result = await store.acceptDeclineFriendRequest(requestId, accept)
  if (!result.success) {
    console.log('Failed to accept/decline a friend request')
    return
  }
  // refresh everything from API
  info.value = await store.getUserInfo()
  friendRequests.value = info.value?.requests || []
}

async function removeFriendHandler(userId) {
  const result = await store.removeFriend(userId)
  if (result.success) {
    info.value = await store.getUserInfo()
  }
}
</script>

<template>
  <div class="sidebar">

    <!-- User info -->
    <div class="user-section">
      <p>👤 {{ store.currUsername }}</p>
      <p class="email">{{ info?.email }}</p>
    </div>

    <!-- Friends list -->
    <div class="section">
      <h3>Friends</h3>
      <ul>
        <li
          v-for="friend in info?.friends || []"
          :key="friend.userId"
          class="friend-item"
          :class="{ active: route.params.friend === friend.username }"
        >
        <span @click="() => { console.log(friend.username, ' is being clicked'); router.push(`/home/${friend.username}`) }">{{ friend.username }}</span>
          <button class="remove-btn" @click="removeFriendHandler(friend.userId)">✕</button>
        </li>
        <li v-if="!(info?.friends?.length)" class="empty">No friends yet</li>
      </ul>
    </div>

    <!-- Friend requests -->
    <div class="section">
      <h3>Friend Requests</h3>
      <ul>
        <li v-for="req in incomingRequests" :key="req._id" class="request-item">
          <span>{{ req.sender.username }}</span>
          <div>
            <button @click="acceptDeclineFQ(req._id, true)">Accept</button>
            <button @click="acceptDeclineFQ(req._id, false)">Decline</button>
          </div>
        </li>
        <li v-if="!incomingRequests.length" class="empty">No incoming requests</li>
      </ul>
    </div>

    <!-- Add friend -->
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
  gap: 50px;
  padding: 16px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.email{
  color: #025269;
  font-size: 12px;
  text-transform: lowercase;

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

.friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remove-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

}

.remove-btn:hover {
  background: #e61111;
  color: white;
}

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
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);

}

.request-item button:hover { background: #2a8f8f; }

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
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);

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

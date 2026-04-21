<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'

const store = useAppStore()
const router = useRouter()
const route = useRoute()


const showProfile = ref(false)

const info = ref(null)
const friendRequests = ref([])

const addInput = ref('')
const addError = ref('')
const addSuccess = ref('')

const showCreateChat = ref(false)
const newChatName = ref('')
const createChatError = ref('')

// chat invites
const chatInvites = computed(() => {
  return (info.value?.requests || []).filter(req => req.kind === 'ChatInvite')
})


// incoming friend requests
const incomingRequests = computed(() => {
  const friendReqs = friendRequests.value.filter(req => req.kind !== 'ChatInvite')
  return friendReqs.filter((curr, i, requests) =>
    i === requests.findIndex(r => r.sender.username === curr.sender.username)
  )
})

onMounted(async () => {
  info.value = await store.getUserInfo()
  friendRequests.value = await store.getFriendRequests()
  await store.loadChatSessions()
})

async function addFriend() {
  addError.value = '';
  addSuccess.value = '';
  const username = addInput.value.trim();
  if (!username) return (addError.value = 'Enter a username');
  if (username === store.currUsername) return (addError.value = 'You cannot add yourself!');
  if (info.value?.friends?.some(f => f.username === username))
    return (addError.value = `You are already friends with ${username}`);
  if (incomingRequests.value.some(req => req.sender.username === username))
    return (addError.value = `${username} already sent you a request!`);

  const response = await store.findUsers(username);
  const targetUser = response.find(u => u.username === username);
  if (!targetUser) return (addError.value = 'User not found');

  const result = await store.sendFriendRequest(targetUser._id);
  if (!result.success) {
    addError.value = result.error;
  } else {
    addSuccess.value = 'Request sent!';
    addInput.value = '';
    friendRequests.value = await store.getFriendRequests();
  }
}

async function acceptDeclineFQ(requestId, accept) {
  const result = await store.acceptDeclineFriendRequest(requestId, accept)
  if (!result.success) {
    console.log('Failed to accept/decline a friend request')
    return
  }
  info.value = await store.getUserInfo()
  friendRequests.value = info.value?.requests || []
}

async function removeFriendHandler(userId) {
  const result = await store.removeFriend(userId)
  if (result.success) {
    info.value = await store.getUserInfo()
  }
}


// have to call await store.loadChatSessions() to update the chat

async function handleCreateChat() {
  createChatError.value = ''
  if (!newChatName.value.trim()) {
    createChatError.value = 'Enter a chat name'
    return
  }
  const result = await store.createChat('group', newChatName.value.trim())
  if (!result.success) {
    createChatError.value = 'Could not create chat'
    return
  }
  newChatName.value = ''
  showCreateChat.value = false
  await store.loadChatSessions()
}

async function acceptDeclineChatInvite(requestId, chatId, accept) {
  const result = await store.acceptDeclineChatInvite(chatId, requestId, accept)
  if (!result.success) {
    console.log('Failed to accept/decline chat invite')
    return
  }
  info.value = await store.getUserInfo()
  await store.loadChatSessions()
}
</script>

<template>
  <div>

    <!-- user profile section -->
    <div v-if="showProfile" class="modal-overlay" @click="showProfile = false">
      <div class="modal-box">
        <button class="close-btn" @click="showProfile = false">✕</button>
        <div class="profile-avatar">{{ info?.firstName?.[0] }}{{ info?.lastName?.[0] }}</div>
        <h2 class="profile-name">{{ info?.firstName }} {{ info?.lastName }}</h2>
        <p class="profile-detail">Username: {{ info?.username }}</p>
        <p class="profile-detail">Email: {{ info?.email }}</p>
      </div>
    </div>


    <div class="sidebar">

      <!-- username -->
      <div class="user-section">
        <button class="profile-btn" @click="showProfile = true">👤 {{ store.currUsername }}</button>
      </div>

      <!-- friends list -->
      <div class="section">
        <h3>Friends</h3>
        <ul>
          <li
            v-for="friend in info?.friends || []"
            :key="friend.userId"
            class="friend-item"
          >
            <span>{{ friend.username }}</span>
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
              <button class = "accept-btn" @click="acceptDeclineFQ(req._id, true)">✓</button>
              <button class = "decline-btn" @click="acceptDeclineFQ(req._id, false)">✕</button>
            </div>
          </li>
          <li v-if="!incomingRequests.length" class="empty">No incoming requests yet</li>
        </ul>
      </div>

      <!-- add friend section -->
      <div class="section">
        <h3>Add Friend</h3>
        <div class="add-row">
          <input v-model="addInput" placeholder="Username" @keyup.enter="addFriend" />
          <button class = "add-btn" @click="addFriend">Add</button>
        </div>
        <p v-if="addError" class="error">{{ addError }}</p>
        <p v-if="addSuccess" class="success">{{ addSuccess }}</p>
      </div>

      <!-- chat invitations section -->
      <div class="section" v-if="chatInvites.length">
        <h3>Chat Invitations</h3>
        <ul>
          <li v-for="invite in chatInvites" :key="invite._id" class="request-item">
            <span>{{ invite.chat.name }}</span>
            <div>
              <button class = "accept-btn" @click="acceptDeclineChatInvite(invite._id, invite.chat.chatId, true)">✓</button>
              <button class = "decline-btn" @click="acceptDeclineChatInvite(invite._id, invite.chat.chatId, false)">✕</button>
            </div>
          </li>
        </ul>
      </div>

      <!-- group chats -->
      <div class="section">
        <h3>Group Chats</h3>
        <ul>
          <li
            v-for="chat in store.chatSessions"
            :key="chat._id"
            class="list-item"
            :class="{ active: route.params.chatId === chat._id }"
            @click="router.push(`/home/chat/${chat._id}`)"
          >
            {{ chat.group_name }}
          </li>
          <li v-if="!store.chatSessions.length" class="empty">No chats yet</li>
        </ul>

        <div v-if="!showCreateChat">
          <button class="create-btn" @click="showCreateChat = true">+ New Chat</button>
        </div>
        <div v-else class="create-form">
          <input v-model="newChatName" placeholder="Chat name" @keyup.enter="handleCreateChat" />
          <div class="create-actions">
            <button @click="handleCreateChat">Create</button>
            <button class="cancel-btn" @click="showCreateChat = false">Cancel</button>
          </div>
          <p v-if="createChatError" class="error">{{ createChatError }}</p>
        </div>
      </div>

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
  gap: 25px;
  padding: 16px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.profile-btn {
  background: none;
  border: none;
  color: #025269;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0;
}

.profile-btn:hover { text-decoration: underline; }

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

.decline-btn:hover {
  background: #e61111;
}
.accept-btn:hover{
  background-color: green;
}
.remove-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
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
  box-shadow: 0 5px 5px rgba(0,0,0,0.2);
}
.add-btn:hover{
  background-color: #2a8f8f;
}
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
  box-shadow: 0 5px 5px rgba(0,0,0,0.2);
}

.error { color: red; font-size: 12px; margin-top: 4px; }
.success { color: green; font-size: 12px; margin-top: 4px; }
.empty { color: #888; font-style: italic; }

.user-section { margin-bottom: 8px; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-box {
  background: white;
  border-radius: 14px;
  padding: 32px;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.close-btn {
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #888;
}

.close-btn:hover { color: #025269; }

.profile-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #025269;
  color: white;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.profile-name {
  font-size: 18px;
  color: #025269;
  font-weight: 500;
  margin: 0;
}

.profile-detail {
  font-size: 13px;
  color: #555;
}

.create-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #025269;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.create-btn:hover { background: #2a8f8f; }

.create-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.create-form input {
  padding: 7px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 13px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.create-form input:focus {
  outline: none;
  border-color: #025269;
}

.create-actions {
  display: flex;
  gap: 6px;
}

.create-actions button {
  flex: 1;
  padding: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
  background: #025269;
  color: white;
}

.cancel-btn { background: #888 !important; }
</style>

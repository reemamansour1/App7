<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const messages = ref([])
const newMessage = ref('')
const chatInfo = ref(null)
const inviteInput = ref('')
const inviteError = ref('')
const inviteSuccess = ref('')
const showInvitePopup = ref(false)

// reads chatId from the url
const chatId = computed(() => route.params.chatId ?? null)

// maps sender id to username using chatInfo.users
function getSenderUsername(senderId) {
  const user = chatInfo.value?.users?.find(u => u.user_id === senderId)
  return user ? user.username : 'Left the chat'
}

//  avatar circle purpose
function getSenderInitials(senderId) {
  const username = getSenderUsername(senderId)
  return username[0]?.toUpperCase() || '?'
}

let pollInterval = null
// runs when chatId changes --- rmansour clicking different chat

watch(chatId, async (newChatId) => {
  if (pollInterval) clearInterval(pollInterval)
  if (!newChatId) return
  inviteError.value = ''
  inviteSuccess.value = ''
  newMessage.value = ''
  showInvitePopup.value = false

  const result = await store.getChatInfo(newChatId)
  if (result.success) chatInfo.value = result.data
  messages.value = await store.getChatMessages(newChatId)

  // refetch every 2 sec
  pollInterval = setInterval(async () => {
    const result = await store.getChatInfo(newChatId)
    if (result.success) chatInfo.value = result.data
    messages.value = await store.getChatMessages(newChatId)
  }, 2000)
}, { immediate: true })

async function sendMessage() {
  if (!newMessage.value.trim() || !chatId.value) return
  const text = newMessage.value.trim()
  newMessage.value = '' // clear input
  const result = await store.sendChatMessage(chatId.value, text)
  if (result.success) {
    messages.value.push(result.data) // push new msg instantly, no refetch needed. I return {success : true, data} in appStore.js
  }
}

async function handleLeaveChat() {
  const confirmed = window.confirm('Are you sure you want to leave this chat?')
  if (!confirmed) return
  const result = await store.leaveChat(chatId.value)
  if (result.success) {
    chatInfo.value = null
    messages.value = []
    await store.loadChatSessions() // refresh sidebar chat list
    router.push('/home')
  }
}

async function handleInviteUser() {
  inviteError.value = ''
  inviteSuccess.value = ''
  const username = inviteInput.value.trim()
  if (!username) return (inviteError.value = 'Enter a username')

  // need _id not username, so search first
  const users = await store.findUsers(username)
  const targetUser = users.find(u => u.username === username)
  if (!targetUser) return (inviteError.value = 'User not found')

  const result = await store.inviteUsertoChat(chatId.value, targetUser._id)
  if (!result.success) {
    inviteError.value = result.error || 'Could not invite user'
  } else {
    inviteSuccess.value = `${username} invited!`
    inviteInput.value = ''
  }
}
</script>

<template>
  <div class="chat">

    <div v-if="!chatId" class="empty-state">
      <p>Select a group chat to start messaging</p>
    </div>

    <template v-else>

      <!-- Header -->
      <div class="chat-header">
        <div class="header-left">
          <h3>{{ chatInfo?.group_name || 'Loading..' }}</h3>
          <span class="members-count">{{ chatInfo?.users?.length || 0 }} members</span>
          <div class="members-bar">
            <span
              v-for="user in chatInfo?.users || []"
              :key="user.user_id"
              class="member-chip"
            >
              <span class="member-initial">{{ user.username[0]?.toUpperCase() }}</span>
              {{ user.username }}
            </span>
          </div>
        </div>

        <div class="header-actions">
          <!-- Invite popup -->
          <div class="invite-wrapper">
            <button class="invite-btn" @click="showInvitePopup = !showInvitePopup" title="Invite user">+</button>
            <div v-if="showInvitePopup" class="invite-popup" @click.self="showInvitePopup = false">
              <p class="popup-title">Invite to chat</p>
              <div class="invite-row">
                <input
                  v-model="inviteInput"
                  placeholder="Username..."
                  @keyup.enter="handleInviteUser"
                  autofocus
                />
                <button @click="handleInviteUser">+</button>
              </div>
              <p v-if="inviteError" class="error">{{ inviteError }}</p>
              <p v-if="inviteSuccess" class="success">{{ inviteSuccess }}</p>
            </div>
          </div>


          <!-- leave button -->
          <button
          v-if="chatInfo?.owner?.user_id !== store.currUserId"
            class="leave-btn"
            @click="handleLeaveChat"
          >Leave</button>

        <div v-else class="admin-wrapper">
          <span class="admin-tag">Admin</span>
          <span class="tooltip">Admins cannot leave the chat</span>
        </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="messages">
        <div
          v-for="(msg, i) in messages"
          :key="msg._id || i"
          class="message-row"
          :class="{ mine: msg.sender === store.currUserId }"
        >
          <template v-if="msg.sender !== store.currUserId">
            <div class="avatar">{{ getSenderInitials(msg.sender) }}</div>
            <div class="bubble-wrapper">
              <span class="sender-label">{{ getSenderUsername(msg.sender) }}</span>
              <div class="bubble">{{ msg.content }}</div>
            </div>
          </template>

          <template v-else>
            <div class="bubble-wrapper mine">
              <div class="bubble mine">{{ msg.content }}</div>
            </div>
          </template>
        </div>

        <p v-if="!messages.length" class="no-messages">No messages yet. Say hello!</p>
      </div>

      <!-- Send text -->
      <div class="composer">
        <input
          v-model="newMessage"
          placeholder="Type a message..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>

    </template>
  </div>
</template>

<style scoped>
.admin-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  display: none;
  position: absolute;
  bottom: 130%;
  right: 0;
  background: #025269;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.admin-wrapper:hover .tooltip {
  display: block;
}
.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 15px;
  font-style: italic;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #025269;
  background: #f6f6f6;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-header h3 {
  color: #025269;
  margin: 0;
  font-weight: 500;
  font-size: 16px;
}

.members-count {
  font-size: 11px;
  color: #888;
}

.members-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.member-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #e0f0f0;
  color: #025269;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
}

.member-initial {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #025269;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.invite-wrapper {
  position: relative;
}

.invite-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #025269;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.invite-btn:hover { background: #2a8f8f; }

.invite-popup {
  position: absolute;
  top: 38px;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 14px;
  width: 220px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popup-title {
  font-size: 12px;
  color: #025269;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.invite-row {
  display: flex;
  gap: 6px;
}

.invite-row input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 13px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.invite-row input:focus {
  outline: none;
  border-color: #025269;
}

.invite-row button {
  padding: 6px 12px;
  background: #025269;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.invite-row button:hover { background: #2a8f8f; }

.leave-btn {
  padding: 6px 14px;
  background: #e61111;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.leave-btn:hover { background: #c00; }

.delete-btn {
  padding: 6px 10px;
  background: #e61111;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover { background: #c00; }

.admin-tag {
  font-size: 11px;
  color: #025269;
  background: #e0f0f0;
  padding: 4px 10px;
  border-radius: 99px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-messages {
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 13px;
  margin: auto;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-row.mine {
  justify-content: flex-end;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #025269;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;


}

.bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 60%;
}

.bubble-wrapper.mine {
  align-items: flex-end;
}

.sender-label {
  font-size: 11px;
  color: #888;
  padding-left: 4px;
}

.bubble {
  background: #e8f4f4;
  padding: 10px 14px;
  border-radius: 16px 16px 16px 4px;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.bubble.mine {
  background: #025269;
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.composer {
  display: flex;
  gap: 10px;
  padding: 25px 23px;
  border-top: 1px solid #025269;
  background: #f6f6f6;
  flex-shrink: 0;
}

.composer input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.composer input:focus {
  outline: none;
  border-color: #025269;
}

.composer button {
  padding: 10px 20px;
  background: #025269;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.composer button:hover { background: #2a8f8f; }

.error { color: red; font-size: 12px; }
.success { color: green; font-size: 12px; }
</style>

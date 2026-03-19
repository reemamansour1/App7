<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'

const store = useAppStore()
const route = useRoute()

const newMessage = ref('')

const friendUsername = computed(() => route.params.friend ?? null)
// can't use both this way, route.params.friend and adding a selectedFriend ref in pinia


const messages = computed(() =>
  friendUsername.value ? store.getMsg(friendUsername.value) : []
)

function sendMessage() {
  if (!newMessage.value.trim() || !friendUsername.value) return
  store.sendMsg(friendUsername.value, newMessage.value.trim())
  newMessage.value = ''
}
</script>

<template>
  <div class="chat">

    <div v-if="!friendUsername" class="empty">
      <p>Choose a friend to chat with</p>
    </div>

    <template v-else>
      <div class="chat-header">
        <h3>Chat with {{ friendUsername }}</h3>
      </div>

      <!-- Messages -->
      <div class="messages">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="message"
          :class="{ mine: msg.from === store.currUsername }"
        >
          <p>{{ msg.content }}</p>
        </div>
        <p v-if="messages.length === 0" class="empty">No messages yet. Say hello!</p>
      </div>

      <div class="input-section">
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
.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 15px;
  font-style: italic;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #025269;
  background: #f6f6f6;
  display: flex;
  justify-content: center;
}

.chat-header h3 {
  color: #025269;
  margin: 0;
  font-weight: 500;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 60%;
  background: #e8f4f4;
  padding: 10px 14px;
  border-radius: 12px 12px 12px 4px;
  font-size: 14px;
  color: #333;
}

.message.mine {
  align-self: flex-end;
  background: #025269;
  color: white;
  border-radius: 12px 12px 4px 12px;
}

.input-section {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 2px solid #025269;
  background: #f6f6f6;
  margin-bottom: 20px;
}

.input-section input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.input-section input:focus {
  outline: none;
  border-color: #025269;
}

.input-section button {
  padding: 10px 20px;
  background: #025269;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: Georgia, 'Times New Roman', Times, serif;
  transition: background 0.2s;
}

.input-section button:hover {
  background: #2a8f8f;
}
</style>

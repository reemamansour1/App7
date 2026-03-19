<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const store = useAppStore()

const username = ref('')
const password = ref('')
const error = ref('')

const usernameRules = computed(() => {
  const rules = []
  if (username.value.length < 5)
    rules.push('Must have at least 5 characters')
  if (username.value.length === 0 || !/^[a-zA-Z]/.test(username.value))
    rules.push('Must begin with a letter')
  if (username.value.length === 0 || !/^[a-zA-Z0-9]*$/.test(username.value))
    rules.push('Can only contain letters and numbers')
  return rules
})

const passwordRules = computed(() => {
  const rules = []
  if (password.value.length < 6)
    rules.push('Must have at least 6 characters')
  if (password.value.length === 0 || !/[a-z]/.test(password.value))
    rules.push('Must have 1 lowercase character')
  if (password.value.length === 0 || !/[0-9]/.test(password.value))
    rules.push('Must have 1 number')
  return rules
})

const isValid = computed(() => {
  return usernameRules.value.length === 0 && passwordRules.value.length === 0
})

function CreateAccountHandler() {
  error.value = ''
  if (!isValid.value) return
  const isCreated = store.createAccount(username.value, password.value)
  if (!isCreated) { error.value = 'Username already taken'; return }
  router.push('/home')
}
</script>

<template>
  <div>
    <NavBar />
    <div class="container">

      <form @submit.prevent="CreateAccountHandler">
        <h2>Create Account</h2>
        <div class="field">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" autocomplete="nope" />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" autocomplete="new-password" />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="!isValid">Create Account</button>
      </form>

      <div class="rules" v-if="usernameRules.length > 0 || passwordRules.length > 0">
        <div v-if="usernameRules.length > 0">
          <p class="rule">Username</p>
          <ul>
            <li v-for="rule in usernameRules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
        <div v-if="passwordRules.length > 0">
          <p class="rule">Password</p>
          <ul>
            <li v-for="rule in passwordRules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  gap: 40px;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 70px);
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 320px;
  background: white;
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

h2 {
  font-family: Georgia, 'Times New Roman', Times, serif;
  color: #025269;
  font-weight: 500;
  display: flex;
  justify-content: center;
}

label {
  display: block;
  font-family: Georgia, 'Times New Roman', Times, serif;
  color: #025269;
  margin-bottom: 6px;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

input:focus {
  outline: none;
  border-color: #025269;
}

button {
  padding: 10px;
  background-color: #025269;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-weight: 500;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background-color: #2a8f8f;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  font-size: 13px;
}

.rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule {
  color: red;
  font-size: 13px;
  margin-bottom: 4px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

ul {
  list-style: disc;
  padding-left: 18px;
  color: red;
  font-size: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
</style>

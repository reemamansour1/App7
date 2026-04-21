<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const store = useAppStore()

const isEmpty = ref(false)
const username = ref('')
const password = ref('')
const error = ref(false)
const showPassword = ref(false)

const isValid = computed(() => {
  return username.value.trim().length > 0 && password.value.trim().length > 0
})

watch([username, password], () => {
  if (store.accountCreated) {
    store.accountCreated = false
  }
})

async function signInHandler() {
  isEmpty.value = true
  error.value = false
  if (!isValid.value) return
  const isAuthenticated = await store.signIn(username.value, password.value)
  if (!isAuthenticated) {
    error.value = true
    return
  }
  router.push('/home')
}
</script>

<template>
  <div>
    <NavBar />
    <main class="form-container">
      <h2>Sign in to your account</h2>
      <p v-if="store.accountCreated" class="success">
        Account created! Please sign in.
      </p>
      <form @submit.prevent="signInHandler">
        <div class="field">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" autocomplete="nope" />
        </div>

        <div class="field">
          <div class="label-row">
            <label>Password</label>
            <label class="toggle">
              <input type="checkbox" v-model="showPassword" />
              <span class="slider"></span>
            </label>
          </div>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter password"
            autocomplete="new-password"
          />
        </div>

        <p v-if="isEmpty && !isValid" class="error">Username and password cannot be empty</p>
        <p v-else-if="error" class="error">Invalid username or password</p>

        <p class="switch-link">Don't have an account? <RouterLink to="/create-account"> Create one</RouterLink></p>

        <button type="submit" :disabled="!isValid">Sign In</button>
      </form>
    </main>
  </div>
</template>

<style scoped>
.error {
  color: red;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 13px;
}

.success {
  color: green;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 70px);
  background-color: #f6f6f6;
  gap: 30px;
}

h2 {
  font-family: Georgia, 'Times New Roman', Times, serif;
  color: #025269;
  font-weight: 500;
  margin-bottom: 20px;
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

label {
  display: block;
  font-family: Georgia, 'Times New Roman', Times, serif;
  color: #025269;
  font-size: 14px;
}

.label-row {
  display: flex;
  justify-content: space-between;

}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  font-family: Georgia, 'Times New Roman', Times, serif;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #025269;
}

.toggle input {
  display: none;
}

.toggle .slider {
  display: block;
  width: 34px;
  height: 20px;
  background-color: #ccc;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.toggle .slider::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background-color: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}

.toggle input:checked + .slider {
  background-color: #025269;
}

.toggle input:checked + .slider::before {
  transform: translateX(14px);
}

button[type="submit"] {
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
  box-shadow: 0 5px 5px rgba(0,0,0,0.2);
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #2a8f8f;
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.switch-link {
  font-size: 14px;
  color: #555;
  font-family: Georgia, 'Times New Roman', Times, serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

.switch-link a {
  color: #025269;
  font-weight: 500;
}
</style>

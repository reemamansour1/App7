<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import { useAppStore } from '@/stores/appStore';
import NavBar from '@/components/NavBar.vue';

const router = useRouter()
const store = useAppStore()

const isEmpty = ref(false);

const username = ref('')
const password = ref('')
const error = ref(false)

function signInHandler(){
  // needed to reset it every time the user tries to submit again
  isEmpty.value = true
  error.value = false
  const isAuthenticted = store.signIn(username.value, password.value)
  if(!isAuthenticted){
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
      <form @submit.prevent="signInHandler">
        <div class="field">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" autocomplete="nope" />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" autocomplete="new-password"/>
        </div>
        <p v-if="isEmpty && (!username.trim() || !password.trim())" class="error">Username or password cannot be empty</p>
        <p v-else-if="error" class="error">Invalid username or password</p>
        <button type="submit">Sign In</button>
      </form>
    </main>
  </div>
</template>

<style scoped>
.error {
  color: red;
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

button:hover {
  background-color: #2a8f8f;
}
</style>

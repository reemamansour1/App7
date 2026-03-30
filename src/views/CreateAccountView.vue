<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const store = useAppStore()

const firstName = ref('')
const lastName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const errors = ref([])

async function CreateAccountHandler() {
  errors.value = []

  const result = await store.createAccount({
    firstName: firstName.value,
    lastName: lastName.value,
    username: username.value,
    email: email.value,
    password: password.value
  })

  if (!result.success) {
    errors.value = result.errors
    return
  }
  // change the value so it could show, account created
  store.accountCreated = true;
  router.push('/signin')
}
</script>

<template>
  <div>
    <NavBar />
    <div class="container">
      <form @submit.prevent="CreateAccountHandler">
        <h2>Create Account</h2>
        <div class="field">
          <label>First Name</label>
          <input v-model="firstName" type="text" placeholder="Enter first name" autocomplete="nope" />
        </div>
        <div class="field">
          <label>Last Name</label>
          <input v-model="lastName" type="text" placeholder="Enter last name" autocomplete="nope" />
        </div>
        <div class="field">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" autocomplete="nope" />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="Enter email" autocomplete="nope" />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" autocomplete="new-password" />
        </div>
        <ul v-if="errors.length > 0" class="errors">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
        <button type="submit">Create Account</button>
      </form>
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

button:hover {
  background-color: #2a8f8f;
}

.errors {
  list-style: disc;
  padding-left: 18px;
  color: red;
  font-size: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
</style>n

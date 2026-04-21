<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
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
const showPassword = ref(false)

const usernameRules = computed(() => {
  const rules = []
  if (username.value.length < 5)
    rules.push('At least 5 characters')
  if (username.value.length === 0 || !/^[a-zA-Z]/.test(username.value))
    rules.push('Must begin with a letter')
  if (username.value.length === 0 || !/^[a-zA-Z0-9]*$/.test(username.value))
    rules.push('Letters and numbers only')
  return rules
})

const passwordRules = computed(() => {
  const rules = []
  if (password.value.length < 8)
    rules.push('At least 8 characters')
  if (password.value.length === 0 || !/[A-Z]/.test(password.value))
    rules.push('1 uppercase character')
  if (password.value.length === 0 || !/[a-z]/.test(password.value))
    rules.push('1 lowercase character')
  if (password.value.length === 0 || !/[0-9]/.test(password.value))
    rules.push('1 number')
  if (password.value.length === 0 || !/[^a-zA-Z0-9]/.test(password.value))
    rules.push('1 special character')
  return rules
})

const isValid = computed(() => {
  return (
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    email.value.trim().length > 0 &&
    usernameRules.value.length === 0 &&
    passwordRules.value.length === 0
  )
})

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
  store.accountCreated = true
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

        <ul v-if="errors.length > 0" class="errors">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>

        <p class="switch-link">Already have an account? <RouterLink to="/signin">Sign in</RouterLink></p>

        <button type="submit" :disabled="!isValid">Create Account</button>
      </form>

      <div class="rules" v-if="usernameRules.length > 0 || passwordRules.length > 0">
        <div v-if="usernameRules.length > 0">
          <p class="rule-title">Username</p>
          <ul>
            <li v-for="rule in usernameRules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
        <div v-if="passwordRules.length > 0">
          <p class="rule-title">Password</p>
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
  font-size: 14px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

input[type="text"],
input[type="email"],
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
input[type="email"]:focus,
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
  font-size: 13px;
  color: #555;
  font-family: Georgia, 'Times New Roman', Times, serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-link a {
  color: #025269;
  font-weight: 500;
}

.errors {
  list-style: disc;
  padding-left: 18px;
  color: red;
  font-size: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-title {
  color: red;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

.rules ul {
  list-style: disc;
  padding-left: 18px;
  color: red;
  font-size: 12px;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
</style>

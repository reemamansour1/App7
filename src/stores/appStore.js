import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('appStore', () => {
  const host = 'https://stingray-app-u3bsh.ondigitalocean.app'

  const accountCreated = ref(false)
  const currUsername = ref(null)
  const messagesArray = ref([])

  async function signIn(username, password) {
    const url = host + '/user/login'
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }
    try {
      const response = await fetch(url, options)
      if (!response.ok) return false
      const signedInUser = await response.json()
      currUsername.value = signedInUser.user.username
      localStorage.setItem('authToken', signedInUser.authToken)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async function createAccount(user) {
    const url = host + '/user'
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }
    try {
      const res = await fetch(url, options)
      if (!res.ok) {
        const result = await res.json()
        switch (res.status) {
          case 400:
            return {
              success: false,
              errors: Object.values(result.errors).map(err => err.message)
            }
          case 409:
            return {
              success: false,
              errors: ['username or email already taken']
            }
        }
        return { success: false, errors: ['something went wrong'] }
      }
      return { success: true }
    } catch (error) {
      console.log(error)
      return { success: false, errors: ['network error'] }
    }
  }

  async function getUserInfo() {
    const url = host + '/user'
    const token = localStorage.getItem('authToken')
    const options = {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }
    try {
      const response = await fetch(url, options)
      if (!response.ok) return null
      const data = await response.json()
      return data
    } catch (error) {
      console.log(error)
      return null
    }
  }

  function signOut() {
    currUsername.value = null
    localStorage.removeItem('authToken')
  }

  async function findUsers(search) {
    if (!search) return []
    const url = host + `/users?search=${search}&limit=10&skip=0&sortBy=username:asc`
    const token = localStorage.getItem('authToken')
    const options = {
      method: 'GET',
      headers :  {
        'Authorization': `Bearer ${token}`
      }
    }
    try {
      const response = await fetch(url, options)
      if (!response.ok) return []
      const data = await response.json()
      console.log("FindUsers function", data.users)
      return data.users || []
      // it is going return the object that has _id inside each user's object
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async function sendFriendRequest(userId) {
    const url = host + `/friend-request/${userId}`
    const token = localStorage.getItem('authToken')
    const options = {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        const result = await response.json()
        return { success: false, error: result.message || 'Could not send request' }
      }
      return { success: true }
    } catch (error) {
      console.log(error)
      return { success: false, error: 'Network error' }
    }
  }

  async function acceptDeclineFriendRequest(requestId, accept) {
    const url = host + `/friend-request/${requestId}?accept=${accept}`
    const token = localStorage.getItem('authToken')
    const options = {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    }
    try {
      const response = await fetch(url, options)
      if (!response.ok) return { success: false }
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.log(error)
      return { success: false }
    }
  }

  async function getFriendRequests() {
    const url = host + '/friend-requests'
    const token = localStorage.getItem('authToken')
    const options = {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }
    try {
      const response = await fetch(url, options)
      if (!response.ok) return []
      const data = await response.json()
      return data
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async function removeFriend(userId) {
    const url = host + `/friend/${userId}`
    const token = localStorage.getItem('authToken')
    const options = {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }
    try {
      const response = await fetch(url, options)
      if (!response.ok) return { success: false }
      return { success: true }
    } catch (error) {
      console.log(error)
      return { success: false }
    }
  }

  function getMsg(username) {
    return messagesArray.value.filter(m =>
      (m.from === currUsername.value && m.to === username) ||
      (m.from === username && m.to === currUsername.value)
    )
  }

  function sendMsg(username, content) {
    messagesArray.value.push({
      from: currUsername.value,
      to: username,
      content
    })
  }

  return {
    currUsername, accountCreated, messagesArray,
    signIn, signOut, createAccount,
    getUserInfo, findUsers,
    sendFriendRequest, acceptDeclineFriendRequest,
    getFriendRequests, removeFriend,
    getMsg, sendMsg
  }
})

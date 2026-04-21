import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('appStore', () => {
  const host = 'https://stingray-app-u3bsh.ondigitalocean.app'
  const accountCreated = ref(false)
  const messagesArray = ref([])
  const currUsername = ref(localStorage.getItem('currUsername'))
  const currUserId = ref(localStorage.getItem('currUserId'))
  const chatSessions = ref([])

  async function loadChatSessions() {
    const userInfo = await getUserInfo()
    if (!userInfo) return

    console.log("ADMIN chat_sessions IDS:", userInfo.chat_sessions)

    const chatIds = userInfo.chat_sessions || []
    const chats = []

    for (const id of chatIds) {
      const result = await getChatInfo(id)
      console.log("Chat info result for", id, result)

      if (result.success) chats.push(result.data)
    }
    console.log("Chats loaded into sidebar:", chats)
    chatSessions.value = chats
  }

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
        currUserId.value = signedInUser.user._id
        localStorage.setItem('authToken', signedInUser.authToken)
        localStorage.setItem('currUsername', signedInUser.user.username)
        localStorage.setItem('currUserId', signedInUser.user._id)
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
    console.log('createAccount status:', res.status)
    if (!res.ok) {
      const result = await res.json()
      console.log('createAccount error:', result)
      switch (res.status) {
        case 400:
          return {
            success: false,
            errors: Object.values(result.errors).map(err => err.message)
          }
        case 409:
          return {
            success: false,
            errors: ['Username or email already taken']
          }
      }
      return { success: false, errors: ['Something went wrong'] }
    }
    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false, errors: ['Network error'] }
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
    currUserId.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('currUsername')
    localStorage.removeItem('currUserId')
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

  async function createChat(chatType, groupName){
    const url = host + '/chat'
    const token = localStorage.getItem('authToken')
    const options = {
      method : 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body : JSON.stringify({chat_type : chatType, group_name: groupName})
    }
    try{
    const response = await fetch(url, options)
    if(!response.ok){
      return {success : false}
    }
    const data = await response.json()
    return {success: true, data}
    }catch(error){
      console.log(error)
      return { success : false}
    }
  }


  async function getChatInfo(chatId){
    const url = host + `/chat/${chatId}`
    const token = localStorage.getItem('authToken')
    const options = {
      method: 'GET',
      headers : {
        'Authorization' : `Bearer ${token}`
      }
    }
    try{
      const response = await fetch(url, options)
      if(!response.ok){
        return {
          success: false
        }
      }
      const data = await response.json()
      return { success : true, data}
    }catch(error){
      console.log(error)
      return { success : false}
    }
  }

async function inviteUsertoChat(chatId, userId) {
  const url = host + `/chat/${chatId}/invitation/${userId}`
  const token = localStorage.getItem('authToken')
  const options = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      const result = await res.json()
      return { success: false, error: result.message || 'Could not invite user' }
    }
    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false, error: 'Network error' }
  }
}

  async function acceptDeclineChatInvite(chatId, requestId, accept) {
    const url = host + `/chat/${chatId}/invitation/${requestId}?accept=${accept}`
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

  async function getChatMessages(chatId){
    const url = host + `/chat/${chatId}/messages?limit=50&offset=0`
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
      return { success: false }
    }
  }

async function sendChatMessage(chatId, message) {
  const url = host + `/chat/${chatId}/message`
  const token = localStorage.getItem('authToken')
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
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


  async function leaveChat(chatId){
    const url = host + `/chat/${chatId}/membership`
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

  return {
    currUsername, accountCreated, messagesArray,currUserId, chatSessions, loadChatSessions,
    signIn, signOut, createAccount,
    getUserInfo, findUsers,
    sendFriendRequest, acceptDeclineFriendRequest,
    getFriendRequests, removeFriend, createChat, inviteUsertoChat, getChatInfo, acceptDeclineChatInvite, getChatMessages, leaveChat, sendChatMessage
  }
})

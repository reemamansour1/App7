import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('appStore', () => {
  const host = 'https://stingray-app-u3bsh.ondigitalocean.app'

  const accountCreated = ref(false);
  const usersArray = ref([])
  const messagesArray = ref([])
  const currUsername = ref(null)

  const currentUser = computed(() =>
    usersArray.value.find(u => u.username === currUsername.value)
  )

  const friends = computed(() =>
    currentUser.value ? currentUser.value.friends : []
  )

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

      //signedInUser.firstName is undefined, there is a property called user that has firstname, lastname....
      console.log(' user signed in is :', signedInUser.user.firstName)

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
              errors: ['Username or email already taken']
            }
        }

        return { success: false, errors: ['Something went wrong'] }

      }
      console.log('New user created:', user)
      return { success: true }

    } catch (error) {
      console.log(error)
      return { success: false, errors: ['Network error'] }
    }

  }

  function signOut() {
    currUsername.value = null
  }

  function sendFriendReq(username) {
    if (username === currUsername.value)
      return { success: false, error: "you cannot add yourself :)" }

    const targetUser = usersArray.value.find(u => u.username === username)

    if (!targetUser) {
      return { success: false, error: "User not found" }
    }

    if (currentUser.value.friends.includes(username))
      return { success: false, error: "Already friends" }

    if (currentUser.value.outgoingFQ.includes(username))
      return { success: false, error: "Request already sent" }

    if (currentUser.value.incomingFQ.includes(username))
      return { success: false, error: "Already has a pending request from this user" }

    currentUser.value.outgoingFQ.push(username)
    targetUser.incomingFQ.push(currUsername.value)

    return { success: true }
  }

  function acceptFQ(username) {
    const friend = usersArray.value.find(u => u.username === username)

    currentUser.value.incomingFQ = currentUser.value.incomingFQ.filter(n => n !== username)
    friend.outgoingFQ = friend.outgoingFQ.filter(n => n !== currUsername.value)

    currentUser.value.friends.push(username)
    friend.friends.push(currUsername.value)
  }

  function rejectFQ(username) {
    const friend = usersArray.value.find(u => u.username === username)

    currentUser.value.incomingFQ = currentUser.value.incomingFQ.filter(n => n !== username)
    friend.outgoingFQ = friend.outgoingFQ.filter(n => n !== currUsername.value)
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
    usersArray,
    messagesArray,
    currentUser,
    currUsername,
    friends,
    signIn,
    signOut,
    createAccount,
    sendFriendReq,
    acceptFQ,
    rejectFQ,
    getMsg,
    sendMsg,
    accountCreated
  }
})

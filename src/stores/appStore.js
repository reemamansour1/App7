import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {users, messages} from "@/db/data.js"

export const useAppStore = defineStore('appStore', () => {
  const usersArray = ref(users)
  const messagesArray = ref(messages)
  const currUsername = ref(null)
  // only holds the user's username

  const currentUser = computed(()=> usersArray.value.find(u => u.username === currUsername.value))
  // the whole user obj, {username, password, friends, incomingFQ, outgoingFQ}

  const friends = computed(() => currentUser.value ? currentUser.value.friends : [])

  function signIn(username, password){
    const user = usersArray.value.find(u => u.username === username && u.password === password)
    if(!user) return false
    currUsername.value = username
    return true
  }

  function signOut(){
    currUsername.value = null
  }

  function createAccount(username, password){
    const exists = usersArray.value.find(u => u.username === username)
    if(exists) return false
    usersArray.value.push({
      username,
      password,
      friends: [],
      incomingFQ: [],
      outgoingFQ: []
    })
    currUsername.value = username
    return true
  }


  function sendFriendReq(username){
    if(username === currUsername.value) return {success : false, error: "you cannot add yourself :)"}
    const targetUser = usersArray.value.find(u => u.username === username)
    if(!targetUser){
      return {success : false, error: "User not found"}
    }
    if(currentUser.value.friends.includes(username))
      return {success : false, error: "Already friends"}
    if(currentUser.value.outgoingFQ.includes(username))
      return {success : false, error: "Request already sent"}
    if(currentUser.value.incomingFQ.includes(username))
      return {success : false, error: "Already has a pending request from this user"}
    currentUser.value.outgoingFQ.push(username)
    targetUser.incomingFQ.push(currUsername.value)
    return{success: true}
  }

  function acceptFQ(username){
    const friend = usersArray.value.find(u => u.username === username)
    currentUser.value.incomingFQ = currentUser.value.incomingFQ.filter(n => n !== username)
    friend.outgoingFQ = friend.outgoingFQ.filter(n => n !== currUsername.value)
    currentUser.value.friends.push(username)
    friend.friends.push(currUsername.value)
  }
  function rejectFQ(username){
    const friend = usersArray.value.find(u => u.username === username)
    currentUser.value.incomingFQ = currentUser.value.incomingFQ.filter(n => n !== username)
    friend.outgoingFQ = friend.outgoingFQ.filter(n => n !== currUsername.value)
  }

  function getMsg(username){
    return messagesArray.value.filter(m => (m.from === currUsername.value && m.to === username) || (m.from === username && m.to === currUsername.value))
  }

  function sendMsg(username, content){
    messagesArray.value.push({
      from : currUsername.value,
      to: username,
      content
    })
  }

  return {usersArray, messagesArray, currentUser, currUsername, friends, signIn, signOut, createAccount, sendFriendReq, acceptFQ, rejectFQ, getMsg, sendMsg}
})

import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppStore } from '@/stores/appStore.js'

import LandingView from '@/views/LandingView.vue'
import CreateAccountView from '@/views/CreateAccountView.vue'
import SignInView from '@/views/SignInView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: LandingView },
    { path: '/create-account', component: CreateAccountView },
    { path: '/signin', component: SignInView},
    { path: '/home', component: HomeView },
    { path: '/home/:friend', component: HomeView },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to) => {
  const store = useAppStore()
  // user is not signed in and tries to go to home, send them back to signin
  if (to.path.startsWith('/home') && !store.currUsername) {
    return { path: '/signin' }
  }
})

export default router

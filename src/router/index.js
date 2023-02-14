import Home from '@/components/Home.vue'
import Login from '@/components/Login.vue'
import Users from '@/components/user/Users.vue'
import Welcome from '@/components/Welcome.vue'
import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users }
    ]
  }
]
const router = new VueRouter({
  routes
})
router.beforeEach(function (to, from, next) {
  if (to.path === '/login') return next()
  if (!window.sessionStorage.getItem('token')) return next('/login')
  next()
})
export default router

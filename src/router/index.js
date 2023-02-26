import Add from '@/components/goods/Add.vue'
import Categories from '@/components/goods/Categories.vue'
import Lists from '@/components/goods/Lists.vue'
import Params from '@/components/goods/Params.vue'
import Home from '@/components/Home.vue'
import Login from '@/components/Login.vue'
import Orders from '@/components/order/Orders.vue'
import Rights from '@/components/power/Rights.vue'
import Roles from '@/components/power/Roles.vue'
import Reports from '@/components/report/Reports.vue'
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
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/goods', component: Lists },
      { path: '/goods/add', component: Add },
      { path: '/params', component: Params },
      { path: '/categories', component: Categories },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports }
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

import axios from 'axios'
import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'
import store from './store'
// 导入全局样式表
import '@/assets/CSS/global.css'
// 导入字体图标
import '@/assets/font/iconfont.css'
import ZkTable from 'vue-table-with-tree-grid'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 使用axios配置请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 为请求头对象 添加Token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

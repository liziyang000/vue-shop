import axios from 'axios'
import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'
import App from './App.vue'
import './plugins/element.js'
import router from './router'
import store from './store'

import 'quill/dist/quill.bubble.css'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
// 导入全局样式表
import '@/assets/CSS/global.css'
// 导入字体图标
import '@/assets/font/iconfont.css'
import ZkTable from 'vue-table-with-tree-grid' // for bubble theme

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 使用axios配置请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 为请求头对象 添加Token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.use(VueQuillEditor)
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

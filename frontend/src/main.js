import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

axios.defaults.baseURL = 'https://gasfee-evw8.onrender.com'

const app = createApp(App)
app.use(router)
app.mount('#app')

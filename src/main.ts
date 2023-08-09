import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import './assets/css/app.css';

import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(Toast, {
  position: 'bottom-center',
  hideProgressBar: true,
});
app.mount('#app');

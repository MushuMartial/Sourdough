import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
//import './assets/main.css'; // CSS global

const app = createApp(App);

app.use(createPinia());

app.mount('#app');
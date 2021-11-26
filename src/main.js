import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex';
import store from './vuex/store.js';

Vue.config.productionTip = false;

Vue.use(Vuex);

window.hash = window.hash || {};
window.axios = require('axios');
window.dayjs = require('dayjs');

// import { md5 } from "./utils/md5";
// window.hash.md5 = md5;

const templates = require.context('./templates', true, /\.vue$/i);
templates.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], templates(key).default));

const files = require.context('./components', true, /\.vue$/i);
files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default));

new Vue({
  render: h => h(App),
  store
}).$mount('#plugin-zendesk')

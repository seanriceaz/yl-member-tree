import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

const data = {
  memberID: '',
  password: '',
  members: {},
};

new Vue({
  render: h => h(App),
  data,
}).$mount('#app');

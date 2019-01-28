import Vue from 'vue';
import {
  MdButton, MdContent, MdField, MdDialog,
} from 'vue-material/dist/components';
import App from './App.vue';
import 'vue-material/dist/vue-material.min.css';

Vue.use(MdButton);
Vue.use(MdContent);
Vue.use(MdField);
Vue.use(MdDialog);

Vue.config.productionTip = false;

const data = {

};

new Vue({
  render: h => h(App),
  data,
}).$mount('#app');

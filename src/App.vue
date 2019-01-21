<template>
  <div id="app">
    <YLLogin ref="login" v-on:loginUpdated="getMembersAndGraph"/>
    <MemberGraph />
  </div>
</template>

<script>
import MemberGraph from './components/MemberGraph.vue';
import YLLogin from './components/YLLogin.vue';

export default {
  name: 'app',
  components: {
    MemberGraph,
    YLLogin,
  },
  methods: {
    getMembersAndGraph(event) {
      MemberGraph.render(event.data);
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

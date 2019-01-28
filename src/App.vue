<template>
  <div id="app">
    <YLLogin ref="login" v-on:loginUpdated="getMembersAndGraph"/>
    <MemberGraph ref="graph" />
  </div>
</template>

<script>
import MemberGraph from './components/MemberGraph.vue';
import YLLogin from './components/YLLogin.vue';
import LocalMembers from '../localDev/yl-memberlist.json';

const d3 = require('d3');

export default {
  name: 'app',
  components: {
    MemberGraph,
    YLLogin,
  },
  data: () => ({
    members: {},
  }),
  methods: {
    getMembersAndGraph(event) {
      // Get our member list
      const { graph } = this.$refs;
      if (process.env.NODE_ENV === 'development') {
        // Use local json file localDev/yl-memberlist.json
        this.$data.members = LocalMembers; // This doesn't seem to be working
        // const { memberID } = event;
      } else {
        // Use results from web service ;)
        console.log(event);
      }
      graph.RenderGraph({
        members: this.$data.members,
        memberID: event.memberID;
        //top node is the root memberID
        

      });
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

<template>
  <div id="app">
    <md-toolbar ref="toolbar">
      <h2>Member: {{memberID}}</h2>
      <md-button ref="reset" v-on:click="reset()">Reset</md-button>
    </md-toolbar>
    <YLLogin ref="login" v-on:loginUpdated="getMembersAndGraph"/>
    <MemberGraph ref="graph" />
  </div>
</template>

<script>
import MemberGraph from './components/MemberGraph.vue';
import YLLogin from './components/YLLogin.vue';
import LocalMembers from '../localDev/yl-memberlist.json';

export default {
  name: 'app',
  components: {
    MemberGraph,
    YLLogin,
  },
  data: () => ({
    members: {},
    memberID: '',
  }),
  methods: {
    getMembersAndGraph(event) {
      const { graph } = this.$refs;
      // Get our member list
      if (process.env.NODE_ENV === 'development') {
        // Use local json file localDev/yl-memberlist.json
        this.members = LocalMembers; // This doesn't seem to be working
        this.memberID = event.memberID;
        // const { memberID } = event;
      } else {
        // Use results from web service ;)
        this.members = event.members; // This doesn't seem to be working
        this.memberID = event.memberID;
      }
      // Save to local storage too!
      localStorage.members = JSON.stringify(this.members);
      localStorage.memberID = this.memberID;

      graph.RenderGraph({
        members: this.members,
        memberID: this.memberID,
      });
    },
    reset() {
      const { login } = this.$refs;
      login.reset();
    },
  },
  mounted() {
    if (localStorage.members && localStorage.memberID) {
      const { graph } = this.$refs;
      const { login } = this.$refs;
      this.members = JSON.parse(localStorage.members);
      this.memberID = localStorage.memberID;
      graph.RenderGraph({
        members: this.members,
        memberID: this.memberID,
      });
      login.hideDialog();
    }
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

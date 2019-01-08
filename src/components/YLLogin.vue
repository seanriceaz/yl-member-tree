<template>
  <div>
    <md-dialog :md-active.sync="showDialog">
      <md-dialog-title>Get your member list</md-dialog-title>
      <md-field>
        <label>Member ID</label>
        <md-input v-model="memberID"></md-input>
      </md-field>
      <md-field>
        <label>Password</label>
        <md-input v-model="password" type="password"></md-input>
      </md-field>
      <md-dialog-actions>
        <md-button @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" v-on:click="updateLogin">Get Members</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>
<script>

export default {
  name: 'YLLogin',
  data() {
    return {
      memberID: '',
      password: '',
      showDialog: true,
    };
  },
  methods: {
    updateLogin() {
      this.showDialog = false;
      this.$emit('loginUpdated', {
        memberID: this.memberID,
        password: this.password,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .md-dialog {
    max-width: 768px;
    padding: 0 16px;
    background: white;
  }
</style>

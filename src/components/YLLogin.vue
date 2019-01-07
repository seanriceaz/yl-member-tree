<template>
  <div>
    <label for="member-id">Member ID</label>
    <input id="member-id" v-model="memberID">
    <label for="password">Password</label>
    <input type="password" id="password" v-model="password">
    <button id="submit" v-on:click="updateLogin">Get Members</button>
  </div>
</template>
<script>
export default {
  name: 'YLLogin',
  data() {
    return {
      memberID: '',
      password: '',
    };
  },
  methods: {
    updateLogin() {
      this.$emit('loginUpdated', {
        memberID: this.memberID,
        password: this.password,
      });
    },
  },
};
</script>

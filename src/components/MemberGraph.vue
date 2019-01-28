<template>
  <div>
    <h2>Your Member Tree {{memberID}}</h2>
    <div id="graph"></div>
  </div>
</template>
<script>
export default {
  name: 'MemberGraph',
  data: () => ({
    memberID: '',
  }),
  methods: {
    RenderGraph(data) {
      // Do the rendering!
      this.$data.memberID = data.memberID;
      this.$data.members = data.members;
      
    },
  },
};
</script>

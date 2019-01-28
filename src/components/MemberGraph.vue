<template>
  <div>
    <h2>Your Member Tree</h2>
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
    RenderGraph(members) {
      // Do the rendering!
      console.log(members);
    },
  },
};
</script>

<template>
  <div>
    <h2>Member tree for {{memberID}}</h2>
    <div id="graph"></div>
  </div>
</template>
<script>
export default {
  name: 'MemberGraph',
  methods: {
    render(data) {
      if (process.env.NODE_ENV === 'development') {
        // Use local json file localDev/yl-memberlist.json
        console.log(data);
      } else {
        // Use results from web service ;)
      }
    },
  },
};
</script>

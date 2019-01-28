<template>
  <div>
    <h2>Your Member Tree {{memberID}}</h2>
    <div id="graph"></div>
  </div>
</template>
<script>
const d3 = require('d3');

export default {
  name: 'MemberGraph',
  data: () => ({
    memberID: '',
    members: {},
  }),
  methods: {
    RenderGraph(data) {
      // Do the rendering!
      this.$data.memberID = data.memberID;
      this.$data.members = data.members.accounts;
      // Create our nested array
      var nest = this.nestArray(this.$data.memberID);

      console.log(this.$data.members);
      console.log(nest);
    },
    nestArray(parentID) {
      var children = {};
      for (let member in this.$data.members) {
        var thisMember = this.$data.members[member];
        if (thisMember.sponsorid == parentID) {
          children[thisMember.customerid] = thisMember;
        }
      }
      if (children.length > 0) {
        for (let member in children) {
          children[member].children = this.nestArray(children[member].customerid);
        }
        return children;
      }
      return [];
    },
  },
};
</script>

<template>
  <div>
    <h2>Your Member Tree {{memberID}}</h2>
    <div id="graph"></div>
  </div>
</template>
<script>
// const d3 = require('d3');
// Need a recursive function. This one only works in certain situations.
function unflatten(array, rootID, parent, tree) {
  let myTree = typeof tree !== 'undefined' ? tree : [];
  const myParent = parent;
  const children = array.filter(child => (child.sponsorid === myParent.customerid));
  if (children.length) {
    if (myParent.customerid !== rootID) {
      myTree = children;
    } else {
      myParent.children = children;
    }
    children.forEach((child) => { unflatten(array, child.customerid, child); });
  }
  return myTree;
}

export default {
  name: 'MemberGraph',
  data: () => ({
    memberID: '',
    members: {},
  }),
  methods: {
    RenderGraph(data) {
      let nest = [];
      // Do the rendering!
      this.$data.memberID = data.memberID;
      this.$data.members = data.members.accounts;
      // Create our nested array
      nest = unflatten(Object.values(data.members.accounts),
        data.memberID,
        data.members.accounts[data.memberID]);
      // Next we need to plot this on a graph!
      console.log(nest);
    },
  },
};
</script>

<template>
  <div>
    <h2>Your Member Tree {{memberID}}</h2>
    <div id="graph"></div>
  </div>
</template>
<script>
// const d3 = require('d3');

// Need a recursive function. This one only works in certain situations.

// function nestArray(list, rootID) {
//   const map = {};
//   const roots = [];
//   const myList = list;
//   const keys = Object.keys(myList);
//   let node = {};
//   for (let i = 0; i < keys.length; i += 1) {
//     map[myList[keys[i]].customerid] = keys[i]; // initialize the map
//     myList[keys[i]].children = []; // initialize the children
//   }
//   console.log(myList);
//   for (let j = 0; j < keys.length; j += 1) {
//     node = myList[keys[j]];
//     if (node.customerid !== rootID){
//       if (node.sponsorid !== rootID) {
//         // if you have dangling branches check that map[node.parentId] exists
//         myList[map[node.sponsorid]].children.push(node);
//       } else {
//         roots.push(node);
//       }
//     }
//   }
//   console.log(roots);
//   return roots;
// }

export default {
  name: 'MemberGraph',
  data: () => ({
    memberID: '',
    members: {},
  }),
  methods: {
    RenderGraph(data) {
      const nest = {};
      // Do the rendering!
      this.$data.memberID = data.memberID;
      this.$data.members = data.members.accounts;
      // Create our nested array
      console.log(this.$data.members);
      console.log(nest);
    },
    // nestArray(parentID) {
    //   var children = {};
    //   for (let member in this.$data.members) {
    //     var thisMember = this.$data.members[member];
    //     if (thisMember.sponsorid == parentID) {
    //       children[thisMember.customerid] = thisMember;
    //     }
    //   }
    //   if (children.length > 0) {
    //     for (let member in children) {
    //       children[member].children = this.nestArray(children[member].customerid);
    //     }
    //     return children;
    //   }
    //   return [];
    // },
  },
};
</script>

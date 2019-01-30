<template>
  <div>
    <h2>Your Member Tree {{memberID}}</h2>
    <div id="graph"></div>
  </div>
</template>
<script>
const d3 = require('d3');
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
function toggle(d) {
  const myD = d;
  if (d.children) {
    myD.XXchildren = d.children;
    myD.children = null;
  } else {
    myD.children = d.XXchildren;
    myD.XXchildren = null;
  }
  return myD;
}
function toggleAll(d) {
  const myD = d;
  if (d.values && d.values.actuals) {
    myD.values.actuals.forEach(toggleAll);
    return toggle(myD);
  }
  if (d.values) {
    myD.values.forEach(toggleAll);
    return toggle(myD);
  }
  return myD;
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
      const tree = d3.layout.tree();
      // Settings for the Tree layout
      const m = [0, 60, 0, 60]; // Margins
      const w = 900 - m[1] - m[3]; // Width
      const h = 900 - m[0] - m[2]; // Height
      // Color palette
      const colors = ['#D5252F', '#E96B38', '#F47337', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF'];
      const diagonal = d3.svg.diagonal()
        .projection(d => [d.y, d.x]);
      const vis = d3.select('#graph').append('svg:svg')
        .attr('width', w + m[1] + m[3])
        .attr('height', h + m[0] + m[2])
        .append('svg:g')
        .attr('transform', `translate(${m[3]},${m[0]})`);
      const formatNumber = d3.format(',.3f');
      const levelMax = 0;
      const levelRadius = d3.scale.sqrt()
        .domain([0, levelMax])
        .range([1, 40]);
      const root = {};

      tree.children(d => d.values);
      tree.size([h, w]); // Sizes of the chart
      // Do the rendering!
      this.$data.memberID = data.memberID;
      this.$data.members = data.members.accounts;
      // Create our nested array
      nest = unflatten(Object.values(data.members.accounts),
        data.memberID,
        data.members.accounts[data.memberID]);
      // Next we need to plot this on a graph!
      root.values = nest;
      root.x0 = h / 2;
      root.y0 = 0;
      // Initialize the display to show a few nodes.
      root.values.forEach(toggleAll);
      const nodes = tree.nodes(root).reverse();
      tree.children(d => d.children);
      console.log(nest);
      console.log(colors + vis + diagonal + formatNumber + nodes + levelRadius);
    },
  },
};
</script>

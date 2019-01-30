<template>
  <div>
    <h2>Your Member Tree {{memberID}}</h2>
    <div id="graph"></div>
    <div id="tooltip">
      <h3 id="header"></h3>
      <p id="description"></p>
    </div>
  </div>
</template>
<script>
const d3 = require('d3');
// Need a recursive function. This one only works in certain situations.

const toolTip = d3.select(document.getElementById("toolTip"));
const header = d3.select(document.getElementById("head"));
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

function update(source) {
  const duration = d3.event && d3.event.altKey ? 5000 : 500;
  const nodes = tree.nodes(root).reverse();
  let depthCounter = 0;

  // Normalize for fixed-depth.
  nodes.forEach((d) => {
    d.y = d.depth * 180;
    d.numChildren = (d.children) ? d.children.length : 0;

    if (d.depth === 1) {
      if (depthCounter < colors.length) { d.linkColor = colors[depthCounter]; } else { d.linkColor = colors[(depthCounter % (colors.length - 1))]; }
      depthCounter++;
    }

    if (d.numChildren === 0 && d.XXchildren) d.numChildren = d.XXchildren.length;
  });

  // Set link colors
  nodes.forEach((d) => {
    let obj = d;

    while ((obj.source && obj.source.depth > 1) || obj.depth > 1) {
      obj = (obj.source) ? obj.source.parent : obj.parent;
    }

    d.linkColor = (obj.source) ? obj.source.linkColor : obj.linkColor;
  });

  // Update the nodes…
  const node = vis.selectAll('g.node')
    .data(nodes, d => d.id || (d.id +i));

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node.enter().append('svg:g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${source.y0},${source.x0})`)
    .on('click', (d) => {
      if (d.numChildren > 50) {
        alert(`${d.key} has too many departments (${d.numChildren}) to view at once.`);
      } else {
        toggle(d);
        update(d);
      }
    });

  nodeEnter.append('svg:circle')
    .attr('r', 1e-6)
    .on('mouseover', (d) => { nodeOnMouseOver(d); })
    .on('mouseout', (d) => { // when the mouse leaves a circle, do the following
      toolTip.transition() // declare the transition properties to fade-out the div
        .duration(500) // it shall take 500ms
        .style('opacity', 0); // and go all the way to an opacity of nil
    })
    .style('fill', d => (d.source ? d.source.linkColor : d.linkColor))
    .style('fill-opacity', '.8')
    .style('stroke', d => (d.source ? d.source.linkColor : d.linkColor));


  nodeEnter.append('svg:text')
    .attr('x', d => (d.children || d.XXchildren ? -10 : 10))
    .attr('dy', '.35em')
    .attr('text-anchor',
      d => (d.children || d.XXchildren ? 'end' : 'start'))
    .text((d) => {
      let ret = (d.depth === 4) ? d.Level4 : d.key;
      ret = (String(ret).length > 25) ? `${String(ret).substr(0, 22)}...` : ret;
      return ret;
    })
    .on('mouseover', (d) => { nodeOnMouseOver(d); })
    .on('mouseout', () => { // when the mouse leaves a circle, do the following
      toolTip.transition() // declare the transition properties to fade-out the div
        .duration(500) // it shall take 500ms
        .style('opacity', 0); // and go all the way to an opacity of nil
    })
    .style('fill-opacity', '0');

  // Transition nodes to their new position.
  const nodeUpdate = node.transition()
    .duration(duration)
    .attr('transform', d => `translate(${d.y},${d.x})`);

  nodeUpdate.select('circle')
    .attr('r', (d) => {
      const ret = levelRadius(d.ogv);
      return (isNaN(ret) ? 2 : ret);
    })
    .style('fill', d => (d.source ? d.source.linkColor : d.linkColor))
    .style('fill-opacity', (d) => {
      const ret = ((d.depth + 1) / 5);
      return ret;
    });


  nodeUpdate.select('text')
    .style('fill-opacity', 1);

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node.exit().transition()
    .duration(duration)
    .attr('transform', () => `translate(${source.y},${source.x})`)
    .remove();

  nodeExit.select('circle')
    .attr('r', 1e-6);

  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // Update the links…
  const link = vis.selectAll('path.link')
    .data(tree.links(nodes), d => d.target.id);

  let rootCounter = 0;

  // Enter any new links at the parent's previous position.
  link.enter().insert('svg:path', 'g')
    .attr('class', 'link')
    .attr('d', (d) => {
      if (Number(d.target.ogv) > 0) {
        const o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      }
      return null;
    })
    .style('stroke', (d) => {
      if (d.source.depth === 0) {
        rootCounter += 1;
        return (d.source.children[rootCounter - 1].linkColor);
      }

      return (d.source) ? d.source.linkColor : d.linkColor;
    })
    .style('stroke-width', (d) => {
      const ret = levelRadius(d.target.ogv) * 2;
      return (isNaN(ret) ? 4 : ret);
    })
    .style('stroke-opacity', (d) => {
      let ret = ((d.source.depth + 1) / 4.5);
      if (d.target.ogv <= 0) ret = 0;
      return ret;
    })
    .style('stroke-linecap', 'round')
    .transition()
    .duration(duration);
  //      .attr('d', diagonal);


  // Transition links to their new position.
  const linkUpdate = link.transition()
    .duration(duration)
    .attr('d', diagonal);

  linkUpdate
    .style('stroke-width', (d) => {
      const ret = levelRadius(Number(d.target.ogv)) * 2;
      return (isNaN(ret) ? 4 : ret);
    })
    .style('stroke-opacity', (d) => {
      let ret = ((d.source.depth + 1) / 4.5);
      if (d.target.ogv <= 0) ret = 0;
      return ret;
    });
  //    .style('stroke-dasharray', function(d) {
  //       var ret=(d.target.ogv > 0) ? '' : '5,8';
  //       return ret;
  //    })


  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr('d', diagonal)
    .remove();

  // Stash the old positions for transition.
  nodes.forEach((d) => {
    const myD = d;
    myD.x0 = d.x;
    myD.y0 = d.y;
    return myD;
  });
}
function nodeOnMouseOver(d) {
  toolTip.transition()
    .duration(200)
    .style('opacity', '.9');
  header.text(`${d.properName.first} ${d.properName.last}`);
  toolTip.style('left', `${d3.event.pageX + 15}px`)
    .style('top', `${d3.event.pageY - 75}px`);
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
      root.values = nest;
      root.x0 = h / 2;
      root.y0 = 0;
      // Initialize the display to show a few nodes.
      root.values.forEach(toggleAll);
      const nodes = tree.nodes(root).reverse();
      tree.children(d => d.children);
      update(root);
      console.log(nest);
      console.log(colors + vis + diagonal + formatNumber + nodes + levelRadius);
    },
  },
};
</script>

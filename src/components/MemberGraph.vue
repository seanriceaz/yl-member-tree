<template>
  <div>
    <h2>Your Member Tree {{memberID}}</h2>
    <svg v-bind:width="settings.width" v-bind:height="settings.height" style="transform: rotate(135deg)">

    <!-- In contrast to D3’s "select" methods, we define the graphical elements explicitely here
    and use the template syntax to loop through collections and bind properties
    such as "d" or "r" to those elements. -->

        <transition-group tag="g" name="line" >

        <!-- Links are represented as paths -->

        <path v-for="link in links" class="link"
        v-bind:key="link.id"
        v-bind:d="link.d"
        v-bind:style="link.style"></path>

      </transition-group>


      <!-- We can now also use events to elements that will
      call respective methods on the Vue instance -->

      <transition-group tag="g" name="list">
        <g class="node"
        v-on:click="select(index, node)" v-for="(node, index) in nodes"
        v-bind:key="node.id" v-bind:style="node.style"
        v-bind:class="[node.className, {'highlight': node.highlight}]">

          <!-- Circles for each node -->

          <circle v-bind:r="node.r"
          v-bind:style="{'fill': index == selected ? '#ff0000' : '#bfbfbf'}">
          </circle>

          <!-- Finally, text labels -->

          <text v-bind:dx="node.textpos.x"
          v-bind:dy="node.textpos.y"
          v-bind:style="node.textStyle">
          {{ node.text }}
          </text>

        </g>
      </transition-group>
    </svg>
  </div>
</template>
<script>

const d3 = Object.assign(
  {},
  require('d3'),
  require('d3-array'),
  require('d3-collection'),
  require('d3-color'),
  require('d3-format'),
  require('d3-interpolate'),
  require('d3-hierarchy'),
  require('d3-scale'),
  require('d3-selection'),
);
// require("d3-geo-projection"));

// const toolTip = d3.select(document.getElementById('toolTip'));
// const header = d3.select(document.getElementById('head'));
// const tree = d3.tree(); // d3.layout.tree()?
// // Settings for the Tree layout
// const m = [0, 60, 0, 60]; // Margins
// const w = 900 - m[1] - m[3]; // Width
// const h = 900 - m[0] - m[2]; // Height
// // Color palette
const diameter = window.innerWidth;
const colors = ['#D5252F', '#E96B38', '#F47337', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF'];

// const diagonal = d3.line()
//   .x(d => d.x)
//   .y(d => d.y)
//   .curve(d3.curveLinear);
// const vis = d3.select('#graph').append('svg:svg')
//   .attr('width', w + m[1] + m[3])
//   .attr('height', h + m[0] + m[2])
//   .append('svg:g')
//   .attr('transform', `translate(${m[3]},${m[0]})`);
// const formatNumber = d3.format(',.3f');
const levelMax = 6000;
const levelRadius = d3.scaleSqrt()
  .domain([0, levelMax])
  .range([1, 40]);

function unflatten(obj, rootID) {
  const myTree = obj[rootID];
  const children = [];
  const keys = Object.keys(obj).filter(child => (obj[child].sponsorid === myTree.customerid));
  for (let i = 0; i < keys.length; i += 1) {
    children[i] = obj[keys[i]];
  }
  // array.filter(child => (child.sponsorid === myParent.customerid));
  if (children.length > 1) {
    for (let j = 0; j < children.length; j += 1) {
      children[j] = unflatten(obj, children[j].customerid);
    }
    myTree.children = children;
  }
  return myTree;
}

function radialPointStringNoPx(x, y) {
  return `${y * Math.cos(x) + diameter / 2},${y * Math.sin(x) + diameter / 2}`;
}
function radialPointString(x, y) {
  return `${y * Math.cos(x) + diameter / 2}px, ${y * Math.sin(x) + diameter / 2}px`;
}
// function toggle(d) {
//   const myD = d;
//   if (d.children) {
//     myD.XXchildren = d.children;
//     myD.children = null;
//   } else {
//     myD.children = d.XXchildren;
//     myD.XXchildren = null;
//   }
//   return myD;
// }

// function toggleAll(d) {
//   const myD = d;
//   if (d.values && d.values.actuals) {
//     myD.values.actuals.forEach(toggleAll);
//     return toggle(myD);
//   }
//   if (d.values) {
//     myD.values.forEach(toggleAll);
//     return toggle(myD);
//   }
//   return myD;
// }

// function nodeOnMouseOver(d) {
//   toolTip.transition()
//     .duration(200)
//     .style('opacity', '.9');
//   header.text(`${d.properName.first} ${d.properName.last}`);
//   toolTip.style('left', `${d3.event.pageX + 15}px`)
//     .style('top', `${d3.event.pageY - 75}px`);
// }

// function update(source) {
//   const duration = d3.event && d3.event.altKey ? 5000 : 500;
//   let nodes = {};
//   root = d3.hierarchy(source);
//   tree(root);
//   nodes = root.descendants();
//   let depthCounter = 0;

//   // Normalize for fixed-depth.
//   nodes.forEach((d) => {
//     const myD = d;
//     myD.y = d.depth * 180;
//     myD.numChildren = (d.children) ? d.children.length : 0;

//     if (d.depth === 1) {
//       if (depthCounter < colors.length) {
//         myD.linkColor = colors[depthCounter];
//       } else {
//         myD.linkColor = colors[(depthCounter % (colors.length - 1))];
//       }
//       depthCounter += 1;
//     }

//     if (d.numChildren === 0 && d.XXchildren) {
//       myD.numChildren = myD.XXchildren.length;
//     }
//     return myD;
//   });

//   // Set link colors
//   nodes.forEach((d) => {
//     let obj = d;
//     const myD = d;

//     while ((obj.source && obj.source.depth > 1) || obj.depth > 1) {
//       obj = (obj.source) ? obj.source.parent : obj.parent;
//     }

//     myD.linkColor = (obj.source) ? obj.source.linkColor : obj.linkColor;
//     return myD;
//   });

//   // Update the nodes…
//   const node = vis.selectAll('g.node')
//     .data(nodes, d => d.id || (d.id)); // Previously had some I variable.

//   // Enter any new nodes at the parent's previous position.
//   const nodeEnter = node.enter().append('svg:g')
//     .attr('class', 'node')
//     .attr('transform', () => `translate(${source.y0},${source.x0})`)
//     .on('click', (d) => {
//       if (d.numChildren > 50) {
//         // eslint-disable-next-line
//         alert(`${d.key} has too many departments (${d.numChildren}) to view at once.`);
//       } else {
//         toggle(d);
//         update(d);
//       }
//     });

//   nodeEnter.append('svg:circle')
//     .attr('r', 1e-6)
//     .on('mouseover', (d) => { nodeOnMouseOver(d); })
//     .on('mouseout', () => { // when the mouse leaves a circle, do the following
//       toolTip.transition() // declare the transition properties to fade-out the div
//         .duration(500) // it shall take 500ms
//         .style('opacity', 0); // and go all the way to an opacity of nil
//     })
//     .style('fill', d => (d.source ? d.source.linkColor : d.linkColor))
//     .style('fill-opacity', '.8')
//     .style('stroke', d => (d.source ? d.source.linkColor : d.linkColor));


//   nodeEnter.append('svg:text')
//     .attr('x', d => (d.children || d.XXchildren ? -10 : 10))
//     .attr('dy', '.35em')
//     .attr('text-anchor',
//       d => (d.children || d.XXchildren ? 'end' : 'start'))
//     .text((d) => {
//       let ret = (d.depth === 4) ? d.Level4 : d.key;
//       ret = (String(ret).length > 25) ? `${String(ret).substr(0, 22)}...` : ret;
//       return ret;
//     })
//     .on('mouseover', (d) => { nodeOnMouseOver(d); })
//     .on('mouseout', () => { // when the mouse leaves a circle, do the following
//       toolTip.transition() // declare the transition properties to fade-out the div
//         .duration(500) // it shall take 500ms
//         .style('opacity', 0); // and go all the way to an opacity of nil
//     })
//     .style('fill-opacity', '0');

//   // Transition nodes to their new position.
//   const nodeUpdate = node.transition()
//     .duration(duration)
//     .attr('transform', d => `translate(${d.y},${d.x})`);

//   nodeUpdate.select('circle')
//     .attr('r', (d) => {
//       const ret = levelRadius(d.ogv);
//       return (Number.isNaN(ret) ? 2 : ret);
//     })
//     .style('fill', d => (d.source ? d.source.linkColor : d.linkColor))
//     .style('fill-opacity', (d) => {
//       const ret = ((d.depth + 1) / 5);
//       return ret;
//     });


//   nodeUpdate.select('text')
//     .style('fill-opacity', 1);

//   // Transition exiting nodes to the parent's new position.
//   const nodeExit = node.exit().transition()
//     .duration(duration)
//     .attr('transform', () => `translate(${source.y},${source.x})`)
//     .remove();

//   nodeExit.select('circle')
//     .attr('r', 1e-6);

//   nodeExit.select('text')
//     .style('fill-opacity', 1e-6);

//   // Update the links…
//   const link = vis.selectAll('path.link')
//     .data(root.links(nodes), d => d.target.id);

//   let rootCounter = 0;

//   // Enter any new links at the parent's previous position.
//   link.enter().insert('svg:path', 'g')
//     .attr('class', 'link')
//     .attr('d', (d) => {
//       if (Number(d.target.ogv) > 0) {
//         const o = { x: source.x0, y: source.y0 };
//         return diagonal({ source: o, target: o });
//       }
//       return null;
//     })
//     .style('stroke', (d) => {
//       if (d.source.depth === 0) {
//         rootCounter += 1;
//         return (d.source.children[rootCounter - 1].linkColor);
//       }

//       return (d.source) ? d.source.linkColor : d.linkColor;
//     })
//     .style('stroke-width', (d) => {
//       const ret = levelRadius(d.target.ogv) * 2;
//       return (Number.isNaN(ret) ? 4 : ret);
//     })
//     .style('stroke-opacity', (d) => {
//       let ret = ((d.source.depth + 1) / 4.5);
//       if (d.target.ogv <= 0) ret = 0;
//       return ret;
//     })
//     .style('stroke-linecap', 'round')
//     .transition()
//     .duration(duration);
//   //      .attr('d', diagonal);


//   // Transition links to their new position.
//   const linkUpdate = link.transition()
//     .duration(duration)
//     .attr('d', diagonal);

//   linkUpdate
//     .style('stroke-width', (d) => {
//       const ret = levelRadius(Number(d.target.ogv)) * 2;
//       return (Number.isNaN(ret) ? 4 : ret);
//     })
//     .style('stroke-opacity', (d) => {
//       let ret = ((d.source.depth + 1) / 4.5);
//       if (d.target.ogv <= 0) ret = 0;
//       return ret;
//     });
//   //    .style('stroke-dasharray', function (d) {
//   //       var ret=(d.target.ogv > 0) ? '' : '5,8';
//   //       return ret;
//   //    })


//   // Transition exiting nodes to the parent's new position.
//   link.exit().transition()
//     .duration(duration)
//     .attr('d', diagonal)
//     .remove();

//   // Stash the old positions for transition.
//   nodes.forEach((d) => {
//     const myD = d;
//     myD.x0 = d.x;
//     myD.y0 = d.y;
//     return myD;
//   });
// }

export default {
  name: 'MemberGraph',
  data: () => ({
    memberTree: null,
    selected: null,
    memberID: null,
    members: {},
    settings: {
      width: diameter,
      height: diameter,
      margins: [0, 60, 0, 60],
      colors: ['#D5252F', '#E96B38', '#F47337', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF'],
    },
  }),
  computed: {

    // once we have the CSV loaded, the "root" will be calculated

    root() {
      if (this.members) {
        return this.tree(d3.hierarchy(this.memberTree));
        // return this.tree(d3.stratify(this.members)
        //   .id(d => d.customerid).parentId(d => d.sponsorid));
      }
      return null;
    },

    // the "tree" is also a computed property so that it is always
    // up to date when the width and height settings change

    tree() {
      // Straight left-to-right
      /* return d3
        .cluster()
        .size([this.settings.height, this.settings.width - 160]); */
      // Tree
      return d3
        .tree() // or .cluster() will have a different effect...
        .size([1.5 * Math.PI, diameter / 2 - this.settings.margins[1]]) // radians, radius
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    },

    // Instead of enter, update, exit, we mainly use computed properties
    // and instead of "d3.data()" we can use array.map to create objects
    // that hold class names, styles, and other attributes for each datum

    nodes() {
      if (this.root) {
        return this.root.descendants().map(d => ({
          id: d.data.customerid,
          r: levelRadius(d.data.ogv),
          className: `node${
            d.children ? ' node--internal' : ' node--leaf'}`,
          text: null, // d.properName.first + ' ' + d.properName.last,
          highlight: null, // d.id.toLowerCase().indexOf(that.search.toLowerCase())
          // !== -1 && that.search !== '',
          style: {
            transform: `translate(${radialPointString(d.x, d.y)})`,
          },
          textpos: {
            x: d.children ? -8 : 8,
            y: 3,
          },
          textStyle: {
            textAnchor: d.children ? 'end' : 'start',
          },
        }));
      }
      return null;
    },

    // Instead of enter, update, exit, we mainly use computed properties
    // and instead of "d3.data()" we can use array.map to create objects
    // that hold class names, styles, and other attributes for each datum

    links() {
      if (this.root) {
        // here we’ll calculate the "d" attribute for each path that is
        // then used in the template where we use "v-for" to loop through all of the links
        // to create <path> elements

        return this.root.descendants().slice(1).map(d => ({
          id: d.data.customerid,
          d: `M${radialPointStringNoPx(d.x, d.y)} ${radialPointStringNoPx(d.parent.x, d.parent.y)}`,
          // d: `M${d.y},${d.x}C${d.parent.y + 100},${d.x} ${d.parent.y + 100},${d.parent.x}
          // ${d.parent.y},${d.parent.x}`,

          // here we could of course calculate colors depending on data but for now all
          // links share the same color from the settings object that we can manipulate using
          // UI controls and v-model

          style: {
            stroke: colors[Math.floor(Math.random() * colors.length)],
            strokeWidth: levelRadius(d.data.ogv) * 2, // This might style the descendants...
            fill: 'none',
          },
        }));
      }
      return null;
    },
  },
  methods: {
    RenderGraph(data) {
      let nest = [];
      // Do the rendering!
      this.$data.memberID = data.memberID;
      this.$data.members = data.members.accounts;
      // Create our nested array
      nest = unflatten(data.members.accounts,
        data.memberID);
      // Next we need to plot this on a graph!
      // Initialize the display to show a few nodes.
      // root.descendants.forEach(toggleAll);
      // const nodes = tree.nodes(root).reverse();
      // tree.children(d => d.children);
      // update(nest);
      this.memberTree = nest;
      console.log(nest);
    },
  },
};
</script>

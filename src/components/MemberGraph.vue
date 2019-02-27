<template>
  <div>
    <h2>Your Member Tree {{memberID}}</h2>
    <svg v-bind:width="settings.width" v-bind:height="settings.height"
      style="transform: rotate(135deg)">

    <!-- In contrast to D3’s "select" methods, we define the graphical elements explicitely here
    and use the template syntax to loop through collections and bind properties
    such as "d" or "r" to those elements. -->

        <transition-group tag="g" name="line" >

        <!-- Links are represented as paths -->

        <path v-for="link in links" class="link"
        v-bind:key="link.id"
        v-bind:d="link.d"
        v-bind:style="link.style"
        v-bind:stroke="link.color"
        v-bind:opacity="link.opacity"></path>

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
          v-bind:style="{'fill': index == selected ? '#ff0000' : ''}">
          </circle>

          <!-- Finally, text labels -->

          <text v-if="settings.showNames" v-bind:dx="node.textpos.x"
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
const diameter = window.innerWidth;
const levelRadius = d3.scaleSqrt()
  .domain([0, 6000])
  .range([2, 50]);

function unflatten(obj, rootID) {
  const myTree = obj[rootID];
  const children = [];
  const keys = Object.keys(obj).filter(child => (obj[child].sponsorid === myTree.customerid));
  for (let i = 0; i < keys.length; i += 1) {
    children[i] = obj[keys[i]];
  }
  if (children.length > 1) {
    for (let j = 0; j < children.length; j += 1) {
      children[j] = unflatten(obj, children[j].customerid);
    }
    myTree.children = children;
  }
  return myTree;
}

function getRadX(x, y) {
  return y * Math.cos(x) + diameter / 2;
}
function getRadY(x, y) {
  return y * Math.sin(x) + diameter / 2;
}
function radialPointString(x, y, unit = '') {
  return `${getRadX(x, y)}${unit}, ${getRadY(x, y)}${unit}`;
}

function smoothControls(d) {
  const smoothness = 0.3;
  let cp1 = '';
  let cp2 = '';
  if (d.depth === 1) {
    cp1 = `${((diameter / 2) - getRadX(d.x, d.y)) * smoothness + getRadX(d.x, d.y)}, ${((diameter / 2) - getRadY(d.x, d.y)) * smoothness + getRadY(d.x, d.y)}`;
    cp2 = `${(diameter / 2)}, ${(diameter / 2)}`;
  } else {
    cp1 = `${(getRadX(d.parent.x, d.parent.y) - getRadX(d.x, d.y)) * smoothness + getRadX(d.x, d.y)}, ${(getRadY(d.parent.x, d.parent.y) - getRadY(d.x, d.y)) * smoothness + getRadY(d.x, d.y)}`;
    cp2 = `${(getRadX(d.parent.x, d.parent.y) - getRadX(d.parent.parent.x, d.parent.parent.y)) * smoothness + getRadX(d.parent.x, d.parent.y)}, ${(getRadY(d.parent.x, d.parent.y) - getRadY(d.parent.parent.x, d.parent.parent.y)) * smoothness + getRadY(d.parent.x, d.parent.y)}`;
    if (d.depth === 2) {
      cp2 = `${(getRadX(d.parent.x, d.parent.y) - (diameter / 2)) * smoothness + getRadX(d.parent.x, d.parent.y)}, ${(getRadY(d.parent.x, d.parent.y) - (diameter / 2)) * smoothness + getRadY(d.parent.x, d.parent.y)}`;
    }
  }
  return `${cp1} ${cp2}`;
}

function getLink(d) {
  // Straight line
  // return `M${radialPointString(d.x, d.y)} ${radialPointString(d.parent.x, d.parent.y)}`;
  // Curved line
  return `M${radialPointString(d.x, d.y)} C${smoothControls(d)} ${radialPointString(d.parent.x, d.parent.y)} `;
}

// function nodeOnMouseOver(d) {
//   toolTip.transition()
//     .duration(200)
//     .style('opacity', '.9');
//   header.text(`${d.properName.first} ${d.properName.last}`);
//   toolTip.style('left', `${d3.event.pageX + 15}px`)
//     .style('top', `${d3.event.pageY - 75}px`);
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
      showNames: false,
      color: '#F81894',
    },
  }),
  computed: {

    // once data is loaded, the "root" will be calculated

    root() {
      if (this.members) {
        const myTree = this.tree(d3.hierarchy(this.memberTree));

        // Set our "root" to where we want it.
        myTree.y = diameter / 3;
        myTree.x = Math.PI * 1.75;
        return myTree;
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
          text: `${d.data.properName.first} ${d.data.properName.last}`,
          highlight: null, // d.id.toLowerCase().indexOf(that.search.toLowerCase())
          // !== -1 && that.search !== '',
          style: {
            transform: `translate(${radialPointString(d.x, d.y, 'px')})`,
            fill: this.settings.color,
          },
          textpos: {
            x: d.children ? -8 : 8,
            y: 3,
          },
          textStyle: {
            textAnchor: d.children ? 'end' : 'start',
            transform: `rotate(${d.x * (180 / Math.PI)}deg)`,
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
          d: getLink(d),

          // here we could of course calculate colors depending on data but for now all
          // links share the same color from the settings object that we can manipulate using
          // UI controls and v-model
          color: this.settings.color,
          opacity: 1 / Math.sqrt(d.data.level + 1),
          style: {
            // stroke: colors[Math.floor(Math.random() * colors.length)], // Random

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
      this.$data.levelMax = data.members.accounts[data.memberID].ogv;
      // Create our nested array
      nest = unflatten(data.members.accounts,
        data.memberID);
      this.memberTree = nest;
    },
  },
};
</script>

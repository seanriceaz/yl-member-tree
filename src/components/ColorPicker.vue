<template>
  <div class="input-group color-picker" ref="colorpicker">
    <input type="text" class="form-control" v-model="colorValue"
      @focus="showPicker()" @input="updateFromInput" />
    <span class="input-group-addon color-picker-container">
      <span class="current-color"
        :style="'background-color: ' + colorValue" @click="togglePicker()"></span>
      <chrome-picker :value="colors" @input="updateFromPicker" v-if="displayPicker" />
    </span>
  </div>
</template>
<script>
import VueColor from 'vue-color';

export default {
  name: 'ColorPicker',
  props: ['color'],
  components: {
    'chrome-picker': VueColor.Chrome,
  },
  data() {
    return {
      colors: {
        hex: '#000000',
      },
      colorValue: '',
      displayPicker: false,
    };
  },
  mounted() {
    this.setColor(this.color || '#000000');
  },
  methods: {
    setColor(color) {
      this.updateColors(color);
      this.colorValue = color;
    },
    updateColors(color) {
      if (color.slice(0, 1) === '#') {
        this.colors = {
          hex: color,
        };
      } else if (color.slice(0, 4) === 'rgba') {
        const rgba = color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        // next line removed a bunch of bitwise operatores ( << ) instead of <
        const hex = `#${((1 < 24) + (parseInt(rgba[0], 10) < 16) + (parseInt(rgba[1], 10) < 8) + parseInt(rgba[2], 10)).toString(16).slice(1)}`;
        this.colors = {
          hex,
          a: rgba[3],
        };
      }
    },
    showPicker() {
      document.addEventListener('click', this.documentClick);
      this.displayPicker = true;
    },
    hidePicker() {
      document.removeEventListener('click', this.documentClick);
      this.displayPicker = false;
    },
    togglePicker() {
      this.displayPicker = this.displayPicker ? this.hidePicker() : this.showPicker();
    },
    updateFromInput() {
      this.updateColors(this.colorValue);
    },
    updateFromPicker(color) {
      this.colors = color;
      if (color.rgba.a === 1) {
        this.colorValue = color.hex;
      } else {
        this.colorValue = `rgba(${color.rgba.r},${color.rgba.g},${color.rgba.b},${color.rgba.a})`;
      }
    },
    documentClick(e) {
      const el = this.$refs.colorpicker;
      const { target } = e;
      if (el !== target && !el.contains(target)) {
        this.hidePicker();
      }
    },
  },
  watch: {
    colorValue(val) {
      if (val) {
        this.updateColors(val);
        this.$emit('input', val);
      }
    },
  },
};
</script>
<style scoped>
.vc-chrome {
  position: absolute;
  top: 35px;
  right: 0;
  z-index: 9;
}
.current-color {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: #000;
  cursor: pointer;
}
</style>

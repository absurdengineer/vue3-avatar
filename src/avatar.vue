<template>
  <div class="container">
    <img
      :style="imageStyle"
      :height="size"
      :width="size"
      v-if="showImage()"
      :src="imageSrc"
      :alt="displayName"
      @error="imageError = true"
    />
    <div
      v-else
      :style="avatarStyle"
      class="avatar noselect"
    >
      {{ displayName }}
    </div>
    <div
      v-if="status"
      class="status-indicator"
      :style="statusStyle"
    >
  </div>
  </div>
</template>

<script>
const lightColors = [
  "#F0F8FF",
  "#FAEBD7",
  "#00FFFF",
  "#7FFFD4",
  "#F0FFFF",
  "#F5F5DC",
  "#FFE4C4",
  "#FFEBCD",
  "#DEB887",
  "#5F9EA0",
  "#7FFF00",
  "#D2691E",
  "#FF7F50",
  "#6495ED",
  "#FFF8DC",
  "#00FFFF",
  "#B8860B",
  "#A9A9A9",
  "#A9A9A9",
  "#BDB76B",
  "#FF8C00",
  "#E9967A",
  "#8FBC8F",
  "#00CED1",
  "#FF1493",
  "#00BFFF",
  "#1E90FF",
  "#FFFAF0",
  "#FF00FF",
  "#DCDCDC",
  "#F8F8FF",
  "#FFD700",
  "#DAA520",
  "#808080",
  "#808080",
  "#ADFF2F",
  "#F0FFF0",
  "#FF69B4",
  "#CD5C5C",
  "#FFFFF0",
  "#F0E68C",
  "#E6E6FA",
  "#FFF0F5",
  "#7CFC00",
  "#FFFACD",
  "#ADD8E6",
  "#F08080",
  "#E0FFFF",
  "#FAFAD2",
  "#D3D3D3",
  "#D3D3D3",
  "#90EE90",
  "#FFB6C1",
  "#FFA07A",
  "#20B2AA",
  "#87CEFA",
  "#B0C4DE",
  "#FFFFE0",
  "#00FF00",
  "#32CD32",
  "#FAF0E6",
  "#FF00FF",
  "#66CDAA",
  "#BA55D3",
  "#9370D8",
  "#3CB371",
  "#7B68EE",
  "#00FA9A",
  "#48D1CC",
  "#F5FFFA",
  "#FFE4E1",
  "#FFE4B5",
  "#FFDEAD",
  "#FDF5E6",
  "#FFA500",
  "#FF4500",
  "#DA70D6",
  "#EEE8AA",
  "#98FB98",
  "#AFEEEE",
  "#D87093",
  "#FFEFD5",
  "#FFDAB9",
  "#CD853F",
  "#FFC0CB",
  "#DDA0DD",
  "#B0E0E6",
  "#FF0000",
  "#BC8F8F",
  "#FA8072",
  "#F4A460",
  "#FFF5EE",
  "#C0C0C0",
  "#87CEEB",
  "#FFFAFA",
  "#00FF7F",
  "#D2B48C",
  "#D8BFD8",
  "#FF6347",
  "#40E0D0",
  "#EE82EE",
  "#F5DEB3",
  "#FFFFFF",
  "#F5F5F5",
  "#FFFF00",
  "#9ACD32",
];
const darkColors = [
  "#000000",
  "#0000FF",
  "#8A2BE2",
  "#A52A2A",
  "#DC143C",
  "#00008B",
  "#008B8B",
  "#006400",
  "#8B008B",
  "#556B2F",
  "#9932CC",
  "#8B0000",
  "#483D8B",
  "#2F4F4F",
  "#2F4F4F",
  "#9400D3",
  "#696969",
  "#696969",
  "#B22222",
  "#228B22",
  "#008000",
  "#4B0082",
  "#800000",
  "#0000CD",
  "#C71585",
  "#191970",
  "#000080",
  "#808000",
  "#6B8E23",
  "#800080",
  "#4169E1",
  "#8B4513",
  "#2E8B57",
  "#A0522D",
  "#6A5ACD",
  "#708090",
  "#708090",
  "#4682B4",
  "#008080",
];
const BORDERCOLORS = {
  ONLINE: "green",
  OFFLINE: "grey",
  AWAY: "orange",
  BUSY: "red",
};
export default {
  name: "Avatar",
  props: {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
    },
    background: {
      type: String,
    },
    size: {
      type: Number,
      default: 40,
    },
    inverted: {
      type: Boolean,
      default: false,
    },
    inline: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: true,
    },
    imageSrc: {
      type: String,
    },
    border: {
      type: Boolean,
      default: true,
    },
    borderColor: {
      type: String,
      default: "white",
    },
    customAvatarStyle: {
      type: Object,
      default: () => ({}), 
    },
    status: {
      type: String,
      default: null,
      validator: function (value) {
        return ["away", "online", "offline", "busy"].includes(value);
      },
    },
    customStatusStyle: {
      type: Object,
      default: () => ({}), 
    },
    sameBorder: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      imageError: false,
    };
  },
  computed: {
    statusStyle() {
      const defaultStatusStyle = {
        height: `${this.size / 4}px`,
        width: `${this.size / 4}px`,
        backgroundColor: this.statusBackgroundColor,
        border: `${this.size / 30}px solid ${this.sameBorder ? this.borderColor : 'white'}`,
      };
      return Object.assign({}, defaultStatusStyle, this.customStatusStyle);
    },
    imageStyle() {
      const defaultImageStyle = {
        display: this.inline ? 'inline-flex' : 'flex',
        borderRadius: this.rounded ? '50%' : '0',
        margin: 0,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        border: this.border ? `${this.size / 20}px solid ${this.borderColor}` : 'none',
      };
      return Object.assign({}, defaultImageStyle, this.customAvatarStyle);
    },
    avatarStyle(){
      const defaultAvatarStyle = {
        color: this.displayColor,
        width: this.size + 'px',
        height: this.size + 'px',
        fontSize: this.fontSize + 'px',
        background: this.displayBackground,
        display: this.inline && 'inline-flex',
        borderRadius: this.rounded && '50%',
        border: this.border && `${this.size / 20}px solid ${this.borderColor}`,
      };
      return Object.assign({}, defaultAvatarStyle, this.customAvatarStyle);
    },
    fontSize() {
      const size = this.size || 40;
      if (this.displayName.length == 1) return size / 2;
      else if (this.displayName.length == 2) return size / 2.5;
      if (this.displayName.length == 3) return size / 3;
      else return 14;
    },
    displayName() {
      let words = this.name.trim().split(/[- ]/);
      words = words.filter((word) => word !== "");
      if (words.length >= 3)
        return (
          words[0][0].toUpperCase() +
          words[1][0].toUpperCase() +
          words[words.length - 1][0].toUpperCase()
        );
      else if (words.length == 2)
        return words[0][0].toUpperCase() + words[1][0].toUpperCase();
      else if (words.length == 1) return words[0][0].toUpperCase();
      else return "";
    },
    displayBackground() {
      return this.background
        ? this.background
        : this.inverted
        ? this.lightColor
        : this.darkColor;
    },
    displayColor() {
      return this.color
        ? this.color
        : this.inverted
        ? this.darkColor
        : this.lightColor;
    },
    asciiValue() {
      const username = this.name.trim();
      let ascii = 0;
      for (let index = 0; index < username.length; index++)
        ascii += username.charCodeAt(index);
      return ascii;
    },
    darkColor() {
      return darkColors[this.asciiValue % darkColors.length];
    },
    lightColor() {
      return lightColors[this.asciiValue % lightColors.length];
    },
    statusBackgroundColor() {
      let color;
      switch (this.status.toLowerCase()) {
        case "away":
          color = BORDERCOLORS.AWAY;
          break;
        case "online":
          color = BORDERCOLORS.ONLINE;
          break;
        case "offline":
          color = BORDERCOLORS.OFFLINE;
          break;
        default:
          color = BORDERCOLORS.BUSY;
      }
      return color;
    },
  },
  methods: {
    showImage() {
      return this.imageSrc && !this.imageError;
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Domine:wght@700&display=swap");
.avatar {
  font-family: "Domine", serif;
  color: white;
  background: navy;
  font-size: 14px;
  width: 45px;
  height: 45px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}
.container {
  position:relative;
}
.status-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 50%;
}
</style>

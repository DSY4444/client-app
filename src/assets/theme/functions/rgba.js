// import hexToRgb from "assets/theme/functions/hexToRgb";
import hexToRgb from "./hexToRgb";

function rgba(color, opacity) {
  return `rgba(${hexToRgb(color)}, ${opacity})`;
}

export default rgba;

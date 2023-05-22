import { ColorResult, SketchPicker } from "react-color";
import { useRecoilState } from "recoil";
import { colorValue } from "./atom";

function ColorPicker() {
  const [color, setColor] = useRecoilState<any>(colorValue);
  const handleColorChange = (newColor: ColorResult) => {
    if (!newColor) {
      return;
    }
    setColor(newColor.hex);
    setColor({
      r: newColor.rgb.r,
      g: newColor.rgb.g,
      b: newColor.rgb.b,
      hex: newColor.hex,
    });
  };
  return (
    <div>
      <SketchPicker color={color.hex} onChange={handleColorChange} />
    </div>
  );
}

export default ColorPicker;

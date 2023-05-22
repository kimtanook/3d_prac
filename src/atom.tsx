import { atom } from "recoil";
import { v4 as uuidv4 } from "uuid";

export const modelValue = atom({
  key: `modelValue${uuidv4()}`,
  default: "",
});

export const colorValue = atom<any>({
  key: `colorValue${uuidv4()}`,
  default: { r: 255, g: 255, b: 255, hex: "#FFFFFF" },
});

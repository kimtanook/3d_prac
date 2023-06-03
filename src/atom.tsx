import { atom } from "recoil";
import { v4 as uuidv4 } from "uuid";

export const modelValue = atom({
  key: `modelValue${uuidv4()}`,
  default: "",
});

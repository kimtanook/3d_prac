import { useRecoilState } from "recoil";
import { styled } from "styled-components";
import { modelValue } from "../atom";

function Menu() {
  const [modelPath, setModelPath] = useRecoilState(modelValue);
  return (
    <Wrap>
      <button onClick={() => setModelPath("/building/scene.gltf")}>건물</button>
      <button onClick={() => setModelPath("/city/scene.gltf")}>도시</button>
      <button onClick={() => setModelPath("/city2/scene.gltf")}>도시2</button>
    </Wrap>
  );
}

export default Menu;

const Wrap = styled.div`
  position: absolute;
`;

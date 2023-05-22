import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ColorPicker from "./ColorPicker";
import { colorValue, modelValue } from "./atom";

function Model() {
  // 3D 모델을 보여줄 ref
  const containerRef = useRef<HTMLDivElement>(null);
  // 3D 모델의 경로
  const [modelPath, setModelPath] = useRecoilState(modelValue);
  const [selectColor, setselectColor] = useRecoilState(colorValue);
  // 컨트롤러, 조명의 속성값들을 동적으로 조작하기 위한 state
  const [controlsState, setControls] = useState<OrbitControls | null>(null);
  const [lightState, setLightState] = useState<THREE.DirectionalLight | null>(
    null
  );
  console.log("lightState : ", lightState);
  // 우클릭 조작에 관한 state
  const [panEnabled, setPanEnabled] = useState(true);
  // 자동회전에 관한 state
  const [rotateEnabled, setRotateEnabled] = useState(false);

  // 씬 생성
  let scene = new THREE.Scene();

  // 렌더러 설정
  let renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 800);

  // 카메라 설정
  let camera = new THREE.PerspectiveCamera(30, 1);
  camera.position.set(0, 0, 10);

  // OrbitControls 기본 값 생성
  const controls = new OrbitControls(camera, renderer.domElement);

  // 모델을 로드하고 렌더링하는 함수
  const loadModel = () => {
    if (!modelPath) {
      return;
    }
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.firstChild.remove();
      }
      setModelPath("");
    }

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    const loader = new GLTFLoader();

    loader.load(
      // 모델의 경로
      modelPath,
      // 로드가 완료되었을 때의 콜백 함수
      (gltf: GLTF) => {
        // 로드된 모델의 씬을 가져옴
        scene.add(gltf.scene);

        // 조명 추가
        const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
        directionalLight.position.set(10000, 200, -1000);
        scene.add(directionalLight);
        setLightState(directionalLight);

        // 모델 크기 조정
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3 / maxDim;
        scene.scale.multiplyScalar(scaleFactor);
        scene.position.sub(center.multiplyScalar(scaleFactor));

        // 렌더링 루프 함수
        const animate = () => {
          requestAnimationFrame(animate);
          if (renderer && scene && camera) {
            controls.update(); // OrbitControls 업데이트
            renderer.render(scene, camera);
          }
        };

        // 모델 로드 후 렌더링 루프 시작
        animate();
        // OrbitControls의 속성값들을 동적으로 관리하기 위한 setState
        setControls(controls);
      }
    );
  };

  // Pan 기능 활성화/비활성화 함수
  const togglePan = () => {
    setPanEnabled((prevPanEnabled) => !prevPanEnabled);
    if (controlsState) {
      controlsState.enablePan = !panEnabled;
    }
  };
  // 자동회전 활성화/비활성화 함수
  const toggleRotate = () => {
    setRotateEnabled((prevPanRotate) => !prevPanRotate);
    if (controlsState) {
      controlsState.autoRotate = !rotateEnabled;
    }
  };
  const changeColor = () => {
    if (lightState) {
      lightState.color.r = selectColor.r;
      lightState.color.g = selectColor.g;
      lightState.color.b = selectColor.b;
    }
  };

  useEffect(() => {
    loadModel();

    // 컴포넌트가 언마운트될 때 Three.js 리소스 정리
    return () => {
      if (renderer) {
        console.log("언마운트");
        renderer.dispose();
      }
    };
  }, [modelPath]);

  return (
    <div>
      <ColorPicker />
      <button onClick={() => setModelPath("/building/scene.gltf")}>건물</button>
      <button onClick={() => setModelPath("/shiba/scene.gltf")}>강아지</button>
      <button onClick={togglePan}>
        {panEnabled ? "우클릭 조작 비활성화" : "우클릭 조작 활성화"}
      </button>
      <button onClick={toggleRotate}>
        {rotateEnabled ? "자동회전 비활성화" : "자동회전 활성화"}
      </button>
      <button onClick={changeColor}>조명적용</button>

      <div ref={containerRef}></div>
    </div>
  );
}

export default Model;

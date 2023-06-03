import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { modelValue } from "./atom";

function Model() {
  // 3D 모델을 보여줄 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D 모델의 경로
  const [modelPath, setModelPath] = useRecoilState(modelValue);

  // 조명 x좌표
  const [xPosition, setXPosition] = useState(5000);

  // 조명 y좌표
  const [yPosition, setYPosition] = useState(10000);

  // 조명 z좌표
  const [zPosition, setZPosition] = useState(1);

  // 컨트롤러, 조명의 속성값들을 동적으로 조작하기 위한 state
  const [controlsState, setControlsState] = useState<OrbitControls | null>(
    null
  );
  const [lightState, setLightState] = useState<THREE.DirectionalLight | null>(
    null
  );

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

    // 그림자맵 활성화
    renderer.shadowMap.enabled = true;

    // 그림자가 길게 나오도록 설정
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const loader = new GLTFLoader();

    loader.load(
      // 모델의 경로
      modelPath,
      // 로드가 완료되었을 때의 콜백 함수
      (gltf: GLTF) => {
        // 로드된 모델의 씬을 가져옴
        scene.add(gltf.scene);

        // 전체적인 조명 추가
        const ambientLight = new THREE.AmbientLight("#ffffff", 0.05);
        scene.add(ambientLight);

        // 특정 좌표에서 비추는 조명과 그림자 추가
        const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
        directionalLight.position.set(xPosition, yPosition, zPosition); // 조명 위치 (x, y, z)
        directionalLight.castShadow = true; // 그림자 유무
        directionalLight.shadow.mapSize.width = 2048; // 그림자 해상도
        directionalLight.shadow.mapSize.height = 2048; // 그림자 해상도
        directionalLight.shadow.camera.near = 1; // 그림자 카메라의 near 클리핑 평면
        directionalLight.shadow.camera.far = 10000; // 그림자 카메라의 far 클리핑 평면
        scene.add(directionalLight);

        gltf.scene.traverse(function (object: any) {
          if (object.isMesh) {
            // 모델에 그림자 속성 적용
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });

        // 모델 크기 조정
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3 / maxDim;
        scene.scale.multiplyScalar(scaleFactor);
        scene.position.sub(center.multiplyScalar(scaleFactor));

        // OrbitControls, DirectionalLight의 속성값들을 동적으로 관리하기 위한 setState
        setControlsState(controls);
        setLightState(directionalLight);

        // 렌더링 루프
        const animate = () => {
          requestAnimationFrame(animate);
          if (renderer && scene && camera) {
            controls.update(); // OrbitControls 업데이트
            renderer.render(scene, camera);
          }
        };

        // 모델 로드 후 렌더링 루프 시작
        animate();
      }
    );
  };

  // Pan 기능 활성화/비활성화
  const togglePan = () => {
    setPanEnabled((prevPanEnabled) => !prevPanEnabled);
    if (controlsState) {
      controlsState.enablePan = !panEnabled;
    }
  };

  // 자동회전 활성화/비활성화
  const toggleRotate = () => {
    setRotateEnabled((prevPanRotate) => !prevPanRotate);
    if (controlsState) {
      controlsState.autoRotate = !rotateEnabled;
    }
  };

  // 조명위치 조작
  const xLightPosition = (value: number | number[]) => {
    if (lightState) {
      const xValue = Array.isArray(value) ? value[0] : value;
      setXPosition(xValue);
      lightState.position.set(
        xPosition,
        lightState.position.y,
        lightState.position.z
      );
    }
  };

  // 카메라 위치 리샛
  const resetCamera = () => {
    if (controlsState) {
      controlsState.reset();
    }
  };

  useEffect(() => {
    loadModel();

    // 컴포넌트가 언마운트될 때 Three.js 리소스 정리
    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [modelPath]);

  return (
    <div>
      <div
        style={{
          width: 500,
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 10,
        }}
      >
        x축 조명 : {xPosition} {xPosition === 5000 ? "(기본값)" : null}
        <Slider
          min={-10000}
          max={10000}
          defaultValue={xPosition}
          step={100}
          onChange={xLightPosition}
        />
      </div>
      <button onClick={() => setModelPath("/building/scene.gltf")}>건물</button>
      <button onClick={() => setModelPath("/city/scene.gltf")}>도시</button>
      <button onClick={() => setModelPath("/city2/scene.gltf")}>도시2</button>
      <button onClick={togglePan}>
        {panEnabled ? "우클릭 조작 비활성화" : "우클릭 조작 활성화"}
      </button>
      <button onClick={toggleRotate}>
        {rotateEnabled ? "자동회전 비활성화" : "자동회전 활성화"}
      </button>

      <button onClick={resetCamera}>카메라위치리셋</button>

      <div ref={containerRef}></div>
    </div>
  );
}

export default Model;

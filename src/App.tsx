import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;

    // 모델을 로드하고 렌더링하는 함수
    const loadModel = () => {
      // 렌더러 설정
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);

      // 카메라 설정
      camera = new THREE.PerspectiveCamera(30, 1);
      camera.position.set(0, 0, 10);

      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }

      const loader = new GLTFLoader();

      loader.load(
        // 모델의 경로
        "/building/scene.gltf",
        // 로드가 완료되었을 때의 콜백 함수
        (gltf: GLTF) => {
          // 로드된 모델의 씬을 가져옴
          scene = gltf.scene.children[0] as THREE.Scene;

          // OrbitControls 생성
          controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.screenSpacePanning = false;
          controls.minDistance = 1;
          controls.maxDistance = 100;
          controls.maxPolarAngle = Math.PI / 2;

          // 조명 추가
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight.position.set(1, 1, 1).normalize();
          scene.add(directionalLight);

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
              renderer.render(scene, camera);
            }
          };

          // 모델 로드 후 렌더링 루프 시작
          animate();
        }
      );
    };

    loadModel();

    // 컴포넌트가 언마운트될 때 Three.js 리소스 정리
    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return <div ref={containerRef}></div>;
};

export default App;

import './App.css';
import CMDLoginPopup from './Component/Login/CMDLoginPopup';
import CMDNicknamePopup from './Component/Nickname/CMDNicknamePopup';
import CMDLog from './Component/LogWindow/CMDLog';
import LoginSuccess from './app/login/LoginSuccess';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import * as THREE from 'three';

function App() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
    document.body.appendChild(renderer.domElement);

    // 별 생성
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 유성 이미지 텍스처 로드
    const textureLoader = new THREE.TextureLoader();
    const meteorTexture = textureLoader.load('./myloglogo.png'); // 유성 텍스처

    // 유성 추가
    const meteors = [];

    const createMeteor = () => {
      const meteorGeometry = new THREE.PlaneGeometry(1, 1); // 유성 크기
      const meteorMaterial = new THREE.MeshBasicMaterial({
        map: meteorTexture,
        transparent: true,
      });
      const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);

      // 카메라 앞에서 생성
      const startX = Math.random() * 50 - 25; // 화면 가로 랜덤 위치
      const startY = Math.random() * 30 - 15; // 화면 세로 랜덤 위치
      const startZ = 5; // 카메라 앞쪽 위치
      meteor.position.set(startX, startY, startZ);

      // 유성 속도 (카메라를 벗어나 뒤로 이동)
      const velocity = new THREE.Vector3(
        0, // 가로 이동 없음
        0, // 세로 이동 없음
        -0.1 // 카메라 뒤로 이동
      );

      meteors.push({ mesh: meteor, velocity });
      scene.add(meteor);
    };

    setInterval(createMeteor, 3000); // 2초마다 유성 생성

    // 카메라 위치
    camera.position.z = 1;

    const animate = () => {
      requestAnimationFrame(animate);

      // 별 회전
      stars.rotation.x += 0.0005;
      stars.rotation.y += 0.0005;

      // 유성 이동
      meteors.forEach((meteor, index) => {
        meteor.mesh.position.add(meteor.velocity);

        // 유성이 화면에서 사라지면 제거
        if (meteor.mesh.position.z < -100) {
          scene.remove(meteor.mesh);
          meteors.splice(index, 1); // 화면을 벗어난 유성 제거
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CMDLog />} />
          <Route path="/login" element={<CMDLoginPopup />} />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/nickname" element={<CMDNicknamePopup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

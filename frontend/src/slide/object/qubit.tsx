import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './qubit.scss';

interface QubitProps {
  isVisible: boolean;
}

const Qubit: React.FC<QubitProps> = ({ isVisible }) => {
  const [bitState, setBitState] = useState(0); // 0 or 1
  const [qubitAlpha, setQubitAlpha] = useState(1); // |0⟩ 상태 계수
  const [qubitBeta, setQubitBeta] = useState(0); // |1⟩ 상태 계수
  const [isMeasured, setIsMeasured] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const stateVectorRef = useRef<THREE.ArrowHelper | null>(null);
  const waveRingsRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // 큐비트 상태 정규화
  const normalizeQubit = (alpha: number, beta: number) => {
    const norm = Math.sqrt(alpha * alpha + beta * beta);
    return norm > 0 ? { alpha: alpha / norm, beta: beta / norm } : { alpha: 1, beta: 0 };
  };

  // 3D 블로흐 구면 초기화
  const initBlochSphere = () => {
    if (!mountRef.current) return;

    // 씬 생성
    const scene = new THREE.Scene();
    scene.background = null; // 투명 배경
    sceneRef.current = scene;

    // 카메라 생성
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 렌더러 생성
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(480, 480);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 블로흐 구면 생성 (와이어프레임)
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f8cff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    sphereRef.current = sphere;

    // 축 생성
    const axesHelper = new THREE.AxesHelper(1.2);
    scene.add(axesHelper);
    
    // 적도선 생성
    const equatorGeometry = new THREE.RingGeometry(0.98, 1.02, 64);
    const equatorMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f8cff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const equator = new THREE.Mesh(equatorGeometry, equatorMaterial);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    // 상태 벡터 화살표 초기화
    updateStateVector();

    // 파동 링 그룹 생성
    const waveGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(0.1, 0.15, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x4f8cff,
        transparent: true,
        opacity: 0.3 - i * 0.1,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      waveGroup.add(ring);
    }
    scene.add(waveGroup);
    waveRingsRef.current = waveGroup;

    // 마우스 컨트롤 (카메라 회전)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging || !camera) return;

      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      // 카메라 회전
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // 클린업 함수 저장
    cleanupRef.current = () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    // 초기 상태 벡터 업데이트
    updateStateVector();
  };

  // 상태 벡터 업데이트
  const updateStateVector = () => {
    if (!sceneRef.current) return;

    const { alpha, beta } = normalizeQubit(qubitAlpha, qubitBeta);
    const prob0 = alpha * alpha;
    const prob1 = beta * beta;

    // 블로흐 구면 좌표 계산
    const theta = 2 * Math.acos(Math.abs(alpha)); // 극각 (0 to π)
    const phi = 0; // 방위각 (간단화)

    // 직교 좌표로 변환
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);

    // 기존 화살표 제거
    if (stateVectorRef.current) {
      sceneRef.current.remove(stateVectorRef.current);
    }

    // 새 상태 벡터 화살표 생성
    const direction = new THREE.Vector3(x, y, z);
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1;
    const arrowColor = 0xff6b6b;

    const arrowHelper = new THREE.ArrowHelper(direction, origin, length, arrowColor, length * 0.2, length * 0.1);
    sceneRef.current.add(arrowHelper);
    stateVectorRef.current = arrowHelper;

    // 파동 링 위치 업데이트 (중첩 상태일 때만)
    if (waveRingsRef.current && !isMeasured && prob0 > 0.1 && prob1 > 0.1) {
      waveRingsRef.current.position.set(x, y, z);
      waveRingsRef.current.visible = true;
    } else if (waveRingsRef.current) {
      waveRingsRef.current.visible = false;
    }
  };

  // 3D 씬 렌더링
  const renderScene = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    // 파동 애니메이션
    if (waveRingsRef.current && waveRingsRef.current.visible) {
      const time = Date.now() * 0.005;
      waveRingsRef.current.children.forEach((ring: any, index: number) => {
        const scale = 1 + Math.sin(time + index * 0.5) * 0.3;
        ring.scale.set(scale, scale, scale);
        const material = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (material) {
          material.opacity = 0.3 - index * 0.1 + Math.sin(time + index * 0.5) * 0.1;
        }
      });
    }

    // 구면 회전
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.002;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  // 애니메이션 루프 및 초기화
  useEffect(() => {
    if (isVisible) {
      initBlochSphere();
      
      const animate = () => {
        renderScene();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // 클린업 함수 실행
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      
      // DOM 요소 안전하게 제거
      if (mountRef.current && rendererRef.current && rendererRef.current.domElement) {
        const canvas = rendererRef.current.domElement;
        if (canvas.parentNode === mountRef.current) {
          mountRef.current.removeChild(canvas);
        }
      }
      
      // Three.js 리소스 정리
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // 참조 초기화
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      sphereRef.current = null;
      stateVectorRef.current = null;
      waveRingsRef.current = null;
    };
  }, [isVisible]);

  // 큐비트 상태 변경 시 상태 벡터 업데이트
  useEffect(() => {
    if (isVisible) {
      updateStateVector();
    }
  }, [qubitAlpha, qubitBeta, isMeasured, isVisible]);

  // 컴포넌트 언마운트 시 최종 cleanup
  useEffect(() => {
    return () => {
      // 애니메이션 정리
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // 이벤트 리스너 정리
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      
      // DOM에서 남아있는 요소들 정리
      const fixedElement = document.getElementById('fixed-strong-element');
      if (fixedElement && fixedElement.parentNode) {
        fixedElement.parentNode.removeChild(fixedElement);
      }
    };
  }, []);

  // 비트 토글
  const toggleBit = () => {
    setIsAnimating(true);
    setBitState(1 - bitState);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // 큐비트 측정
  const measureQubit = () => {
    const { alpha, beta } = normalizeQubit(qubitAlpha, qubitBeta);
    const prob0 = alpha * alpha;
    
    // 확률에 따른 측정 결과
    const result = Math.random() < prob0 ? 0 : 1;
    
    setMeasurementResult(result);
    setIsMeasured(true);
    
    // 측정 후 상태 붕괴
    if (result === 0) {
      setQubitAlpha(1);
      setQubitBeta(0);
    } else {
      setQubitAlpha(0);
      setQubitBeta(1);
    }
  };

  // 큐비트 리셋
  const resetQubit = () => {
    setIsMeasured(false);
    setMeasurementResult(null);
    setQubitAlpha(1);
    setQubitBeta(0);
  };

  return (
    <div className={`qubit-visualization ${isVisible ? 'visible' : ''}`}>
      <div className="qubit-container">
        <div className="comparison-header">
          <h2>비트 vs 큐비트 비교</h2>
          <p>고전 비트와 양자 큐비트의 근본적인 차이를 체험해보세요</p>
        </div>

        {/* 인터랙티브 가이드 */}
        <div className="interactive-guide">
          <h4>🔍 체험해보기</h4>
          <div className="guide-steps">
            <div className="step">
              <span className="step-number">1</span>
              <p>비트 토글 버튼을 클릭하여 0과 1 상태를 전환해보세요</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <p>큐비트 슬라이더를 조작하여 중첩 상태를 만들어보세요</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <p>큐비트를 측정하여 확률적 결과를 확인해보세요</p>
            </div>
          </div>
        </div>

        <div className="comparison-content">
          {/* 비트 섹션 */}
          <div className="bit-section">
            <h3>고전 비트 (Classical Bit)</h3>
            <div className="bit-display">
              <div className={`led-indicator ${bitState === 1 ? 'on' : 'off'} ${isAnimating ? 'animating' : ''}`}>
                <div className="led-light"></div>
                <div className="led-glow"></div>
              </div>
              <div className="bit-state">
                상태: <span className="state-value">{bitState}</span>
              </div>
            </div>
            
            <button className="toggle-button" onClick={toggleBit}>
              비트 토글 ({bitState === 0 ? '0→1' : '1→0'})
            </button>
            
            <div className="explanation">
              <p>• <strong>확정적 상태:</strong> 0 또는 1 중 하나</p>
              <p>• <strong>측정 영향:</strong> 원래 상태 유지</p>
              <p>• <strong>정보량:</strong> 1비트 = 1개 상태</p>
            </div>
          </div>

          {/* 큐비트 섹션 */}
          <div className="qubit-section">
            <h3>양자 큐비트 (Quantum Qubit)</h3>
            
            <div className="bloch-sphere-container">
              <div 
                ref={mountRef}
                className="bloch-sphere-3d"
              />
              
              {/* 확률 표시 */}
              <div className="probability-display">
                <div className="prob-item">
                  <span className="prob-label">|0⟩ 확률:</span>
                  <span className="prob-value">{(normalizeQubit(qubitAlpha, qubitBeta).alpha ** 2 * 100).toFixed(1)}%</span>
                </div>
                <div className="prob-item">
                  <span className="prob-label">|1⟩ 확률:</span>
                  <span className="prob-value">{(normalizeQubit(qubitAlpha, qubitBeta).beta ** 2 * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="qubit-controls">
              <div className="slider-group">
                <label>|0⟩ 계수 (α): {qubitAlpha.toFixed(2)}</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={qubitAlpha}
                  onChange={(e) => !isMeasured && setQubitAlpha(parseFloat(e.target.value))}
                  disabled={isMeasured}
                />
              </div>
              
              <div className="slider-group">
                <label>|1⟩ 계수 (β): {qubitBeta.toFixed(2)}</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={qubitBeta}
                  onChange={(e) => !isMeasured && setQubitBeta(parseFloat(e.target.value))}
                  disabled={isMeasured}
                />
              </div>
            </div>

            <div className="qubit-buttons">
              <button 
                className="measure-button" 
                onClick={measureQubit}
                disabled={isMeasured}
              >
                {isMeasured ? `측정 결과: ${measurementResult}` : '큐비트 측정'}
              </button>
              
              {isMeasured && (
                <button className="reset-button" onClick={resetQubit}>
                  상태 리셋
                </button>
              )}
            </div>

            <div className="explanation">
              <p>• <strong>중첩 상태:</strong> α|0⟩ + β|1⟩</p>
              <p>• <strong>측정 영향:</strong> 상태 붕괴 (α², β² 확률)</p>
              <p>• <strong>정보량:</strong> 1큐비트 = 무한한 상태</p>
            </div>
          </div>
        </div>

        
        {/* 핵심 차이점 요약 */}
        <div className="key-differences">
          <h4>⚡ 핵심 차이점</h4>
          <div className="differences-grid">
            <div className="difference-item">
              <h5>상태 표현</h5>
              <p><strong>비트:</strong> 0 OR 1</p>
              <p><strong>큐비트:</strong> α|0⟩ + β|1⟩</p>
            </div>
            <div className="difference-item">
              <h5>정보 저장</h5>
              <p><strong>비트:</strong> 1개 값</p>
              <p><strong>큐비트:</strong> 무한한 조합</p>
            </div>
            <div className="difference-item">
              <h5>측정 효과</h5>
              <p><strong>비트:</strong> 변화 없음</p>
              <p><strong>큐비트:</strong> 상태 붕괴</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qubit;

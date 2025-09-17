import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import './entanglement.scss';

interface EntanglementVisualizationProps {
  isVisible: boolean;
  onClose: () => void;
}

// 벨 상태 타입 정의
type BellState = 'phi-plus' | 'phi-minus' | 'psi-plus' | 'psi-minus';

// 측정 결과 타입
interface MeasurementResult {
  qubit1: 0 | 1;
  qubit2: 0 | 1;
  correlationType: 'same' | 'opposite';
}

const EntanglementVisualization: React.FC<EntanglementVisualizationProps> = ({ isVisible, onClose }) => {
  // 3D 렌더링 참조
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameId = useRef<number | null>(null);

  // 블로흐 구 및 상태 벡터 참조
  const sphere1Ref = useRef<THREE.Mesh | null>(null);
  const sphere2Ref = useRef<THREE.Mesh | null>(null);
  const vector1Ref = useRef<THREE.ArrowHelper | null>(null);
  const vector2Ref = useRef<THREE.ArrowHelper | null>(null);
  const entanglementLineRef = useRef<THREE.Line | null>(null);
  const waveEffect1Ref = useRef<THREE.Group | null>(null);
  const waveEffect2Ref = useRef<THREE.Group | null>(null);

  // 상태 관리
  const [bellState, setBellState] = useState<BellState>('phi-plus');
  const [isMeasured, setIsMeasured] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<MeasurementResult | null>(null);
  const [measurementQubit, setMeasurementQubit] = useState<1 | 2 | null>(null);
  const [entanglementStrength, setEntanglementStrength] = useState(1.0);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);

  // 벨 상태별 계수 계산
  const getBellStateCoefficients = useCallback((state: BellState) => {
    const sqrt2 = Math.sqrt(0.5);
    switch (state) {
      case 'phi-plus':  // |Φ+⟩ = (|00⟩ + |11⟩)/√2
        return { c00: sqrt2, c01: 0, c10: 0, c11: sqrt2 };
      case 'phi-minus': // |Φ-⟩ = (|00⟩ - |11⟩)/√2
        return { c00: sqrt2, c01: 0, c10: 0, c11: -sqrt2 };
      case 'psi-plus':  // |Ψ+⟩ = (|01⟩ + |10⟩)/√2
        return { c00: 0, c01: sqrt2, c10: sqrt2, c11: 0 };
      case 'psi-minus': // |Ψ-⟩ = (|01⟩ - |10⟩)/√2
        return { c00: 0, c01: sqrt2, c10: -sqrt2, c11: 0 };
    }
  }, []);

  // 벨 상태별 상관관계 타입
  const getCorrelationType = useCallback((state: BellState): 'same' | 'opposite' => {
    return state === 'phi-plus' || state === 'phi-minus' ? 'same' : 'opposite';
  }, []);

  // 클린업 함수
  const cleanup = useCallback(() => {
    if (frameId.current !== null) {
      cancelAnimationFrame(frameId.current);
      frameId.current = null;
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    sceneRef.current = null;
    cameraRef.current = null;
    sphere1Ref.current = null;
    sphere2Ref.current = null;
    vector1Ref.current = null;
    vector2Ref.current = null;
    entanglementLineRef.current = null;
    waveEffect1Ref.current = null;
    waveEffect2Ref.current = null;
  }, []);

  // 3D 얽힘 시각화 초기화
  const initEntanglementVisualization = useCallback(() => {
    if (!containerRef.current) return;

    cleanup();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    renderer.setSize(800, 450);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 첫 번째 블로흐 구 (왼쪽)
    const sphereGeometry1 = new THREE.SphereGeometry(1.5, 32, 16);
    const sphereMaterial1 = new THREE.MeshBasicMaterial({
      color: 0x4f8cff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const sphere1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
    sphere1.position.set(-5, 0, 0);
    scene.add(sphere1);
    sphere1Ref.current = sphere1;

    // 두 번째 블로흐 구 (오른쪽)
    const sphereGeometry2 = new THREE.SphereGeometry(1.5, 32, 16);
    const sphereMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
    sphere2.position.set(5, 0, 0);
    scene.add(sphere2);
    sphere2Ref.current = sphere2;

    // 축 표시 (각 블로흐 구)
    const axes1 = new THREE.AxesHelper(2);
    axes1.position.set(-5, 0, 0);
    scene.add(axes1);

    const axes2 = new THREE.AxesHelper(2);
    axes2.position.set(5, 0, 0);
    scene.add(axes2);

    // 얽힘 연결선
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(5, 0, 0)
    ]);
    const lineMaterial = new THREE.LineDashedMaterial({
      color: 0x00ff88,
      dashSize: 0.3,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const entanglementLine = new THREE.Line(lineGeometry, lineMaterial);
    entanglementLine.computeLineDistances();
    scene.add(entanglementLine);
    entanglementLineRef.current = entanglementLine;

    // 파동 효과 그룹 생성
    const waveGroup1 = new THREE.Group();
    const waveGroup2 = new THREE.Group();
    
    // 각 블로흐 구 주변에 파동 링 생성
    for (let i = 0; i < 3; i++) {
      const radius = 2 + i * 0.5;
      
      // 첫 번째 큐비트 파동
      const ringGeometry1 = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 32);
      const ringMaterial1 = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6, 0.8, 0.5),
        transparent: true,
        opacity: 0.3 - i * 0.1,
        side: THREE.DoubleSide
      });
      const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
      ring1.position.set(-5, 0, 0);
      waveGroup1.add(ring1);
      
      // 두 번째 큐비트 파동
      const ringGeometry2 = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 32);
      const ringMaterial2 = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0, 0.8, 0.5),
        transparent: true,
        opacity: 0.3 - i * 0.1,
        side: THREE.DoubleSide
      });
      const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
      ring2.position.set(5, 0, 0);
      waveGroup2.add(ring2);
    }
    
    scene.add(waveGroup1);
    scene.add(waveGroup2);
    waveEffect1Ref.current = waveGroup1;
    waveEffect2Ref.current = waveGroup2;

    // 카메라 위치 설정
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 0, 0);

    // 마우스 컨트롤
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    updateEntanglementVisualization();
    animate();

    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // 얽힘 상태 시각화 업데이트
  const updateEntanglementVisualization = useCallback(() => {
    if (!sceneRef.current) return;

    const coeffs = getBellStateCoefficients(bellState);
    
    // 이전 상태 벡터 제거
    if (vector1Ref.current) {
      sceneRef.current.remove(vector1Ref.current);
    }
    if (vector2Ref.current) {
      sceneRef.current.remove(vector2Ref.current);
    }

    if (!isMeasured) {
      // 얽힘 상태에서는 개별 큐비트의 상태가 정의되지 않음을 표현
      // 대신 전체 시스템의 얽힘 상태를 중앙 연결선으로 표현
      if (entanglementLineRef.current) {
        const material = entanglementLineRef.current.material as THREE.LineDashedMaterial;
        material.opacity = entanglementStrength * 0.8;
        material.color.setHSL(0.3, 1, 0.5 + entanglementStrength * 0.3);
      }
    } else if (measurementResult) {
      // 측정 후 각 큐비트의 확정된 상태 표시
      const direction1 = measurementResult.qubit1 === 0 ? 
        new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 0, -1);
      const direction2 = measurementResult.qubit2 === 0 ? 
        new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 0, -1);

      // 첫 번째 큐비트 상태 벡터
      const vector1 = new THREE.ArrowHelper(
        direction1, 
        new THREE.Vector3(-5, 0, 0), 
        1.5, 
        0x4f8cff, 
        0.3, 
        0.2
      );
      sceneRef.current.add(vector1);
      vector1Ref.current = vector1;

      // 두 번째 큐비트 상태 벡터
      const vector2 = new THREE.ArrowHelper(
        direction2, 
        new THREE.Vector3(5, 0, 0), 
        1.5, 
        0xff6b6b, 
        0.3, 
        0.2
      );
      sceneRef.current.add(vector2);
      vector2Ref.current = vector2;

      // 얽힘 연결선 약화 표시
      if (entanglementLineRef.current) {
        const material = entanglementLineRef.current.material as THREE.LineDashedMaterial;
        material.opacity = 0.2;
        material.color.setHex(0x666666);
      }
    }
  }, [bellState, isMeasured, measurementResult, entanglementStrength, getBellStateCoefficients]);

  // 애니메이션 루프
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const time = Date.now() * 0.001 * animationSpeed;

    // 블로흐 구 회전
    if (sphere1Ref.current && sphere2Ref.current) {
      sphere1Ref.current.rotation.y = time * 0.5;
      sphere2Ref.current.rotation.y = -time * 0.5; // 반대 방향 회전
    }

    // 파동 효과 애니메이션 (얽힘 상태일 때만)
    if (!isMeasured && waveEffect1Ref.current && waveEffect2Ref.current) {
      waveEffect1Ref.current.children.forEach((ring: any, index: number) => {
        const phase = time + index * 0.5;
        const scale = 1 + Math.sin(phase) * 0.3 * entanglementStrength;
        ring.scale.set(scale, scale, scale);
        
        const material = ring.material as THREE.MeshBasicMaterial;
        if (material) {
          material.opacity = (0.3 - index * 0.1) * entanglementStrength + Math.sin(phase) * 0.1;
        }
        
        ring.rotation.z = time * 0.3 + index * 0.2;
      });

      waveEffect2Ref.current.children.forEach((ring: any, index: number) => {
        const phase = time + index * 0.5 + Math.PI; // 위상 차이로 얽힘 표현
        const scale = 1 + Math.sin(phase) * 0.3 * entanglementStrength;
        ring.scale.set(scale, scale, scale);
        
        const material = ring.material as THREE.MeshBasicMaterial;
        if (material) {
          material.opacity = (0.3 - index * 0.1) * entanglementStrength + Math.sin(phase) * 0.1;
        }
        
        ring.rotation.z = -time * 0.3 - index * 0.2; // 반대 방향 회전
      });
    }

    // 얽힘 연결선 애니메이션
    if (entanglementLineRef.current && !isMeasured) {
      const material = entanglementLineRef.current.material as THREE.LineDashedMaterial;
      material.dashSize = 0.3 + Math.sin(time * 2) * 0.1 * entanglementStrength;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    frameId.current = requestAnimationFrame(animate);
  }, [animationSpeed, entanglementStrength, isMeasured]);

  // 측정 함수
  const performMeasurement = useCallback((qubit: 1 | 2) => {
    const correlationType = getCorrelationType(bellState);
    
    // 첫 번째 큐비트 결과는 무작위
    const result1 = Math.random() < 0.5 ? 0 : 1;
    
    // 두 번째 큐비트 결과는 상관관계에 따라 결정
    let result2: 0 | 1;
    if (correlationType === 'same') {
      result2 = result1; // 같은 결과
    } else {
      result2 = result1 === 0 ? 1 : 0; // 반대 결과
    }

    const measurement: MeasurementResult = {
      qubit1: result1,
      qubit2: result2,
      correlationType
    };

    setMeasurementResult(measurement);
    setMeasurementQubit(qubit);
    setIsMeasured(true);
  }, [bellState, getCorrelationType]);

  // 벨 상태 설정 함수
  const setBellStateAndUpdate = useCallback((state: BellState) => {
    setBellState(state);
    setIsMeasured(false);
    setMeasurementResult(null);
    setMeasurementQubit(null);
  }, []);

  // 컴포넌트 마운트/언마운트 시 3D 시각화 관리
  useEffect(() => {
    if (isVisible) {
      const cleanup = initEntanglementVisualization();
      return cleanup;
    } else {
      cleanup();
    }
  }, [isVisible, initEntanglementVisualization]);

  // 상태 변경 시 시각화 업데이트
  useEffect(() => {
    if (isVisible) {
      updateEntanglementVisualization();
    }
  }, [isVisible, bellState, isMeasured, measurementResult, entanglementStrength, updateEntanglementVisualization]);

  if (!isVisible) return null;

  return (
    <div className={`entanglement-visualization ${isVisible ? 'visible' : ''}`}>
      <div className="entanglement-container">
        <div className="visualization-header">
          <h2>양자 얽힘(Entanglement) 시각화</h2>
          <p>두 큐비트가 공간적으로 분리되어도 즉시 상호작용하는 신비로운 현상</p>
          <button 
            onClick={onClose}
            className="close-button"
          >
            ×
          </button>
        </div>

        <div className="interactive-guide">
          <h4>🔗 얽힘 상호작용 가이드</h4>
          <div className="guide-steps">
            <div className="step">
              <div className="step-number">1</div>
              <p>벨 상태 버튼으로 다양한 얽힘 상태를 생성해보세요</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <p>연결선과 파동으로 얽힘 강도를 실시간 관찰하세요</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <p>한쪽 큐비트를 측정하여 즉시 상태 결정을 경험하세요</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <p>같은 결과/반대 결과 상관관계를 확인해보세요</p>
            </div>
          </div>
        </div>

        <div className="visualization-content">
          <div className="threed-entanglement">
            <h3>3D 얽힘 상태 시각화</h3>
            <div ref={containerRef} className="entanglement-3d"></div>
            
            <div className="entanglement-info">
              <div className="current-state">
                <h4>현재 얽힘 상태</h4>
                <div className="state-equation">
                  {bellState === 'phi-plus' && '|Φ+⟩ = (|00⟩ + |11⟩)/√2'}
                  {bellState === 'phi-minus' && '|Φ-⟩ = (|00⟩ - |11⟩)/√2'}
                  {bellState === 'psi-plus' && '|Ψ+⟩ = (|01⟩ + |10⟩)/√2'}
                  {bellState === 'psi-minus' && '|Ψ-⟩ = (|01⟩ - |10⟩)/√2'}
                </div>
              </div>
              
              <div className="correlation-info">
                <h4>상관관계</h4>
                <div className="correlation-type">
                  {getCorrelationType(bellState) === 'same' ? '동일한 결과' : '반대 결과'}
                </div>
              </div>

              <div className="entanglement-strength">
                <h4>얽힘 강도</h4>
                <div className="strength-value">{(entanglementStrength * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          <div className="controls-panel">
            <div className="bell-states-control">
              <h4>벨 상태 선택</h4>
              <div className="bell-buttons">
                <button 
                  className={`bell-btn ${bellState === 'phi-plus' ? 'active' : ''}`}
                  onClick={() => setBellStateAndUpdate('phi-plus')}
                  disabled={isMeasured}
                >
                  |Φ+⟩
                </button>
                <button 
                  className={`bell-btn ${bellState === 'phi-minus' ? 'active' : ''}`}
                  onClick={() => setBellStateAndUpdate('phi-minus')}
                  disabled={isMeasured}
                >
                  |Φ-⟩
                </button>
                <button 
                  className={`bell-btn ${bellState === 'psi-plus' ? 'active' : ''}`}
                  onClick={() => setBellStateAndUpdate('psi-plus')}
                  disabled={isMeasured}
                >
                  |Ψ+⟩
                </button>
                <button 
                  className={`bell-btn ${bellState === 'psi-minus' ? 'active' : ''}`}
                  onClick={() => setBellStateAndUpdate('psi-minus')}
                  disabled={isMeasured}
                >
                  |Ψ-⟩
                </button>
              </div>
            </div>

            <div className="measurement-controls">
              <h4>양자 측정</h4>
              <div className="measurement-buttons">
                <button 
                  className="measure-btn qubit1"
                  onClick={() => performMeasurement(1)}
                  disabled={isMeasured}
                >
                  큐비트 1 측정
                </button>
                <button 
                  className="measure-btn qubit2"
                  onClick={() => performMeasurement(2)}
                  disabled={isMeasured}
                >
                  큐비트 2 측정
                </button>
              </div>
              
              {measurementResult && (
                <div className="measurement-result">
                  <h5>측정 결과</h5>
                  <div className="result-display">
                    <div>큐비트 1: |{measurementResult.qubit1}⟩</div>
                    <div>큐비트 2: |{measurementResult.qubit2}⟩</div>
                    <div className="correlation">
                      상관관계: {measurementResult.correlationType === 'same' ? '동일' : '반대'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="animation-controls">
              <h4>애니메이션 제어</h4>
              <div className="slider-group">
                <label>얽힘 강도: {(entanglementStrength * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={entanglementStrength}
                  onChange={(e) => setEntanglementStrength(parseFloat(e.target.value))}
                />
              </div>
              
              <div className="slider-group">
                <label>애니메이션 속도: {animationSpeed.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="reset-control">
              <button 
                className="reset-btn"
                onClick={() => {
                  setIsMeasured(false);
                  setMeasurementResult(null);
                  setMeasurementQubit(null);
                  setBellState('phi-plus');
                  setEntanglementStrength(1.0);
                  setAnimationSpeed(1.0);
                }}
              >
                시스템 리셋
              </button>
            </div>
          </div>
        </div>

        <div className="entanglement-principles">
          <h4>🌌 양자 얽힘의 핵심 원리</h4>
          <div className="principles-grid">
            <div className="principle-item">
              <h5>비지역성</h5>
              <p>거리에 관계없이 <strong>즉시 상관관계</strong>가 나타납니다</p>
            </div>
            <div className="principle-item">
              <h5>정보 전달 불가</h5>
              <p>얽힘은 정보를 전달하지 않으며 <strong>상관관계만</strong> 보입니다</p>
            </div>
            <div className="principle-item">
              <h5>측정의 무작위성</h5>
              <p>개별 측정 결과는 <strong>완전히 무작위</strong>이지만 상관관계는 확정적</p>
            </div>
            <div className="principle-item">
              <h5>벨 부등식 위배</h5>
              <p>고전 물리학의 한계를 넘어서는 <strong>양자 상관관계</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntanglementVisualization;

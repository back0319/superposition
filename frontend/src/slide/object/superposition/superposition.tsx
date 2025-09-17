import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './superposition.scss';

interface SuperpositionProps {
  isVisible: boolean;
}

const Superposition: React.FC<SuperpositionProps> = ({ isVisible }) => {
  // 중첩 상태 관리
  const [qubitAlpha, setQubitAlpha] = useState(Math.sqrt(0.5)); // |0⟩ 상태 계수 (초기값: 50/50 중첩)
  const [qubitBeta, setQubitBeta] = useState(Math.sqrt(0.5));   // |1⟩ 상태 계수
  const [isMeasured, setIsMeasured] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<number | null>(null);
  
  // 3D 렌더링 참조
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const stateVectorRef = useRef<THREE.ArrowHelper | null>(null);
  const waveFunctionRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  // 확률 분포 그래프 참조
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);

  // 큐비트 상태 정규화
  const normalizeQubit = (alpha: number, beta: number) => {
    const norm = Math.sqrt(alpha * alpha + beta * beta);
    return norm > 0 ? { alpha: alpha / norm, beta: beta / norm } : { alpha: 1, beta: 0 };
  };

  // 마우스 컨트롤 설정
  const setupMouseControls = (camera: THREE.PerspectiveCamera, canvas: HTMLElement) => {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

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

    canvas.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // 클린업 함수 저장
    cleanupRef.current = () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  };

  // 중첩 상태 벡터 업데이트
  const updateSuperpositionVector = () => {
    if (!sceneRef.current) return;

    const { alpha, beta } = normalizeQubit(qubitAlpha, qubitBeta);
    const prob0 = alpha * alpha;
    const prob1 = beta * beta;

    // 블로흐 구면 좌표 계산 (중첩 상태 표현)
    const theta = 2 * Math.acos(Math.abs(alpha)); // 극각
    const phi = Math.atan2(beta, alpha); // 방위각 (위상 표현)

    // 직교 좌표로 변환
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);

    // 기존 상태 벡터 제거
    if (stateVectorRef.current) {
      sceneRef.current.remove(stateVectorRef.current);
    }

    // 새 상태 벡터 생성 (중첩 정도에 따라 색상 변화)
    const direction = new THREE.Vector3(x, y, z);
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 2;
    
    // 중첩 정도에 따른 색상 (균등 중첩일 때 밝은 색)
    const superpositionStrength = Math.min(prob0, prob1) * 4; // 0~1 범위
    const arrowColor = new THREE.Color().setHSL(0.6, 0.8, 0.3 + superpositionStrength * 0.4);

    const arrowHelper = new THREE.ArrowHelper(direction, origin, length, arrowColor.getHex(), length * 0.25, length * 0.15);
    sceneRef.current.add(arrowHelper);
    stateVectorRef.current = arrowHelper;

    // 파동 함수 위치 및 가시성 업데이트
    if (waveFunctionRef.current && !isMeasured) {
      // 중첩 상태일 때 파동 함수 표시
      const isInSuperposition = prob0 > 0.05 && prob1 > 0.05;
      waveFunctionRef.current.visible = isInSuperposition;
      
      if (isInSuperposition) {
        waveFunctionRef.current.position.set(x * 0.5, y * 0.5, z * 0.5);
      }
    }

    // 확률 분포 그래프 업데이트
    updateProbabilityGraph();
  };

  // 확률 분포 그래프 업데이트
  const updateProbabilityGraph = () => {
    if (!graphCanvasRef.current) return;

    const canvas = graphCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { alpha, beta } = normalizeQubit(qubitAlpha, qubitBeta);
    const prob0 = alpha * alpha;
    const prob1 = beta * beta;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 그래프 영역 설정
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;

    // 축 그리기
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // 확률 막대 그래프
    const barWidth = graphWidth / 3;
    
    // |0⟩ 상태 확률
    ctx.fillStyle = `rgba(79, 140, 255, ${0.3 + prob0 * 0.7})`;
    const height0 = prob0 * graphHeight;
    ctx.fillRect(padding + barWidth * 0.25, canvas.height - padding - height0, barWidth * 0.5, height0);
    
    // |1⟩ 상태 확률
    ctx.fillStyle = `rgba(255, 107, 107, ${0.3 + prob1 * 0.7})`;
    const height1 = prob1 * graphHeight;
    ctx.fillRect(padding + barWidth * 1.25, canvas.height - padding - height1, barWidth * 0.5, height1);

    // 레이블
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', padding + barWidth * 0.5, canvas.height - 10);
    ctx.fillText('|1⟩', padding + barWidth * 1.5, canvas.height - 10);

    // 확률 값 표시
    ctx.font = '12px Arial';
    ctx.fillText(`${(prob0 * 100).toFixed(1)}%`, padding + barWidth * 0.5, canvas.height - padding - height0 - 10);
    ctx.fillText(`${(prob1 * 100).toFixed(1)}%`, padding + barWidth * 1.5, canvas.height - padding - height1 - 10);
  };

  // 3D 중첩 시각화 초기화
  const initSuperpositionVisualization = () => {
    if (!mountRef.current) return;

    // 씬 생성
    const scene = new THREE.Scene();
    scene.background = null; // 투명 배경
    sceneRef.current = scene;

    // 카메라 생성
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(6, 5, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 렌더러 생성
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(500, 500);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 블로흐 구면 생성 (중첩 상태 표현)
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f8cff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    sphereRef.current = sphere;

    // 축 생성 (X: 빨강, Y: 초록, Z: 파랑)
    const axesHelper = new THREE.AxesHelper(2.5);
    scene.add(axesHelper);
    
    // 적도선 생성 (중첩 평면 표시)
    const equatorGeometry = new THREE.RingGeometry(1.95, 2.05, 64);
    const equatorMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const equator = new THREE.Mesh(equatorGeometry, equatorMaterial);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    // 파동 함수 그룹 생성 (중첩 상태의 파동 표현)
    const waveGroup = new THREE.Group();
    
    // 여러 개의 동심원 파동 링 생성
    for (let i = 0; i < 5; i++) {
      const radius = 0.2 + i * 0.1;
      const ringGeometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + i * 0.05, 0.8, 0.5),
        transparent: true,
        opacity: 0.4 - i * 0.05,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      waveGroup.add(ring);
    }
    
    scene.add(waveGroup);
    waveFunctionRef.current = waveGroup;

    // 상태 벡터 초기화
    updateSuperpositionVector();

    // 마우스 컨트롤 설정
    setupMouseControls(camera, renderer.domElement);

    // 초기 확률 분포 그래프 업데이트
    updateProbabilityGraph();
  };

  // 상태 벡터 업데이트 (기존 함수 제거하고 새 함수로 대체)
  const updateStateVector = () => {
    updateSuperpositionVector();
  };

  // 3D 씬 렌더링 (중첩 파동 애니메이션 포함)
  const renderScene = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    // 파동 함수 애니메이션 (중첩 상태일 때)
    if (waveFunctionRef.current && waveFunctionRef.current.visible && !isMeasured) {
      const time = Date.now() * 0.003;
      waveFunctionRef.current.children.forEach((ring: any, index: number) => {
        // 파동 확산 애니메이션
        const phase = time + index * 0.3;
        const scale = 1 + Math.sin(phase) * 0.4;
        ring.scale.set(scale, scale, scale);
        
        // 투명도 변화
        const material = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (material) {
          material.opacity = (0.4 - index * 0.05) + Math.sin(phase) * 0.2;
        }
        
        // 회전 효과
        ring.rotation.z = time * 0.5 + index * 0.2;
      });
      
      // 전체 그룹 회전
      waveFunctionRef.current.rotation.y = time * 0.2;
    }

    // 구면 회전
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.003;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  // 애니메이션 루프 및 초기화
  useEffect(() => {
    if (isVisible) {
      initSuperpositionVisualization();
      
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
      const cleanup = cleanupRef.current;
      if (cleanup) {
        cleanup();
      }
      
      // DOM 요소 안전하게 제거
      const mount = mountRef.current;
      const renderer = rendererRef.current;
      if (mount && renderer && renderer.domElement) {
        const canvas = renderer.domElement;
        if (canvas.parentNode === mount) {
          mount.removeChild(canvas);
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
      waveFunctionRef.current = null;
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
      const cleanup = cleanupRef.current;
      if (cleanup) {
        cleanup();
      }
      
      // DOM에서 남아있는 요소들 정리
      const fixedElement = document.getElementById('fixed-strong-element');
      if (fixedElement && fixedElement.parentNode) {
        fixedElement.parentNode.removeChild(fixedElement);
      }
    };
  }, []);

  // 중첩 상태 슬라이더 변경 핸들러
  const handleAlphaChange = (value: number) => {
    if (!isMeasured) {
      setQubitAlpha(value);
      // β 값을 자동 조정하여 정규화 유지 (|α|² + |β|² = 1)
      const betaSquared = Math.max(0, 1 - value * value);
      setQubitBeta(Math.sqrt(betaSquared));
    }
  };

  const handleBetaChange = (value: number) => {
    if (!isMeasured) {
      setQubitBeta(value);
      // α 값을 자동 조정하여 정규화 유지
      const alphaSquared = Math.max(0, 1 - value * value);
      setQubitAlpha(Math.sqrt(alphaSquared));
    }
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
    <div className={`superposition-visualization ${isVisible ? 'visible' : ''}`}>
      <div className="superposition-container">
        <div className="visualization-header">
          <h2>양자 중첩(Superposition) 시각화</h2>
          <p>단일 큐비트가 0과 1 상태를 동시에 가지는 원리를 3D로 체험해보세요</p>
        </div>

        {/* 인터랙티브 가이드 */}
        <div className="interactive-guide">
          <h4>🌊 중첩 상태 탐험하기</h4>
          <div className="guide-steps">
            <div className="step">
              <span className="step-number">1</span>
              <p>α, β 슬라이더를 조작하여 중첩 확률을 실시간으로 변화시켜보세요</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <p>3D 벡터 구에서 상태 벡터의 움직임을 관찰해보세요</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <p>파동 함수 애니메이션으로 중첩 상태의 동적 특성을 확인해보세요</p>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <p>확률 분포 그래프에서 측정 확률 변화를 실시간으로 확인해보세요</p>
            </div>
          </div>
        </div>

        <div className="visualization-content">
          {/* 3D 중첩 시각화 */}
          <div className="threed-visualization">
            <h3>3D 중첩 상태 시각화</h3>
            
            <div className="bloch-sphere-container">
              <div 
                ref={mountRef}
                className="bloch-sphere-3d"
              />
              
              {/* 실시간 상태 정보 */}
              <div className="state-info">
                <div className="state-equation">
                  <h4>현재 상태</h4>
                  <div className="equation">
                    |ψ⟩ = {qubitAlpha.toFixed(3)}|0⟩ + {qubitBeta.toFixed(3)}|1⟩
                  </div>
                </div>
                
                <div className="probability-info">
                  <div className="prob-item">
                    <span className="prob-label">P(|0⟩) = |α|²:</span>
                    <span className="prob-value">{(qubitAlpha * qubitAlpha * 100).toFixed(1)}%</span>
                  </div>
                  <div className="prob-item">
                    <span className="prob-label">P(|1⟩) = |β|²:</span>
                    <span className="prob-value">{(qubitBeta * qubitBeta * 100).toFixed(1)}%</span>
                  </div>
                  <div className="superposition-strength">
                    <span className="prob-label">중첩 강도:</span>
                    <span className="prob-value">
                      {(Math.min(qubitAlpha * qubitAlpha, qubitBeta * qubitBeta) * 400).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 중첩 상태 컨트롤 */}
            <div className="superposition-controls">
              <div className="slider-group">
                <label>|0⟩ 계수 (α): {qubitAlpha.toFixed(3)}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={qubitAlpha}
                  onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
                  disabled={isMeasured}
                />
              </div>
              
              <div className="slider-group">
                <label>|1⟩ 계수 (β): {qubitBeta.toFixed(3)}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={qubitBeta}
                  onChange={(e) => handleBetaChange(parseFloat(e.target.value))}
                  disabled={isMeasured}
                />
              </div>

              {/* 프리셋 버튼들 */}
              <div className="preset-buttons">
                <button 
                  onClick={() => { setQubitAlpha(1); setQubitBeta(0); }}
                  disabled={isMeasured}
                  className="preset-btn"
                >
                  |0⟩ 상태
                </button>
                <button 
                  onClick={() => { setQubitAlpha(0); setQubitBeta(1); }}
                  disabled={isMeasured}
                  className="preset-btn"
                >
                  |1⟩ 상태
                </button>
                <button 
                  onClick={() => { setQubitAlpha(Math.sqrt(0.5)); setQubitBeta(Math.sqrt(0.5)); }}
                  disabled={isMeasured}
                  className="preset-btn superposition"
                >
                  완전 중첩
                </button>
              </div>
            </div>

            {/* 측정 및 리셋 */}
            <div className="measurement-controls">
              <button 
                className="measure-button" 
                onClick={measureQubit}
                disabled={isMeasured}
              >
                {isMeasured ? `측정 결과: |${measurementResult}⟩` : '상태 측정 (붕괴)'}
              </button>
              
              {isMeasured && (
                <button className="reset-button" onClick={resetQubit}>
                  중첩 상태 복원
                </button>
              )}
            </div>
          </div>

          {/* 확률 분포 그래프 */}
          <div className="probability-graph">
            <h3>실시간 확률 분포</h3>
            <canvas 
              ref={graphCanvasRef}
              width="300"
              height="200"
              className="probability-canvas"
            />
            
            <div className="graph-explanation">
              <p>• <strong>파란 막대:</strong> |0⟩ 상태 측정 확률</p>
              <p>• <strong>빨간 막대:</strong> |1⟩ 상태 측정 확률</p>
              <p>• <strong>높이:</strong> 해당 상태로 측정될 확률 (0~100%)</p>
            </div>
          </div>
        </div>

        {/* 중첩 원리 설명 */}
        <div className="superposition-principles">
          <h4>⚛️ 양자 중첩의 핵심 원리</h4>
          <div className="principles-grid">
            <div className="principle-item">
              <h5>동시 존재</h5>
              <p>큐비트는 |0⟩와 |1⟩ 상태를 <strong>동시에</strong> 가질 수 있습니다</p>
            </div>
            <div className="principle-item">
              <h5>확률적 특성</h5>
              <p>측정 시 |α|², |β|² 확률로 각각의 상태가 관측됩니다</p>
            </div>
            <div className="principle-item">
              <h5>상태 붕괴</h5>
              <p>측정하는 순간 중첩 상태는 하나의 확정된 상태로 붕괴됩니다</p>
            </div>
            <div className="principle-item">
              <h5>정규화 조건</h5>
              <p>항상 |α|² + |β|² = 1을 만족해야 합니다 (전체 확률 = 100%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Superposition;

import { FC, useEffect, useRef, useState } from "react";
import "../style/qiskit-visualization.scss";

interface StateVectorData {
  amplitudes: { r: number; i: number }[];
  states: string[];
}

interface QSphereProps {
  stateVector: StateVectorData | null;
  qiskitBlochImage?: string; // Qiskit에서 생성된 블로흐 구면 이미지
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface StatePoint {
  state: string;
  point: Point3D;
  probability: number;
  phase: number;
  color: string;
}

const QSphere: FC<QSphereProps> = ({ stateVector, qiskitBlochImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [useQiskitVisualization, setUseQiskitVisualization] = useState(!!qiskitBlochImage);
  
  // Handle mouse events for sphere rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPosition.x;
    const deltaY = e.clientY - lastPosition.y;
    
    setRotation(prev => ({
      x: (prev.x + deltaY * 0.01) % (2 * Math.PI),
      y: (prev.y + deltaX * 0.01) % (2 * Math.PI)
    }));
    
    setLastPosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Canvas dimensions
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw Q-sphere
    drawQSphere(ctx, width, height, rotation);
    
    // Visualize state vector if available
    if (stateVector) {
      visualizeStateVector(ctx, stateVector, width, height, rotation);
    }
  }, [stateVector, rotation]);
  
  // Use demo data if no state vector is provided
  const demoStateVector: StateVectorData | null = !stateVector ? {
    amplitudes: [
      { r: 0.7071, i: 0 },  // |0>
      { r: 0, i: 0.7071 }   // |1>
    ],
    states: ['|0⟩', '|1⟩']
  } : null;
    const dataToDisplay = stateVector || demoStateVector;
  
  if (!dataToDisplay && !qiskitBlochImage) {
    return (
      <div className="qsphere-container qsphere-empty">
        <p>Run simulation to see Q-sphere visualization</p>
      </div>
    );
  }

  // Qiskit 시각화 이미지가 있고, 그것을 사용하기로 선택했다면 표시
  if (qiskitBlochImage && useQiskitVisualization) {
    return (
      <div className="qsphere-container">
        <div className="visualization-toggle">
          <button 
            onClick={() => setUseQiskitVisualization(false)}
            className="vis-toggle-button"
          >
            커스텀 Q-sphere 보기
          </button>
        </div>
        <div className="qiskit-visualization">
          <img 
            src={`data:image/png;base64,${qiskitBlochImage}`} 
            alt="Qiskit Bloch Sphere" 
            className="qiskit-bloch-image"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="qsphere-container">
      {qiskitBlochImage && (
        <div className="visualization-toggle">
          <button 
            onClick={() => setUseQiskitVisualization(true)}
            className="vis-toggle-button"
          >
            Qiskit Q-sphere 보기
          </button>
        </div>
      )}
      <canvas
        ref={canvasRef} 
        width={400} 
        height={300} 
        className="qsphere-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="qsphere-controls">
        <div className="qsphere-legend">
          <div className="legend-item">
            <div className="color-box" style={{backgroundColor: "#6366f1"}}></div>
            <span>State Probability</span>
          </div>
          <div className="legend-item">
            <div className="phase-indicator"></div>
            <span>Phase (Hue)</span>
          </div>
        </div>
        <div className="qsphere-info">
          <p>Drag to rotate the Q-sphere</p>
        </div>
      </div>
    </div>
  );
};

// Draw the basic Q-sphere structure
const drawQSphere = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number,
  rotation: { x: number, y: number }
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  // Create 3D sphere wireframe
  const steps = 12;
  
  // Draw equator
  drawEllipse(ctx, centerX, centerY, radius, radius * 0.3, 'rgba(200, 200, 200, 0.5)');
  
  // Draw meridians
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI;
    drawMeridian(ctx, centerX, centerY, radius, angle, rotation, 'rgba(200, 200, 200, 0.3)');
  }
  
  // Draw parallels
  for (let i = 1; i < steps / 2; i++) {
    const lat = (i / (steps / 2)) * Math.PI / 2;
    drawParallel(ctx, centerX, centerY, radius, lat, rotation, 'rgba(200, 200, 200, 0.3)');
    drawParallel(ctx, centerX, centerY, radius, -lat, rotation, 'rgba(200, 200, 200, 0.3)');
  }
  
  // Draw axes
  drawAxis(ctx, centerX, centerY, radius, { x: 1, y: 0, z: 0 }, rotation, 'rgba(255, 0, 0, 0.5)', '|+⟩');
  drawAxis(ctx, centerX, centerY, radius, { x: -1, y: 0, z: 0 }, rotation, 'rgba(255, 0, 0, 0.5)', '|-⟩');
  drawAxis(ctx, centerX, centerY, radius, { x: 0, y: 1, z: 0 }, rotation, 'rgba(0, 255, 0, 0.5)', '|+i⟩');
  drawAxis(ctx, centerX, centerY, radius, { x: 0, y: -1, z: 0 }, rotation, 'rgba(0, 255, 0, 0.5)', '|-i⟩');
  drawAxis(ctx, centerX, centerY, radius, { x: 0, y: 0, z: 1 }, rotation, 'rgba(0, 0, 255, 0.5)', '|0⟩');
  drawAxis(ctx, centerX, centerY, radius, { x: 0, y: 0, z: -1 }, rotation, 'rgba(0, 0, 255, 0.5)', '|1⟩');
};

// Helper function to draw an ellipse
const drawEllipse = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  radiusX: number, 
  radiusY: number,
  color: string
) => {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.stroke();
};

// Helper function to draw a meridian (longitude line)
const drawMeridian = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  rotation: { x: number, y: number },
  color: string
) => {
  ctx.beginPath();
  
  for (let i = 0; i <= 36; i++) {
    const lat = (i / 36) * Math.PI - Math.PI / 2;
    const point3D = {
      x: radius * Math.cos(lat) * Math.cos(angle),
      y: radius * Math.cos(lat) * Math.sin(angle),
      z: radius * Math.sin(lat)
    };
    
    const rotatedPoint = rotatePoint(point3D, rotation);
    
    if (i === 0) {
      ctx.moveTo(centerX + rotatedPoint.x, centerY - rotatedPoint.z);
    } else {
      ctx.lineTo(centerX + rotatedPoint.x, centerY - rotatedPoint.z);
    }
  }
  
  ctx.strokeStyle = color;
  ctx.stroke();
};

// Helper function to draw a parallel (latitude line)
const drawParallel = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  latitude: number,
  rotation: { x: number, y: number },
  color: string
) => {
  const r = radius * Math.cos(latitude);
  const z = radius * Math.sin(latitude);
  
  ctx.beginPath();
  
  for (let i = 0; i <= 36; i++) {
    const angle = (i / 36) * 2 * Math.PI;
    const point3D = {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
      z: z
    };
    
    const rotatedPoint = rotatePoint(point3D, rotation);
    
    if (i === 0) {
      ctx.moveTo(centerX + rotatedPoint.x, centerY - rotatedPoint.z);
    } else {
      ctx.lineTo(centerX + rotatedPoint.x, centerY - rotatedPoint.z);
    }
  }
  
  ctx.strokeStyle = color;
  ctx.stroke();
};

// Helper function to draw an axis with label
const drawAxis = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  direction: Point3D,
  rotation: { x: number, y: number },
  color: string,
  label: string
) => {
  // Scale direction to radius length
  const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
  const scaledDirection = {
    x: direction.x * radius / length,
    y: direction.y * radius / length,
    z: direction.z * radius / length
  };
  
  // Rotate the point
  const rotatedPoint = rotatePoint(scaledDirection, rotation);
  
  // Draw the line
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + rotatedPoint.x, centerY - rotatedPoint.z);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw the label if point is visible (z > 0 after rotation)
  const zDepth = rotatedPoint.y;
  if (zDepth > -radius * 0.5) {
    ctx.fillStyle = color;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerX + rotatedPoint.x * 1.1, centerY - rotatedPoint.z * 1.1);
  }
};

// Helper function to rotate a 3D point
const rotatePoint = (point: Point3D, rotation: { x: number, y: number }): Point3D => {
  // Rotate around X-axis
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  
  const y1 = point.y * cosX - point.z * sinX;
  const z1 = point.y * sinX + point.z * cosX;
  
  // Rotate around Y-axis
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  
  const x2 = point.x * cosY + z1 * sinY;
  const z2 = -point.x * sinY + z1 * cosY;
  
  return { x: x2, y: y1, z: z2 };
};

// Visualize state vector on the Q-sphere
const visualizeStateVector = (
  ctx: CanvasRenderingContext2D,
  stateVector: StateVectorData,
  width: number,
  height: number,
  rotation: { x: number, y: number }
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  // Convert state vector to Bloch sphere points
  const statePoints = calculateStatePoints(stateVector, radius);
  
  // Sort points by their Y coordinate after rotation (for proper depth rendering)
  const rotatedPoints = statePoints.map(sp => ({
    ...sp,
    rotatedPoint: rotatePoint(sp.point, rotation)
  })).sort((a, b) => a.rotatedPoint.y - b.rotatedPoint.y);
  
  // Draw the state points
  for (const state of rotatedPoints) {
    const { rotatedPoint, probability, color, state: stateName } = state;
    
    // Only draw points with significant probability
    if (probability > 0.01) {
      // Calculate point size based on probability
      const size = Math.max(3, Math.sqrt(probability) * 12);
      
      // Draw point
      ctx.beginPath();
      ctx.arc(
        centerX + rotatedPoint.x, 
        centerY - rotatedPoint.z, 
        size, 
        0, 
        2 * Math.PI
      );
      ctx.fillStyle = color;
      ctx.fill();
      
      // Draw state name if large enough
      if (probability > 0.05) {
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          stateName,
          centerX + rotatedPoint.x,
          centerY - rotatedPoint.z - size - 5
        );
      }
    }
  }
};

// Calculate state points from state vector
const calculateStatePoints = (stateVector: StateVectorData, radius: number): StatePoint[] => {
  const { amplitudes, states } = stateVector;
  const statePoints: StatePoint[] = [];
  
  // 정규화 검사 (확률 합이 1인지 확인)
  let totalProbability = 0;
  amplitudes.forEach(amp => {
    totalProbability += amp.r * amp.r + amp.i * amp.i;
  });
  
  // 정규화가 필요한 경우 스케일 계산
  const normalizationFactor = Math.abs(totalProbability - 1.0) > 0.01 
    ? Math.sqrt(1.0 / Math.max(0.0001, totalProbability))
    : 1.0;// Process each amplitude
  for (let i = 0; i < amplitudes.length; i++) {
    const amp = amplitudes[i];
    const state = states[i] || `|${i.toString(2).padStart(Math.log2(amplitudes.length), '0')}⟩`;
    
    // Calculate probability and phase
    // 정규화 계수 적용
    const normalizedR = amp.r * normalizationFactor;
    const normalizedI = amp.i * normalizationFactor;
    const probability = normalizedR * normalizedR + normalizedI * normalizedI;
    
    // 위상 계산 개선 - 정규화하여 -π ~ π 범위로
    let phase = Math.atan2(amp.i, amp.r);
    // 수치 안정성: 매우 작은 값이면 0으로
    if (Math.abs(amp.r) < 1e-10 && Math.abs(amp.i) < 1e-10) {
      phase = 0;
    }
    
    // Skip states with near-zero probability (threshold 낮춤)
    if (probability < 0.0001) continue;
      // 상태 벡터에 따른 Bloch 구면 매핑 개선
    // 각 기저 상태(|0>, |1>, |+>, |->, 등)에 따라 다른 위치에 표시
      // 기저 상태의 비트 문자열을 얻습니다 (|00>, |01>, |10>, |11> 등)
    const bitString = state.replace(/[|⟩]/g, '');
    const numQubits = Math.log2(amplitudes.length);
    
    // 해당 상태의 비트 인덱스에 따라 각도 계산
    const bitIndex = parseInt(bitString, 2);
    
    // 다중 큐비트 시스템에서 더 정교한 매핑 알고리즘 적용
    // 비트 문자열의 패턴에 따라 구면에 고르게 분포되도록 함
    
    // 첫 번째 방법: 인덱스 기반 균일 분포
    // const theta = Math.PI * (0.5 - bitIndex / amplitudes.length); // 위도(상하)
    // const phi = (2 * Math.PI * bitIndex) / amplitudes.length;     // 경도(좌우)
    
    // 두 번째 방법: 그레이 코드 기반 매핑 (인접 상태들이 구면상에서도 인접하게)
    const grayCode = bitIndex ^ (bitIndex >> 1); // 이진 -> 그레이 코드 변환
    const normalizedGray = grayCode / amplitudes.length;
    
    // 개선된 각도 계산: 그레이 코드를 사용하여 더 균일한 구면 분포 생성
    const theta = Math.acos(1 - 2 * normalizedGray); // 위도(상하): 0 ~ π
    const phi = 2 * Math.PI * (bitIndex / (amplitudes.length / 2)); // 경도(좌우): 0 ~ 2π
    
    // 상태 벡터의 위상에 따라 경도 조정
    const phaseAdjustedPhi = phi + phase;
    
    const point: Point3D = {
      x: radius * Math.sin(theta) * Math.cos(phaseAdjustedPhi),
      y: radius * Math.sin(theta) * Math.sin(phaseAdjustedPhi),
      z: radius * Math.cos(theta)
    };
    
    // Set color based on phase (hue from phase, saturation and lightness from probability)
    const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
    const saturation = 80;
    const lightness = 60 - probability * 20; // Brighter for higher probability
    
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    statePoints.push({
      state,
      point,
      probability,
      phase,
      color
    });
  }
  
  return statePoints;
};

export default QSphere;

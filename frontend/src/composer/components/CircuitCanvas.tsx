import { FC, useRef, useEffect, useState } from "react";
import { useDrop, useDrag } from "react-dnd/dist/hooks";
import "../../component/layout/circuit.scss";
import useCircuitPlacement from "./CircuitPlacement";
import { isMultiQubitGate } from "./MultiQubitGateHandler";
import GateParameterDialog from "./GateParameterDialog";

type DropItem = { type: string };
type DragItem = { type: string, x: number, y: number };

export interface GatePlacement {
  x: number;
  y: number;
  type: string;
  control?: number;
  control2?: number;
  target?: number;
  params?: {
    angle?: number;
    phase?: number;
    theta?: number;
    phi?: number;
    lambda?: number;
    t1?: number;
    t2?: number;
    [key: string]: number | undefined;
  };
}

// Utility to format angles for display - Inspired by Quirk's implementation
const formatAngleDisplay = (angle: number): string => {
  const PI = Math.PI;
  // Normalize angle to be between -2π and 2π
  const normalizedAngle = ((angle % (2*PI)) + 2*PI) % (2*PI);
  const absAngle = normalizedAngle > PI ? 2*PI - normalizedAngle : normalizedAngle;
  
  // Common fractions of PI
  const knownFractions = [
    { value: 0, display: "0" },
    { value: PI/8, display: "π/8" },
    { value: PI/6, display: "π/6" },
    { value: PI/4, display: "π/4" },
    { value: PI/3, display: "π/3" },
    { value: PI/2, display: "π/2" },
    { value: 2*PI/3, display: "2π/3" },
    { value: 3*PI/4, display: "3π/4" },
    { value: 5*PI/6, display: "5π/6" },
    { value: PI, display: "π" },
    { value: 5*PI/4, display: "5π/4" },
    { value: 3*PI/2, display: "3π/2" },
    { value: 7*PI/4, display: "7π/4" },
    { value: 2*PI, display: "2π" }
  ];
  
  // Check if angle is close to one of the known fractions
  for (const fraction of knownFractions) {
    if (Math.abs(normalizedAngle - fraction.value) < 1e-10) {
      return fraction.display;
    }
    if (Math.abs(normalizedAngle - (2*PI - fraction.value)) < 1e-10 && fraction.value !== 0 && fraction.value !== PI) {
      return "-" + fraction.display;
    }
  }
  
  // For other angles, convert to fraction of PI with precision
  const fraction = normalizedAngle / PI;
  return normalizedAngle > PI 
    ? `${(2-fraction).toFixed(2)}π` 
    : `${fraction.toFixed(2)}π`;
};

// Utility to render rotation angle visualization
const AngleVisualization: FC<{ angle: number, type: 'rx' | 'ry' | 'rz' }> = ({ angle, type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, 20, 20);
    
    // Draw angle visualization
    const centerX = 10;
    const centerY = 10;
    const radius = 7;
    
    // Colors for different gate types
    const colors = {
      rx: 'rgba(230, 74, 25, 0.8)',
      ry: 'rgba(123, 31, 162, 0.8)',
      rz: 'rgba(2, 136, 209, 0.8)'
    };
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.stroke();
    
    // Calculate angle (negative because canvas y-axis is inverted)
    const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Draw angle arc
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - radius); // Start at top (0 radians in canvas coordinates)
    ctx.arc(centerX, centerY, radius, -Math.PI/2, -Math.PI/2 + normalizedAngle, false);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors[type];
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.stroke();
    
    // Draw indicator line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + radius * Math.sin(normalizedAngle),
      centerY - radius * Math.cos(normalizedAngle)
    );
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
  }, [angle, type]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={20} 
      height={20} 
      className="rotation-angle-visualization" 
    />
  );
};

interface GridCellProps {
  x: number;
  y: number;
  onDropGate: (x: number, y: number, type: string, params?: Record<string, number | undefined>) => void;
  onRemoveGate?: (x: number, y: number) => void;
  gate?: string;
  isLast?: boolean;
  onCellClick?: (x: number, y: number) => void;  // 셀 클릭 핸들러
  onCellDoubleClick?: (x: number, y: number) => void;  // 셀 더블 클릭 핸들러 (파라미터 편집용)
  placingClassName?: string;  // 게이트 배치 과정에서의 시각적 표시를 위한 클래스 (CircuitPlacement.getCellClassName 결과)
}

const GridCell: FC<GridCellProps & {   circuit: GatePlacement[];
  placingStep?: number;
  placingGateType?: string | null;
  onCellClick?: (x: number, y: number) => void;
  onCellDoubleClick?: (x: number, y: number) => void;
  isControlPoint?: boolean;
  isTargetPoint?: boolean;
  placingClassName?: string;
}> = ({ 
  x, y, onDropGate, onRemoveGate, gate, isLast, circuit,
  placingStep = 0, placingGateType, onCellClick, onCellDoubleClick,
  isControlPoint = false, isTargetPoint = false,
  placingClassName = ''
}) => {  // 드래그 기능 추가 (게이트가 있는 경우만)
  const [{ isDragging }, connectDragSource] = useDrag(() => ({
    type: "CIRCUIT_GATE",
    item: { type: gate, x, y },
    canDrag: !!gate, // 게이트가 있는 경우만 드래그 가능
    end: (item: any, monitor: any) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && monitor.didDrop() && onRemoveGate) {
        // 팔레트 영역에 드롭된 경우 게이트 삭제
        onRemoveGate(x, y);
      }
    },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [gate, x, y, onRemoveGate]);
    // 드롭 기능
  const [{ isOver }, connectDropTarget] = useDrop<
    DropItem,
    void,
    { isOver: boolean }
  >(() => ({
    accept: "GATE",
    drop: (item: any) => onDropGate(x, y, item.type),
    collect: (monitor: any) => ({ isOver: !!monitor.isOver() }),
  }));// We're using the placingClassName prop directly instead
  
  // Gate display component - Based on Quirk's approach
  const renderGate = () => {
    if (!gate) return null;
    
    // For connection points in multi-qubit gates
    if (gate === "connection") {
      // Find the gate that uses this position as control or target
      const controlGate = circuit.find((g: GatePlacement) => 
        (g.control === x || g.control2 === x) && g.y === y
      );
      const targetGate = circuit.find((g: GatePlacement) => 
        g.target === x && g.y === y
      );      if (controlGate) {
        // Control point (black dot - filled circle) with improved styling
        // Check if this is part of a double-controlled gate (CCNOT or CCZ)
        const isPartOfDoubleControlledGate = circuit.some(g => 
          (g.control === x && g.control2 !== undefined) || (g.control2 === x)
        );
        
        return <div className={`gate-control ${isPartOfDoubleControlledGate ? 'double-controlled' : ''}`}></div>;
      } else if (targetGate) {
        // Target point handling based on gate type with improved styling
        if (targetGate.type === 'cx' || targetGate.type === 'ccx') {
          return <div className="gate-target x-target"></div>; // X target with plus symbol
        } else if (targetGate.type === 'cz' || targetGate.type === 'ccz') {
          return <div className="gate-target z-target">Z</div>; // Z target with Z label        } else if (targetGate.type === 'swap' || targetGate.type === 'iswap') {
          return <div className="gate-target swap-target">×</div>; // SWAP target with × symbol
        } else if (targetGate.type.toLowerCase().startsWith('cr')) {  
          // Controlled rotation gates with improved visual appearance
          const rotationType = targetGate.type.charAt(2).toUpperCase();
          const placement = targetGate;
          const angle = placement?.params?.theta || Math.PI/2; // Use theta for rotation gates
          const displayAngle = formatAngleDisplay(angle);
          
          // Determine the appropriate type for the rotation visualization
          const rotationVisType = rotationType.toLowerCase() === 'x' ? 'rx' : 
                                 rotationType.toLowerCase() === 'y' ? 'ry' : 'rz';
          
          return (
            <div className={`gate-target rotation-target gate-cr${rotationType.toLowerCase()}`}>
              R<sub>{rotationType}</sub><sup>{displayAngle}</sup>
              <div className="rotation-visualization">
                <AngleVisualization 
                  angle={angle} 
                  type={rotationVisType}
                />
              </div>
            </div>
          );
        } else if (targetGate.type === 'cp') {
          // Controlled phase gate
          const placement = targetGate;
          const phase = placement?.params?.phase || 0;
          const displayPhase = formatAngleDisplay(phase);
          
          return (
            <div className="gate-target phase-target">
              P<sup>{displayPhase}</sup>
            </div>
          );
        }
      }
      return null;
    }
    
    // For standalone gates (non-connection points)
    const gateType = gate.toLowerCase();
    
    // Single qubit gates
    const singleQubitGates = ['h', 'x', 'y', 'z', 's', 't', 'sdg', 'tdg'];
    if (singleQubitGates.includes(gateType)) {
      // Format gate display name
      let displayText = gateType.toUpperCase();
      if (gateType === 'sdg') displayText = 'S†';
      if (gateType === 'tdg') displayText = 'T†';
      
      return <div className={`gate-box gate-${gateType}`}>{displayText}</div>;
    }
      // Rotation gates (rx, ry, rz)
    const rotationGates = ['rx', 'ry', 'rz'];
    if (rotationGates.includes(gateType)) {
      // Find gate placement to get parameters
      const placement = circuit.find((g: GatePlacement) => g.x === x && g.y === y);
      const angle = placement?.params?.theta || (Math.PI/2); // Use theta for rotation angle parameter
      const displayAngle = formatAngleDisplay(angle);
        // Use CSS variables for colors from root
      const className = `gate-box gate-rotation gate-${gateType}`;
        return (
        <div className={className}>
          R<sub>{gateType.charAt(1).toUpperCase()}</sub><sup>{displayAngle}</sup>
          <div className="rotation-visualization">
            <AngleVisualization angle={angle} type={gateType as 'rx' | 'ry' | 'rz'} />
          </div>
        </div>
      );
    }
    
    // Phase gates (p, u1)
    const phaseGates = ['p', 'u1'];
    if (phaseGates.includes(gateType)) {
      // Find gate placement to get parameters
      const placement = circuit.find((g: GatePlacement) => g.x === x && g.y === y);
      const phase = placement?.params?.phase || 0;
      const displayPhase = formatAngleDisplay(phase);
      
      let displayText = gateType === 'p' ? 'P' : 'U₁';
      
      return (
        <div className={`gate-box gate-phase gate-${gateType}`}>
          {displayText}<sup>{displayPhase}</sup>
        </div>
      );
    }
    
    // U2 and U3 gates
    if (gateType === 'u2' || gateType === 'u3') {
      const placement = circuit.find((g: GatePlacement) => g.x === x && g.y === y);
      
      if (gateType === 'u2') {
        const phi = placement?.params?.phi || 0;
        const lambda = placement?.params?.lambda || 0;
        return (
          <div className="gate-box gate-universal">
            U₂
          </div>
        );
      } else { // u3
        const theta = placement?.params?.theta || 0;
        const phi = placement?.params?.phi || 0;
        const lambda = placement?.params?.lambda || 0;
        return (
          <div className="gate-box gate-universal">
            U₃
          </div>
        );
      }
    }
    
    // SWAP gate
    if (gateType === 'swap' || gateType === 'iswap') {
      return (
        <div className={`gate-box gate-swap ${gateType === 'iswap' ? 'gate-iswap' : ''}`}>
          ×
        </div>
      );
    }
    
    // Measurement gate
    if (gateType === 'measure') {
      return (
        <div className="gate-box gate-measure">
          M
        </div>
      );
    }
    
    // Default case - as a fallback
    return <div className="gate-box">{gateType.toUpperCase()}</div>;
  };
  // connectDropTarget과 connectDragSource를 함께 사용하여 드래그와 드롭 모두 가능하게 설정  // 게이트 배치 중일 때의 시각적 피드백을 위한 클래스 계산
  const cellPlacingStateClass = placingClassName || '';
  return connectDropTarget(
    connectDragSource(      <div 
        className={`circuit-cell ${isLast ? 'last-cell' : ''} 
                   ${isOver ? 'cell-hover' : ''} 
                   ${isDragging ? 'dragging' : ''}
                   ${cellPlacingStateClass}`}        data-x={x}
        data-y={y}        onDoubleClick={() => {
          // When a gate is double-clicked, trigger parameter dialog for supported gates
          if (gate && onCellClick) {
            onCellDoubleClick?.(x, y);
          }
        }}
        onClick={() => {
          // Handle cell click for gate placement
          if (onCellClick) {
            onCellClick(x, y);
          }
        }}
      >
        {renderGate()}
        {/* 게이트 배치 중인 경우 시각적 가이드 표시 */}
        {placingStep > 0 && placingGateType && (
          <div className={`gate-placement-guide step-${placingStep}`}></div>
        )}
      </div>
    )
  );
};

interface CircuitCanvasProps {
  circuit: GatePlacement[];
  qubitCount: number;  // number of qubits (wires)
  onDropGate: (x: number, y: number, type: string, params?: Record<string, number | undefined>) => void;
  onRemoveGate?: (x: number, y: number) => void;
}

// Using isMultiQubitGate from MultiQubitGateHandler instead of defining it inline

const CircuitCanvas: FC<CircuitCanvasProps> = ({ circuit, qubitCount, onDropGate, onRemoveGate }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const qubits = qubitCount;
  const timeSlots = 8; // could also be dynamic
  
  // Dialog state for gate parameters
  const [paramDialogOpen, setParamDialogOpen] = useState<boolean>(false);
  const [currentGate, setCurrentGate] = useState<GatePlacement | null>(null);
    
  // 게이트 배치 상태 관리 로직 추가
  const {
    startGatePlacement,
    handleCellClick: onPlacementCellClick,
    getCellClassName,
    cancelGatePlacement,
    placingGateType,
    placingStep
  } = useCircuitPlacement({
    qubitCount,
    timeSlots,
    onPlaceGate: (gatePlacement: GatePlacement) => {      // 다중 큐빗 게이트 배치 시 다양한 위치에 적절한 컨트롤 및 타겟 정보 추가
      if (isMultiQubitGate(gatePlacement.type)) {
        // 컨트롤 포인트에 게이트 배치
        onDropGate(
          gatePlacement.x, 
          gatePlacement.y, 
          gatePlacement.type
        );
        
        // 타겟 위치에 연결 표시를 위한 정보 업데이트
        // 이미 onDropGate에서 control과 target 정보를 처리하고 있다고 가정
        // 추가 처리가 필요하면 여기에 구현
      } else {
        // 단일 큐빗 게이트 배치
        onDropGate(gatePlacement.x, gatePlacement.y, gatePlacement.type);
      }
    }
  });
    // 셀 클릭 핸들러 - 게이트 배치 과정일 때는 배치 로직 활용
  const handleCellClick = (x: number, y: number) => {
    // 게이트 배치 중이면 배치 로직 처리
    if (placingGateType) {
      onPlacementCellClick(x, y);
    }
  };
    // Handle double-click on gates - particularly for parameterized gates
  const handleCellDoubleClick = (x: number, y: number) => {
    // Find the gate at this position
    const gate = circuit.find(g => g.x === x && g.y === y);
    
    if (gate) {
      // For rotation gates, open parameter dialog
      const rotationGates = ['rx', 'ry', 'rz'];
      if (rotationGates.includes(gate.type.toLowerCase())) {
        setCurrentGate(gate);
        setParamDialogOpen(true);
        return;
      }
      
      // For controlled rotation gates, check if this is a target
      if (gate.type.toLowerCase().startsWith('cr')) {
        setCurrentGate(gate);
        setParamDialogOpen(true);
        return;
      }
    }
    
    // Also check if this is a target of a controlled rotation gate
    const targetOfGate = circuit.find(g => g.target === x && g.y === y);
    if (targetOfGate && targetOfGate.type.toLowerCase().startsWith('cr')) {
      setCurrentGate(targetOfGate);
      setParamDialogOpen(true);
    }
  };  // Helper function to check if a gate needs parameter input
  const isParameterizedGate = (type: string): boolean => {
    const parameterizedGates = ['rx', 'ry', 'rz'];
    return parameterizedGates.includes(type.toLowerCase());
  };

  // 드래그된 게이트 드롭 처리
  const handleDropGate = (x: number, y: number, type: string) => {
    // 다중 큐빗 게이트인 경우 배치 모드로 전환
    if (isMultiQubitGate(type)) {
      startGatePlacement(type);    } else if (isParameterizedGate(type)) {
      // 파라미터가 필요한 단일 큐빗 게이트인 경우 파라미터 다이얼로그 열기
      const newGate: GatePlacement = {
        type: type,
        x: x,
        y: y,
        params: {
          angle: Math.PI / 4 // 기본값 π/4 (45도)
        }
      };
      setCurrentGate(newGate);
      setParamDialogOpen(true);
    } else {
      // 일반 단일 큐빗 게이트는 바로 배치
      onDropGate(x, y, type);
    }
  };
    // ESC 키로 게이트 배치 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && placingGateType) {
        cancelGatePlacement();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [placingGateType, cancelGatePlacement]);
  
  // Connection lines for multi-qubit gates like CNOT and CZ
  useEffect(() => {
    // Draw connections for multi-qubit gates
    const canvasRefElement = canvasRef.current;
    if (!canvasRefElement) return;
    
    // Get canvas context for drawing connections
    const canvas = document.createElement('canvas');
    canvas.width = canvasRefElement.offsetWidth;
    canvas.height = canvasRefElement.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none'; // Make sure it doesn't interfere with clicks
    canvas.style.zIndex = '1'; // Make sure it's above the cells but below other UI elements
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw connections for multi-qubit gates with improved styling
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Find multi-qubit gates
    circuit.forEach(gate => {
      if (isMultiQubitGate(gate.type) && gate.control !== undefined && gate.target !== undefined) {
        // Get DOM elements for control and target
        const controlCell = document.querySelector(`.circuit-cell[data-x="${gate.control}"][data-y="${gate.y}"]`);
        const targetCell = document.querySelector(`.circuit-cell[data-x="${gate.target}"][data-y="${gate.y}"]`);
        
        // For double-controlled gates (CCNOT, CCZ)
        const control2Cell = gate.control2 !== undefined ? 
          document.querySelector(`.circuit-cell[data-x="${gate.control2}"][data-y="${gate.y}"]`) : null;
          if (controlCell && targetCell) {
          const controlRect = controlCell.getBoundingClientRect();
          const targetRect = targetCell.getBoundingClientRect();
          const canvasRect = canvasRefElement.getBoundingClientRect();
          
          // Calculate positions relative to canvas
          const controlX = controlRect.left + controlRect.width/2 - canvasRect.left;
          const controlY = controlRect.top + controlRect.height/2 - canvasRect.top;
          const targetX = targetRect.left + targetRect.width/2 - canvasRect.left;
          const targetY = targetRect.top + targetRect.height/2 - canvasRect.top;
          
          // Draw line connecting control and target with anti-aliasing for smoother lines
          ctx.beginPath();
          ctx.moveTo(Math.round(controlX) + 0.5, Math.round(controlY) + 0.5);
          ctx.lineTo(Math.round(targetX) + 0.5, Math.round(targetY) + 0.5);
          
          // Use a slightly translucent line for better visual appearance
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.stroke();
          
          // Create a subtle shadow effect for the connection line
          ctx.beginPath();
          ctx.moveTo(Math.round(controlX) + 0.5, Math.round(controlY) + 1.5);
          ctx.lineTo(Math.round(targetX) + 0.5, Math.round(targetY) + 1.5);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.stroke();
          
          // Reset stroke style for future drawing operations
          ctx.strokeStyle = '#000';
            // If there's a second control point (for CCNOT, CCZ) - enhanced rendering
          if (control2Cell) {
            const control2Rect = control2Cell.getBoundingClientRect();
            const control2X = control2Rect.left + control2Rect.width/2 - canvasRect.left;
            const control2Y = control2Rect.top + control2Rect.height/2 - canvasRect.top;
            
            // Add a label for double-controlled gates
            const gateTypeLabel = gate.type === 'ccx' ? 'CCNOT' : 'CCZ';
            
            // Find the center of the three points
            const centerX = (controlX + control2X + targetX) / 3;
            const centerY = Math.min(controlY, control2Y, targetY) - 15;
            
            // Add a small label for the gate type
            ctx.font = '10px Arial';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.textAlign = 'center';
            ctx.fillText(gateTypeLabel, centerX, centerY);
            
            // If all three points are in a vertical line
            if (Math.abs(controlX - targetX) < 5 && Math.abs(targetX - control2X) < 5) {
              // Just draw direct lines with anti-aliasing
              ctx.beginPath();
              ctx.moveTo(Math.round(control2X) + 0.5, Math.round(control2Y) + 0.5);
              ctx.lineTo(Math.round(targetX) + 0.5, Math.round(targetY) + 0.5);
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
              ctx.stroke();
              
              // Shadow effect
              ctx.beginPath();
              ctx.moveTo(Math.round(control2X) + 0.5, Math.round(control2Y) + 1.5);
              ctx.lineTo(Math.round(targetX) + 0.5, Math.round(targetY) + 1.5);
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
              ctx.stroke();
              
              ctx.strokeStyle = '#000';
            }
            // If the points are not aligned
            else {
              // Sort control points by their x-coordinate
              const sortedPoints = [
                { x: controlX, y: controlY },
                { x: control2X, y: control2Y }, 
                { x: targetX, y: targetY }
              ].sort((a, b) => a.x - b.x);
              
              // Find the midpoint of the line connecting the leftmost and rightmost points
              const midX = (sortedPoints[0].x + sortedPoints[2].x) / 2;
              const midY = (sortedPoints[0].y + sortedPoints[2].y) / 2;
              
              // Draw main horizontal line through all points
              ctx.beginPath();
              ctx.moveTo(Math.round(sortedPoints[0].x) + 0.5, Math.round(sortedPoints[0].y) + 0.5);
              ctx.lineTo(Math.round(sortedPoints[2].x) + 0.5, Math.round(sortedPoints[2].y) + 0.5);
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
              ctx.stroke();
              
              // Connect middle point if it's not on the line
              if (Math.abs(sortedPoints[1].y - sortedPoints[0].y) > 5) {
                ctx.beginPath();
                ctx.moveTo(Math.round(sortedPoints[1].x) + 0.5, Math.round(sortedPoints[1].y) + 0.5);
                ctx.lineTo(Math.round(sortedPoints[1].x) + 0.5, Math.round(sortedPoints[0].y) + 0.5);
                ctx.stroke();
              }
              
              // Reset stroke style
              ctx.strokeStyle = '#000';
            }
          }
        }
      }
    });
    
    // Remove old canvas and add the new one
    const oldCanvas = canvasRefElement.querySelector('canvas');
    if (oldCanvas) {
      oldCanvas.remove();
    }
    canvasRefElement.appendChild(canvas);
    
    // Clean up function
    return () => {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [circuit, qubits]);
  
  // Helper function to draw connections between control and target qubits
  const drawGateConnections = (
    ctx: CanvasRenderingContext2D, 
    gate: GatePlacement, 
    canvasRect: DOMRect,
    canvasRefElement: HTMLDivElement
  ) => {
    // Get DOM elements for control and target
    const controlCell = document.querySelector(`.circuit-cell[data-x="${gate.control}"][data-y="${gate.y}"]`);
    const targetCell = document.querySelector(`.circuit-cell[data-x="${gate.target}"][data-y="${gate.y}"]`);
    
    // For double-controlled gates (CCNOT, CCZ)
    const control2Cell = gate.control2 !== undefined ? 
      document.querySelector(`.circuit-cell[data-x="${gate.control2}"][data-y="${gate.y}"]`) : null;
    
    if (!controlCell || !targetCell) return;
    
    // Calculate positions relative to canvas
    const controlRect = controlCell.getBoundingClientRect();
    const targetRect = targetCell.getBoundingClientRect();
    
    const controlX = controlRect.left + controlRect.width/2 - canvasRect.left;
    const controlY = controlRect.top + controlRect.height/2 - canvasRect.top;
    const targetX = targetRect.left + targetRect.width/2 - canvasRect.left;
    const targetY = targetRect.top + targetRect.height/2 - canvasRect.top;
    
    // Draw the main line connecting control and target
    ctx.beginPath();
    ctx.moveTo(controlX, controlY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    
    // Handle second control point for CCNOT, CCZ if present
    if (control2Cell) {
      const control2Rect = control2Cell.getBoundingClientRect();
      const control2X = control2Rect.left + control2Rect.width/2 - canvasRect.left;
      const control2Y = control2Rect.top + control2Rect.height/2 - canvasRect.top;
      
      // Find the middle point of the main connection
      const midX = (controlX + targetX) / 2;
      const midY = (controlY + targetY) / 2;
      
      // Draw the connection from the second control point
      ctx.beginPath();
      ctx.moveTo(control2X, control2Y);
      
      // If all points are roughly on the same horizontal line
      if (Math.abs(controlY - control2Y) < 5 && Math.abs(controlY - targetY) < 5) {
        // Direct line to target
        ctx.lineTo(targetX, targetY);
      }
      // If points are on the same vertical line
      else if (Math.abs(controlX - control2X) < 5 && Math.abs(controlX - targetX) < 5) {
        // Direct line to target
        ctx.lineTo(targetX, targetY);
      }
      // If points form a triangle or other shape
      else {
        // Draw to midpoint of main connection
        if (Math.abs(control2Y - midY) < 5) {
          // If second control is at same height as midpoint, direct line
          ctx.lineTo(midX, midY);
        } else {
          // Otherwise, go vertical first, then horizontal
          ctx.lineTo(control2X, midY);
          ctx.lineTo(midX, midY);
        }
      }
      ctx.stroke();
    }
  };  // Handle saving parameters from the dialog
  const handleSaveParameters = (params: Record<string, number>) => {
    if (currentGate && onDropGate) {
      // Check if this gate already exists in the circuit
      const existingGate = circuit.find(g => g.x === currentGate.x && g.y === currentGate.y);
        // Filter out undefined values from params to ensure type safety
      const cleanParams: Record<string, number> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanParams[key] = value;
        }
      });
      
      if (existingGate) {
        // Update existing gate: remove old one and add updated one
        onRemoveGate?.(currentGate.x, currentGate.y);
        
        // Create a new gate placement with updated parameters
        setTimeout(() => {
          const updatedGate: GatePlacement = {
            ...currentGate,
            params: {
              ...(currentGate.params || {}),
              ...cleanParams
            }
          };
          
          // Add the updated gate back to the circuit
          onDropGate(updatedGate.x, updatedGate.y, updatedGate.type, cleanParams);
        }, 50); // Small delay to ensure the remove operation is complete
      } else {
        // New gate from drag and drop: just add it with parameters
        const newGate: GatePlacement = {
          ...currentGate,
          params: {
            ...(currentGate.params || {}),
            ...cleanParams
          }
        };
          // Add the new gate with parameters to the circuit
        onDropGate(newGate.x, newGate.y, newGate.type, cleanParams);
      }
    }
    
    // Close the dialog and reset state
    setParamDialogOpen(false);
    setCurrentGate(null);
  };

  return (
    <div className="circuit-canvas" ref={canvasRef}>
       {/* Parameter dialog for rotation gates */}
       {currentGate && (
        <GateParameterDialog
          isOpen={paramDialogOpen}
          onClose={() => setParamDialogOpen(false)}
          onSave={handleSaveParameters}
          gateName={currentGate.type}
          params={currentGate.params || { theta: Math.PI/2 }}
        />
       )}
       
       {/* 큐빗 와이어 배경 */}
       <div className="qubit-wires">
        {Array.from({ length: qubits }).map((_, q) => (
          <div key={`wire-${q}`} className="qubit-wire"></div>
        ))}
      </div>
      
      {/* 게이트 그리드 */}
      <div className="circuit-grid">
        {Array.from({ length: qubits }).map((_, q) => (
           <div key={`row-${q}`} className="circuit-row">            {Array.from({ length: timeSlots }).map((_, t) => {
               // Find gate placement by position (qubit q, time slot t)
               const placement = circuit.find((g) => g.x === q && g.y === t);
               const isGatePresent = placement !== undefined;
               const isLast = t === timeSlots - 1;
               
               // Also check for multi-qubit gates where this cell might be a control or target
               const isControl = circuit.find(g => 
                 (g.control === q || g.control2 === q) && g.y === t
               ) !== undefined;
               
               const isTarget = circuit.find(g => 
                 g.target === q && g.y === t
               ) !== undefined;                 // 게이트 배치 중일 때 셀 클릭을 관리할 수 있는 cellClassName 계산
                 const placementClassName = placingGateType ? getCellClassName(q, t) : '';
                   return (
                 <GridCell
                  key={`cell-${q}-${t}`}  // cell at wire q and time t
                  x={q}
                  y={t}
                  onDropGate={handleDropGate} // 여기서 handleDropGate를 사용하여 다중 큐빗 게이트 처리
                  onRemoveGate={onRemoveGate}
                  gate={isGatePresent ? placement.type : (isControl || isTarget ? "connection" : undefined)}
                  isLast={isLast}
                  circuit={circuit}
                  placingStep={placingStep}
                  placingGateType={placingGateType}
                  onCellClick={handleCellClick}
                  onCellDoubleClick={handleCellDoubleClick}
                  isControlPoint={isControl}
                  isTargetPoint={isTarget}
                  placingClassName={placementClassName}
                 />
               );
             })}
           </div>
        ))}
      </div>
       
       {/* 측정 결과 표시 영역 */}
       <div className="measurement-area">
        {Array.from({ length: qubits }).map((_, q) => (
           <div key={`measure-${q}`} className="measurement-cell">
             <div className="measurement-icon">⟨</div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default CircuitCanvas;
//개같은 CNOt
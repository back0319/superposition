import { FC, useEffect, useRef, useState } from "react";

interface StateVectorData {
  amplitudes: { r: number; i: number }[];
  states: string[];
}

interface QSphereProps {
  stateVector: StateVectorData | null;
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

const QSphere: FC<QSphereProps> = ({ stateVector }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  
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
  
  if (!dataToDisplay) {
    return (
      <div className="qsphere-container qsphere-empty">
        <p>Run simulation to see Q-sphere visualization</p>
      </div>
    );
  }

  return (
    <div className="qsphere-container">
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
  
  // Process each amplitude
  for (let i = 0; i < amplitudes.length; i++) {
    const amp = amplitudes[i];
    const state = states[i] || `|${i.toString(2).padStart(Math.log2(amplitudes.length), '0')}⟩`;
    
    // Calculate probability and phase
    const probability = amp.r * amp.r + amp.i * amp.i;
    const phase = Math.atan2(amp.i, amp.r);
    
    // Skip states with near-zero probability
    if (probability < 0.001) continue;
    
    // Calculate point on Bloch sphere
    // This is a simplified mapping - in reality you'd need to map to specific angles
    // based on the quantum state representation
    const theta = Math.acos(1 - 2 * i / amplitudes.length); // Latitude
    const phi = (2 * Math.PI * i) / amplitudes.length;     // Longitude
    
    const point: Point3D = {
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
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

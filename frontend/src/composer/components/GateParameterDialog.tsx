import React, { useState, useEffect, useRef } from 'react';
import '../style/gate-parameter-dialog.scss';

interface GateParameterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: Record<string, number>) => void;
  gateName: string;
  params: {
    angle?: number;
    phase?: number;
    theta?: number;
    phi?: number;
    lambda?: number;
    t1?: number;
    t2?: number;
    [key: string]: number | undefined;
  };
  title?: string;
}

// Common angles for rotation gates based on Quirk's implementation
const COMMON_ANGLES = [
  { value: 0, display: '0' },
  { value: Math.PI / 8, display: 'π/8' },
  { value: Math.PI / 6, display: 'π/6' },
  { value: Math.PI / 4, display: 'π/4' },
  { value: Math.PI / 3, display: 'π/3' },
  { value: Math.PI / 2, display: 'π/2' },
  { value: 2 * Math.PI / 3, display: '2π/3' },
  { value: 3 * Math.PI / 4, display: '3π/4' },
  { value: 5 * Math.PI / 6, display: '5π/6' },
  { value: Math.PI, display: 'π' },
  { value: 5 * Math.PI / 4, display: '5π/4' },
  { value: 3 * Math.PI / 2, display: '3π/2' },
  { value: 7 * Math.PI / 4, display: '7π/4' },
  { value: 11 * Math.PI / 6, display: '11π/6' },
  { value: 2 * Math.PI, display: '2π' }
];

const formatAngleDisplay = (angle: number): string => {
  const PI = Math.PI;
  // Normalize angle to be between -2π and 2π
  const normalizedAngle = ((angle % (2*PI)) + 2*PI) % (2*PI);
  const absAngle = normalizedAngle > PI ? 2*PI - normalizedAngle : normalizedAngle;
  
  // Check for common fractions of PI
  for (const fraction of COMMON_ANGLES) {
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

const GateParameterDialog: React.FC<GateParameterDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  gateName, 
  params,
  title
}) => {  // Convert any undefined values to defaults
  const processedParams: Record<string, number> = {};
  Object.entries(params).forEach(([key, value]) => {
    processedParams[key] = value !== undefined ? value : Math.PI/2;
  });
  
  const [currentParams, setCurrentParams] = useState<Record<string, number>>(processedParams);
  const [activeParam, setActiveParam] = useState<string | null>(null);

  // Reset params when the dialog opens with new values
  useEffect(() => {
    const processed: Record<string, number> = {};
    Object.entries(params).forEach(([key, value]) => {
      processed[key] = value !== undefined ? value : Math.PI/2;
    });
    setCurrentParams(processed);
  }, [params]);

  if (!isOpen) return null;

  const handleParamChange = (paramName: string, value: number) => {
    setCurrentParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleCycleAngle = (paramName: string, direction: 'up' | 'down') => {
    const currentValue = currentParams[paramName];
    const currentIndex = COMMON_ANGLES.findIndex(
      angle => Math.abs(angle.value - currentValue) < 1e-10
    );
    
    let newIndex = currentIndex;
    if (direction === 'up') {
      newIndex = currentIndex >= 0 ? (currentIndex + 1) % COMMON_ANGLES.length : 0;
    } else {
      newIndex = currentIndex >= 0 
        ? (currentIndex - 1 + COMMON_ANGLES.length) % COMMON_ANGLES.length 
        : COMMON_ANGLES.length - 1;
    }
    
    const newValue = currentIndex >= 0 ? COMMON_ANGLES[newIndex].value : Math.PI / 2; // Default to π/2
    
    handleParamChange(paramName, newValue);
  };  const getDialogTitle = () => {
    if (title) return title;
    
    const gateType = gateName.toLowerCase();
    if (gateType === 'rx' || gateType === 'crx') return 'X-Rotation Gate Parameters';
    if (gateType === 'ry' || gateType === 'cry') return 'Y-Rotation Gate Parameters';
    if (gateType === 'rz' || gateType === 'crz') return 'Z-Rotation Gate Parameters';
    return `${gateName.toUpperCase()} Gate Parameters`;
  };

  const getParamLabel = (paramName: string) => {
    switch (paramName) {
      case 'theta': return 'θ - Rotation Angle';
      case 'phi': return 'φ - Phase Angle';
      case 'lambda': return 'λ - Lambda Angle';
      default: return paramName;
    }
  };
  const getGateColor = () => {
    const gateType = gateName.toLowerCase();
    // Handle both regular rotation gates and controlled rotation gates
    if (gateType.includes('rx') || gateType === 'crx') return 'var(--gate-rx-color)';
    if (gateType.includes('ry') || gateType === 'cry') return 'var(--gate-ry-color)';
    if (gateType.includes('rz') || gateType === 'crz') return 'var(--gate-rz-color)';
    return '#ff8f00';
  };
  // Helper to draw angle visualization
  const AngleVisualizer = ({ value, paramName }: { value: number, paramName: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw x-axis
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw y-axis
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX, centerY + radius);
        ctx.stroke();
        
        // Get the gate color
        const gateType = gateName.toLowerCase();
        let color = '#0F62FE';
        if (gateType.includes('rx') || gateType === 'crx') color = 'var(--gate-rx-color)';
        if (gateType.includes('ry') || gateType === 'cry') color = 'var(--gate-ry-color)';
        if (gateType.includes('rz') || gateType === 'crz') color = 'var(--gate-rz-color)';
        
        // Draw angle
        const startAngle = 0;
        const endAngle = value;
        
        // Draw angle arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius / 2, -startAngle, -endAngle, value > 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw radius line to indicate angle
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(-endAngle),
          centerY + radius * Math.sin(-endAngle)
        );
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
        
        // Add arrow at the end of the line
        const arrowLength = 10;
        const arrowAngle = 0.5;
        const angle = -endAngle;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - arrowLength * Math.cos(angle - arrowAngle),
          y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.lineTo(
          x - arrowLength * Math.cos(angle + arrowAngle),
          y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        // Draw center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }, [value]);
    
    return (
      <div className="angle-visualization">
        <canvas ref={canvasRef} width={140} height={140} />
      </div>
    );
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content parameter-dialog" style={{ borderTop: `4px solid ${getGateColor()}` }}>
        <div className="dialog-header">
          <h2>{getDialogTitle()}</h2>
          <div className="gate-description">
            Set the {Object.keys(currentParams).map(p => getParamLabel(p).split(' ')[0]).join(', ')} parameters for the {gateName.toUpperCase()} gate
          </div>
        </div>
        
        <div className="parameters-container">
          {Object.entries(currentParams).map(([paramName, value]) => (
            <div 
              key={paramName} 
              className={`parameter-row ${activeParam === paramName ? 'active' : ''}`}
              onClick={() => setActiveParam(paramName)}
            >
              <div className="parameter-label">{getParamLabel(paramName)}</div>
              <div className="parameter-controls">
                <button 
                  className="angle-cycle-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCycleAngle(paramName, 'down');
                  }}
                  title="Cycle angle down"
                >
                  <span className="arrow-icon">▼</span>
                </button>
                <div className="angle-display">
                  {formatAngleDisplay(value)}
                </div>
                <button 
                  className="angle-cycle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCycleAngle(paramName, 'up');
                  }}
                  title="Cycle angle up"
                >
                  <span className="arrow-icon">▲</span>
                </button>
              </div>
              
              <div className="angle-input-container">
                <input 
                  type="range" 
                  min="0" 
                  max={(2 * Math.PI).toString()} 
                  step="0.01"
                  value={value.toString()} 
                  onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                />
              </div>
              
              {/* Visualization is only shown for the active parameter */}
              {activeParam === paramName && <AngleVisualizer value={value} paramName={paramName} />}
              
              {/* Common angle presets */}
              <div className="preset-buttons">
                {COMMON_ANGLES.slice(0, 8).map((angle) => (
                  <button
                    key={angle.display}
                    className={Math.abs(value - angle.value) < 1e-10 ? 'active' : ''}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleParamChange(paramName, angle.value);
                    }}
                  >
                    {angle.display}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="dialog-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="btn-apply"            onClick={() => {
              onSave(currentParams);
              onClose();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default GateParameterDialog;

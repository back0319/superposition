import React, { useState, useEffect } from 'react';
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

  return (
    <div className="dialog-overlay">
      <div className="dialog-content parameter-dialog" style={{ borderTop: `4px solid ${getGateColor()}` }}>
        <div className="dialog-title">{getDialogTitle()}</div>
        
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
                >
                  ▼
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
                >
                  ▲
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={() => {
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

// 파일: frontend/src/composer/components/GateDialog.tsx

import React, { FC, useState, useEffect } from "react";
import { getGateById } from "../utils/gateDefinitions";
import '../style/multi-qubit-gate-dialog.scss';
import '../style/dialog-overlay.scss';

interface GateDialogProps {
  gateType: string;
  onConfirm: (control: number, target: number, params?: Record<string, number>, control2?: number) => void;
  onCancel: () => void;
  qubitCount: number;
  initialParams?: Record<string, number>;
}

const GateDialog: FC<GateDialogProps> = ({ gateType, onConfirm, onCancel, qubitCount, initialParams }) => {
  // State for each qubit selection
  const [control, setControl] = useState<number>(0);
  const [control2, setControl2] = useState<number>(1);
  const [target, setTarget] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [params, setParams] = useState<Record<string, number>>({});
  const [selectionStep, setSelectionStep] = useState<number>(0);
  
  const options = Array.from({ length: qubitCount }, (_, i) => i);
  const gateDefinition = getGateById(gateType);

  const isParameterized = gateDefinition?.params && gateDefinition.params.length > 0;
  const isMultiQubit = ["CNOT", "CZ", "CCNOT", "CCZ"].includes(gateType);
  const isThreeQubit = ["CCNOT", "CCZ"].includes(gateType);
  
  // Reset selection when gate type changes
  useEffect(() => {
    // Default initial values
    setControl(0);
    setControl2(1);
    setTarget(isThreeQubit ? 2 : 1);
    setSelectionStep(0);
    
    // Initialize parameters with default values from gate definition
    if (gateDefinition?.params) {
      const defaultParams: Record<string, number> = {};
      gateDefinition.params.forEach(param => {
        defaultParams[param.name] = initialParams?.[param.name] !== undefined 
          ? initialParams[param.name] 
          : param.defaultValue;
      });
      setParams(defaultParams);
    }
  }, [gateType, gateDefinition, initialParams, isThreeQubit]);
  
  // Validate control and target qubits
  useEffect(() => {
    const qubits = isThreeQubit ? [control, control2, target] : [control, target];
    const uniqueQubits = new Set(qubits);
    
    if (uniqueQubits.size !== qubits.length) {
      setError("큐비트 위치가 모두 달라야 합니다");
    } else {
      setError("");
    }
  }, [control, control2, target, isThreeQubit]);
  
  const handleQubitClick = (qubit: number) => {
    if (isThreeQubit) {
      if (selectionStep === 0) {
        setControl(qubit);
        setSelectionStep(1);
      } else if (selectionStep === 1) {
        if (qubit !== control) {
          setControl2(qubit);
          setSelectionStep(2);
        }
      } else if (selectionStep === 2) {
        if (qubit !== control && qubit !== control2) {
          setTarget(qubit);
          setSelectionStep(3);
        }
      }
    } else {
      if (selectionStep === 0) {
        setControl(qubit);
        setSelectionStep(1);
      } else if (selectionStep === 1) {
        if (qubit !== control) {
          setTarget(qubit);
          setSelectionStep(2);
        }
      }
    }
  };
  
  const resetSelection = (step?: number) => {
    // Allow resetting to a specific step
    const resetTo = step !== undefined ? step : 0;
    
    setSelectionStep(resetTo);
    if (resetTo <= 0) setControl(0);
    if (resetTo <= 1) setControl2(1);
    if (resetTo <= 2) setTarget(isThreeQubit ? 2 : 1);
  };
  
  const handleConfirm = () => {
    if (isThreeQubit) {
      onConfirm(control, target, params, control2);
    } else {
      onConfirm(control, target, params);
    }
  };
  
  const getSelectionMessage = () => {
    if (isThreeQubit) {
      if (selectionStep === 0) return "첫 번째 컨트롤 큐비트를 선택하세요";
      if (selectionStep === 1) return "두 번째 컨트롤 큐비트를 선택하세요";
      if (selectionStep === 2) return "타겟 큐비트를 선택하세요";
      return "확인을 눌러 게이트를 설정하세요";
    } else {
      if (selectionStep === 0) return "컨트롤 큐비트를 선택하세요";
      if (selectionStep === 1) return "타겟 큐비트를 선택하세요";
      return "확인을 눌러 게이트를 설정하세요";
    }
  };
  
  const getGateTitle = () => {
    switch (gateType) {
      case "CNOT": return "CNOT 게이트 설정";
      case "CZ": return "CZ 게이트 설정";
      case "CCNOT": return "CCNOT (Toffoli) 게이트 설정";
      case "CCZ": return "CCZ 게이트 설정";
      default: return `${gateType} 게이트 설정`;
    }
  };

  const getGateDescription = () => {
    switch (gateType) {
      case "CNOT": return "컨트롤 큐비트가 |1⟩일 때 타겟 큐비트에 X 게이트를 적용합니다.";
      case "CZ": return "컨트롤 큐비트가 |1⟩일 때 타겟 큐비트에 Z 게이트를 적용합니다.";
      case "CCNOT": return "두 컨트롤 큐비트가 모두 |1⟩일 때만 타겟 큐비트에 X 게이트를 적용합니다.";
      case "CCZ": return "두 컨트롤 큐비트가 모두 |1⟩일 때만 타겟 큐비트에 Z 게이트를 적용합니다.";
      default: return "";
    }
  };
  
  const getGateColor = () => {
    switch (gateType) {
      case "CNOT": return "#0F62FE";  // IBM Blue
      case "CZ": return "#1192E8";    // IBM Cyan
      case "CCNOT": return "#0353E9"; // IBM Dark Blue
      case "CCZ": return "#0072C3";   // Darker IBM Cyan
      default: return "#0F62FE";      // Default IBM Blue
    }
  };
    // Get the CSS variables for the current gate type
  const getGateStyle = () => {
    const color = getGateColor();
    // Convert hex to RGB for CSS variables
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '15, 98, 254'; // Default IBM blue
    };
    
    return {
      '--accent-color': color,
      '--accent-color-rgb': hexToRgb(color)
    } as React.CSSProperties;
  };

  return (
    <div className="dialog-overlay">
      <div className="multi-qubit-dialog dialog-content" style={{ 
        borderTop: `4px solid ${getGateColor()}`,
        ...getGateStyle()
      }}>
        <div className="dialog-header">
          <h2>{getGateTitle()}</h2>
          <p className="gate-description">{getGateDescription()}</p>
        </div>
        
        {error && (
          <div className="form-info" style={{ backgroundColor: "#fff1f1", borderLeftColor: "#da1e28" }}>
            {error}
          </div>
        )}        <div className="qubit-selection">
          <div className="selection-header">
            <div className="selection-label">큐비트 선택</div>
            {selectionStep > 0 && (
              <button 
                className="reset-selection-btn" 
                onClick={() => resetSelection(0)}
                title="선택 리셋"
              >
                ↺ 다시 선택
              </button>
            )}
          </div>
          <div className="selection-message">{getSelectionMessage()}</div><div className="selection-steps">
            <div 
              className={`step ${selectionStep >= 0 ? 'active' : ''}`}
              data-label={isThreeQubit ? '컨트롤 1' : '컨트롤'}
            >
              1
            </div>
            {isThreeQubit && (
              <div 
                className={`step ${selectionStep >= 1 ? 'active' : ''}`}
                data-label="컨트롤 2"
              >
                2
              </div>
            )}
            <div 
              className={`step ${selectionStep >= (isThreeQubit ? 2 : 1) ? 'active' : ''}`}
              data-label="타겟"
            >
              {isThreeQubit ? '3' : '2'}
            </div>
            <div 
              className={`step ${selectionStep >= (isThreeQubit ? 3 : 2) ? 'active' : ''}`}
              data-label="확인"
            >
              ✓
            </div>
          </div>
          <div className="selection-grid">
            {options.map((qubit) => {
              const isControlSelected = qubit === control;
              const isControl2Selected = isThreeQubit && qubit === control2;
              const isTargetSelected = qubit === target;
              const isSelected = isControlSelected || isControl2Selected || isTargetSelected;
                // Determine next role based on selections so far
              let nextRole = "";
              if (isThreeQubit) {
                if (selectionStep === 0) nextRole = "컨트롤 1";
                else if (selectionStep === 1) nextRole = "컨트롤 2";
                else if (selectionStep === 2) nextRole = "타겟";
              } else {
                if (selectionStep === 0) nextRole = "컨트롤";
                else if (selectionStep === 1) nextRole = "타겟";
              }
                const handleQubitSelection = () => {
                // Use the existing handleQubitClick function instead
                handleQubitClick(qubit);
              };
              
              return (                <div 
                  key={qubit}
                  className={`qubit-option ${isControlSelected ? 'selected-control' : ''} 
                            ${isControl2Selected ? 'selected-control secondary' : ''} 
                            ${isTargetSelected ? 'selected-target' : ''}
                            ${isSelected ? '' : 'selectable'}`}
                  onClick={() => handleQubitClick(qubit)}
                >
                  <div className="qubit-index">q[{qubit}]</div>
                  {isControlSelected && (
                    <>
                      <div className="qubit-role">컨트롤</div>
                      <div className="control-indicator"></div>
                    </>
                  )}
                  {isControl2Selected && (
                    <>
                      <div className="qubit-role">컨트롤 2</div>
                      <div className="control-indicator"></div>
                    </>
                  )}
                  {isTargetSelected && (
                    <>
                      <div className="qubit-role">타겟</div>
                      {(gateType === "CNOT" || gateType === "CCNOT") ? (
                        <div className="target-x-indicator"></div>
                      ) : (
                        <div className="target-z-indicator">Z</div>
                      )}
                    </>
                  )}
                  {!isSelected && (
                    <div className="next-role-hint">{nextRole}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
          <div className="gate-preview">
          <div className="preview-title">게이트 프리뷰</div>
          <div className="preview-circuit">
            {/* Control Qubit Wire */}
            <div className="preview-wire">              {control !== undefined && (
                <div 
                  className="preview-control animate-in" 
                  style={{ backgroundColor: getGateColor() }}
                />
              )}
              <div className="wire-label">q[{control}]</div>
            </div>
            
            {/* Second Control Qubit Wire (for CCNOT, CCZ) */}
            {isThreeQubit && (
              <div className="preview-wire">                {control2 !== undefined && (
                  <div 
                    className="preview-control animate-in" 
                    style={{ 
                      animationDelay: '0.05s',
                      backgroundColor: getGateColor()
                    }} 
                  />
                )}
                <div className="wire-label">q[{control2}]</div>
              </div>
            )}
            
            {/* Target Qubit Wire */}
            <div className="preview-wire">
              {target !== undefined && (          <div 
                className={`preview-target animate-in ${gateType === "CNOT" || gateType === "CCNOT" ? 'cnot' : ''}`}
                style={{ 
                  animationDelay: isThreeQubit ? '0.1s' : '0.05s',
                  borderColor: getGateColor(),
                  color: getGateColor()
                }}
              >
                {(gateType === "CZ" || gateType === "CCZ") && "Z"}
              </div>
              )}
              <div className="wire-label">q[{target}]</div>
            </div>            {/* Vertical connector line */}
            {!error && (
              <div className="connector-line animate-in" style={{ 
                height: isThreeQubit ? '76px' : '28px',
                top: isThreeQubit ? '-76px' : '-28px',
                backgroundColor: getGateColor()
              }} />
            )}
          </div>
        </div>
        
        <div className="dialog-actions">
          <button onClick={onCancel} className="cancel-button">취소</button>
          <button 
            onClick={handleConfirm} 
            className="confirm-button"
            disabled={!!error}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default GateDialog;

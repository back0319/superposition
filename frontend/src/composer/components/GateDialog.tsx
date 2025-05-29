// 파일: frontend/src/composer/components/GateDialog.tsx

import { FC, useState, useEffect } from "react";
import { getGateById } from "../utils/gateDefinitions";

interface GateDialogProps {
  gateType: string;
  onConfirm: (control: number, target: number, params?: Record<string, number>, control2?: number) => void;
  onCancel: () => void;
  qubitCount: number;
  initialParams?: Record<string, number>;
}

const GateDialog: FC<GateDialogProps> = ({ gateType, onConfirm, onCancel, qubitCount, initialParams }) => {
  const [control, setControl] = useState(0);
  const [control2, setControl2] = useState(1);
  const [target, setTarget] = useState(2);
  const [error, setError] = useState("");
  const [params, setParams] = useState<Record<string, number>>({});
  
  const options = Array.from({ length: qubitCount }, (_, i) => i);
  const gateDefinition = getGateById(gateType);

  const isParameterized = gateDefinition?.params && gateDefinition.params.length > 0;
  const isMultiQubit = ["CNOT", "CZ", "CCNOT", "CCZ"].includes(gateType);
  const isThreeQubit = ["CCNOT", "CCZ"].includes(gateType);
    // Reset selection when gate type changes
  useEffect(() => {
    setControl(0);
    setControl2(1);
    setTarget(isThreeQubit ? 2 : 1);
    
    // Initialize parameters with default values from gate definition
    if (gateDefinition?.params) {
      const defaultParams: Record<string, number> = {};
      gateDefinition.params.forEach(param => {
        // Use initial value if provided, otherwise use default
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
      setError("All qubits must be different");
    } else {
      setError("");
    }
  }, [control, control2, target, qubitCount, isMultiQubit, isThreeQubit]);
  const handleConfirm = () => {
    // Simplified function that just passes the target qubit
    onConfirm(0, target, undefined, undefined);
  };
  
  const handleParamChange = (name: string, value: number) => {
    setParams(prev => ({
      ...prev,
      [name]: value
    }));
  };  // Simplified gate title - all gates are treated the same
  const getGateTitle = () => {
    return `Gate Configuration`;
  };
    
  // Simple placeholder symbol for all gates
  const getTargetSymbol = () => {
    return '•';
  };
    return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2 className="dialog-title">{getGateTitle()} Setup</h2>
        
        {error && <div className="error-message">{error}</div>}          <div className="gate-visual-simplified">
            <div className="qubit-wire-visual">
              {options.map(idx => (
                <div key={idx} className="qubit-slot">
                  <div className="qubit-label">q[{idx}]</div>
                  <div className="gate-placeholder">•</div>
                </div>
              ))}
            </div>
            
            <div className="qubit-selectors">
              <div className="selector-group">
                <label>Qubit Position:</label>
                <select 
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="qubit-select"
                >
                  {options.map((o) => (
                    <option key={`qubit-${o}`} value={o}>
                      {`q[${o}]`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>        <div className="gate-info-simplified">
          <div className="info-message">
            Gate functionality has been removed as requested.
            All gates now display as simple placeholders.
          </div>
        </div>
          <div className="dialog-footer">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button
            onClick={handleConfirm}
            className="btn-primary"
            disabled={!!error}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default GateDialog;

// 파일: frontend/src/composer/pages/CircuitEditor.tsx

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";

import GatePalette from "../components/GatePalette";
import CircuitCanvas from "../components/CircuitCanvas";
import ResultChart from "../components/ResultChart";
import QSphere from "../components/QSphere";
import GateDialog from "../components/GateDialog";
import { generateQASM } from "../utils/qasmGenerator";
import { saveCircuit, loadCircuit } from "../utils/circuitStorage";
import { getGateById } from "../utils/gateDefinitions";
import { GatePlacement } from "../types";
import "../../component/layout/circuit.scss";
import "../style/quirk-gates.scss"; // Import Quirk-inspired gate styles
import "../style/quirk-circuit.scss"; // Import Quirk-inspired circuit layout
import "../style/quirk-layout.scss"; // Import Quirk-inspired layout

// Import test functions for development/debugging
import "../utils/quirkGateTest";

function CircuitEditor() {
  // State management for the circuit
  const [circuit, setCircuit] = useState<GatePlacement[]>([]);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [stateVector, setStateVector] = useState<any | null>(null);
  const [qasm, setQasm] = useState<string>("");
  const [gateDialog, setGateDialog] = useState<{ 
    type: string; 
    x: number; 
    y: number;
    params?: Record<string, number>;
  } | null>(null);
  const [qubitCount, setQubitCount] = useState(3);  // Default number of qubits
  
  // UI state management
  const [selectedTab, setSelectedTab] = useState<"editor" | "visualization">("editor");
  const [viewMode, setViewMode] = useState<"split" | "code" | "visual">("split");
  const [visMode, setVisMode] = useState<"probabilities" | "qsphere">("probabilities");
  
  // Quirk-inspired theme
  const [useQuirkTheme, setUseQuirkTheme] = useState(true);

  // Generate QASM whenever the circuit changes
  useEffect(() => {
    setQasm(generateQASM(circuit, qubitCount));
  }, [circuit, qubitCount]);  const onDropGate = (x: number, y: number, type: string, params?: Record<string, number | undefined>) => {
    // Get existing gate if any
    const existingGate = circuit.find(g => g.x === x && g.y === y);
    
    // Multi-qubit gates need a dialog to select control/target qubits
    if (["CX", "CZ", "CH", "SWAP", "CNOT", "CCNOT", "CCZ"].includes(type)) {
      setGateDialog({ type, x, y });
    } else {      // For parameterized gates, if params are provided, add directly to circuit
      if (params) {
        // Filter out undefined values to ensure type safety
        const cleanParams: Record<string, number> = {};
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            cleanParams[key] = value;
          }
        });
        setCircuit((prev) => [...prev.filter((g) => !(g.x === x && g.y === y)), { x, y, type, params: cleanParams }]);
      } else {
        // Check if gate needs parameters via dialog
        const gateDefinition = getGateById(type);
        if (gateDefinition?.params && gateDefinition.params.length > 0) {
          setGateDialog({ 
            type, 
            x, 
            y, 
            params: existingGate?.params // Pass existing params if any
          });
        } else {
          setCircuit((prev) => [...prev.filter((g) => !(g.x === x && g.y === y)), { x, y, type }]);
        }
      }
    }
  };
  
  // 회로에서 게이트를 제거하는 함수
  const onRemoveGate = (x: number, y: number) => {
    setCircuit((prev) => prev.filter((g) => !(g.x === x && g.y === y)));
  };  const confirmGateDialog = (control: number, target: number, params?: Record<string, number>, control2?: number) => {
    if (!gateDialog) return;
    const { type, x, y } = gateDialog;
    
    // Check if it's a multi-qubit gate
    if (["CX", "CZ", "CH", "SWAP", "CNOT", "CCNOT", "CCZ"].includes(type)) {
      setCircuit((prev) => [
        ...prev.filter((g) => !(g.x === x && g.y === y)),
        { x, y, type, control, target, control2 },
      ]);
    } else {
      // It's a parameterized gate
      setCircuit((prev) => [
        ...prev.filter((g) => !(g.x === x && g.y === y)),
        { x, y, type, params },
      ]);
    }
    
    // Update the gate's matrix if it has parameters
    const gateDefinition = getGateById(type);
    if (params && gateDefinition?.updateMatrix) {
      // This would update the internal matrix of the gate with the new parameters
      gateDefinition.updateMatrix(params);
    }
    
    setGateDialog(null);
  };

  const cancelGateDialog = () => setGateDialog(null);
  const runSimulation = async () => {
    try {
      // state에 저장된 qasm 사용
      const res = await axios.post("http://localhost:5000/simulate", { qasm });
      setResult(res.data.counts || res.data);
      
      // Handle state vector data if available
      if (res.data.statevector) {
        const states = [];
        const amplitudes = [];
        
        // Process state vector data
        for (let i = 0; i < res.data.statevector.length; i++) {
          const state = `|${i.toString(2).padStart(qubitCount, '0')}⟩`;
          states.push(state);
          
          const amp = res.data.statevector[i];
          if (typeof amp === 'number') {
            // Real number
            amplitudes.push({ r: amp, i: 0 });
          } else if (Array.isArray(amp)) {
            // [real, imaginary] format
            amplitudes.push({ r: amp[0], i: amp[1] });
          } else if (typeof amp === 'object' && 'r' in amp && 'i' in amp) {
            // {r, i} format
            amplitudes.push(amp);
          }
        }
        
        setStateVector({ amplitudes, states });
      } else {
        // If no state vector is provided, convert probabilities to a basic state vector
        const states = Object.keys(res.data).map(key => `|${key}⟩`);
        const amplitudes = Object.values(res.data).map((prob: any) => {
          const sqrtProb = Math.sqrt(Number(prob));
          return { r: sqrtProb, i: 0 }; // Assuming all real amplitudes
        });
        
        setStateVector({ amplitudes, states });
      }
      
      setSelectedTab("visualization");
    } catch (err: any) {
      // 서버가 보낸 에러 메시지를 alert/콘솔에 출력
      console.error("Simulation error:", err.response?.data);
      alert(
        `시뮬레이션 실패:\n${err.response?.data?.error || err.message}`
      );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="quantum-composer">
        <div className="composer-header">
          <h1>Quantum Composer</h1>
          <div className="view-controls">
            <button 
              className={`view-button ${viewMode === "split" ? "active" : ""}`} 
              onClick={() => setViewMode("split")}
            >
              Split View
            </button>
            <button 
              className={`view-button ${viewMode === "code" ? "active" : ""}`} 
              onClick={() => setViewMode("code")}
            >
              Code View
            </button>
            <button 
              className={`view-button ${viewMode === "visual" ? "active" : ""}`} 
              onClick={() => setViewMode("visual")}
            >
              Visual View
            </button>
          </div>
        </div>
        
        <div className="composer-layout">
          {/* 왼쪽 패널: 게이트 팔레트 */}
          <div className="gate-palette-panel">
            <div className="panel-header">
              <h2>Operations</h2>
              <div className="panel-controls">
                <button className="icon-button" title="Collapse panel">⟪</button>
                <button className="icon-button" title="Reset view">⟲</button>
                <button className="icon-button" title="Show grid">□</button>
              </div>
            </div>
            
            <div className="search-bar">
              <input type="text" placeholder="Search" />
              <div className="view-options">
                <button className="icon-button">≡</button>
                <button className="icon-button">≣</button>
              </div>
            </div>
            
            <GatePalette save={() => saveCircuit(circuit)} load={() => setCircuit(loadCircuit())} />
            
            <div className="qubit-control">
              <label>Qubit Count:</label>
              <select 
                value={qubitCount} 
                onChange={(e) => setQubitCount(Number(e.target.value))}
              >
                {[2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 중앙 패널: 메인 컨텐츠 영역 */}
          <div className="main-content-area">
            <div className="tabs-container">
              <div className="tabs">
                <button 
                  className={`tab ${selectedTab === "editor" ? "active" : ""}`}
                  onClick={() => setSelectedTab("editor")}
                >
                  Circuit Editor
                </button>
                <button 
                  className={`tab ${selectedTab === "visualization" ? "active" : ""}`}
                  onClick={() => setSelectedTab("visualization")}
                >
                  Visualization
                </button>
              </div>
              
              <div className="tab-content">
                {selectedTab === "editor" ? (
                  <div className="circuit-editor">
                    <div className="qubit-labels">
                      {Array.from({ length: qubitCount }).map((_, idx) => (
                        <div key={idx} className="qubit-label">q[{idx}]</div>
                      ))}
                    </div>                    <CircuitCanvas 
                      circuit={circuit} 
                      qubitCount={qubitCount}
                      onDropGate={onDropGate} 
                      onRemoveGate={onRemoveGate} 
                    />
                  </div>
                ) : (                <div className="visualization-panel">
                    <div className="visualization-tabs">
                      <button 
                        className={`viz-tab ${visMode === "probabilities" ? "active" : ""}`}
                        onClick={() => setVisMode("probabilities")}
                      >
                        Probabilities
                      </button>
                      <button 
                        className={`viz-tab ${visMode === "qsphere" ? "active" : ""}`}
                        onClick={() => setVisMode("qsphere")}
                      >
                        Q-sphere
                      </button>
                    </div>
                    
                    <div className="visualization-content">
                      {visMode === "probabilities" ? (
                        <ResultChart data={result} />
                      ) : (
                        <QSphere stateVector={stateVector} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 오른쪽 패널: OpenQASM 코드 */}
          <div className="qasm-panel">
            <div className="panel-header">
              <h2>OpenQASM 2.0</h2>
              <div className="panel-controls">
                <button className="icon-button" title="Copy code">📋</button>
                <button className="icon-button" title="More options">⋮</button>
              </div>
            </div>
            
            <div className="code-container">
              <pre className="code-editor">
                <div className="code-line">
                  <span className="line-number">1</span>
                  <code className="code-keyword">OPENQASM 2.0;</code>
                </div>
                <div className="code-line">
                  <span className="line-number">2</span>
                  <code className="code-include">include "qelib1.inc";</code>
                </div>
                <div className="code-line">
                  <span className="line-number">3</span>
                  <code className="code-register">qreg q[{qubitCount}];</code>
                </div>
                <div className="code-line">
                  <span className="line-number">4</span>
                  <code className="code-register">creg c[{qubitCount}];</code>
                </div>
                {qasm.split("\n").slice(3).map((line, idx) => (
                  <div className="code-line" key={idx + 5}>
                    <span className="line-number">{idx + 5}</span>
                    <code>{line}</code>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="composer-footer">
          <button 
            onClick={runSimulation} 
            className="run-button"
          >
            Run Simulation
          </button>
          
          <div className="footer-controls">
            <button className="save-button">Save Circuit</button>
            <button className="export-button">Export Results</button>
            <div className="tips">
              <span className="tip-text">💡 Double-click on rotation or phase gates to adjust their parameters</span>
            </div>
          </div>
        </div>          {gateDialog && (
          <GateDialog
            gateType={gateDialog.type}
            onConfirm={confirmGateDialog}
            onCancel={cancelGateDialog}
            qubitCount={qubitCount}
            initialParams={gateDialog.params}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default CircuitEditor;

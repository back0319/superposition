// 파일: frontend/src/composer/pages/CircuitEditor.tsx

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd/dist/core";
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

// Import styles in the correct order for proper CSS cascading
import "../style/ibm-quantum-circuit.scss";      // IBM Quantum Composer circuit layout styling
import "../style/ibm-quantum-gates.scss";        // IBM Quantum Composer gate styling
import "../style/ibm-quantum-layout.scss";       //  Quantum Composer overall layout styling
import "../style/gate-parameter-dialog.scss";    // Parameter dialog styles
import "../style/multi-qubit-gates.scss";        // Multi-qubit gate styles
import "../style/rotation-gates.scss";           // Rotation gate styles
import "../style/qasm-analysis.scss";            // QASM 분석 결과 스타일
import { getApiUrl, API_ENDPOINTS } from "../../config/api";

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
  const [viewMode, setViewMode] = useState<"split" | "code" | "visual">("split");  const [visMode, setVisMode] = useState<"probabilities" | "qsphere">("probabilities");
  const [visualizationImages, setVisualizationImages] = useState<{
    bloch_sphere?: string;
    histogram?: string;
    circuit_text?: string;
  }>({});
    // Quirk-inspired theme
  const [useQuirkTheme, setUseQuirkTheme] = useState(true);
  
  // QASM 코드 분석 결과를 저장하는 상태 변수
  const [qasmAnalysis, setQasmAnalysis] = useState<{
    analysis?: {
      num_qubits: number;
      depth: number;
      gate_counts: Record<string, number>;
      circuit_text: string;
    };
    python_code?: string;
    visualization?: {
      circuit_image?: string;
      circuit_text?: string;
    };
  } | null>(null);

  // Generate QASM whenever the circuit changes
  useEffect(() => {
    setQasm(generateQASM(circuit, qubitCount));
  }, [circuit, qubitCount]);const onDropGate = (x: number, y: number, type: string, params?: Record<string, number | undefined>) => {
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
  
  // QASM 코드를 분석하는 함수
  const analyzeQasm = async () => {
    try {
      if (!qasm) {
        alert("분석할 QASM 코드가 없습니다.");
        return;
      }
      
      console.log("QASM 분석 요청:", qasm);
      
      // QASM 분석 요청
      const res = await axios.post(getApiUrl(API_ENDPOINTS.ANALYZE_QASM), { qasm });
      console.log("QASM 분석 응답:", res.data);
      
      // 분석 결과 저장
      setQasmAnalysis(res.data);
      
      // 회로 변환 요청 (회로 이미지 얻기)
      const convertRes = await axios.post(getApiUrl(API_ENDPOINTS.CONVERT_QASM), { 
        placedGates: circuit,
        qubitCount
      });
      
      if (convertRes.data.visualization) {
        setQasmAnalysis(prev => ({
          ...prev,
          visualization: {
            ...prev?.visualization,
            circuit_image: convertRes.data.visualization.circuit_image,
            circuit_text: convertRes.data.visualization.circuit_text,
          }
        }));
      }
      
    } catch (err: any) {
      console.error("QASM 분석 오류:", err.response?.data);
      alert(`QASM 분석 실패:\n${err.response?.data?.error || err.message}`);
    }
  };
  
  const runSimulation = async () => {
    try {
      console.log("=== 시뮬레이션 시작 ===");
      console.log("현재 QASM 코드:", qasm);
      console.log("큐비트 개수:", qubitCount);
      
      // 서버에 QASM 코드 전송
      const res = await axios.post(getApiUrl(API_ENDPOINTS.SIMULATE), { qasm });
      console.log("시뮬레이션 응답 전체:", res.data);
      
      // 시각화 이미지 처리
      if (res.data.visualization) {
        setVisualizationImages(res.data.visualization);
        console.log("Qiskit 시각화 이미지 수신 완료");
      }
      
      // 확률 데이터 설정 (counts 우선, 백업으로 result 또는 전체 데이터)
      let probabilityData = null;
      if (res.data.counts && Object.keys(res.data.counts).length > 0) {
        probabilityData = res.data.counts;
        console.log("확률 데이터 (counts):", probabilityData);
      } else if (res.data.result && Object.keys(res.data.result).length > 0) {
        probabilityData = res.data.result;
        console.log("확률 데이터 (result):", probabilityData);
      } else {
        // 마지막 시도: 전체 응답에서 확률 형태 데이터 찾기
        const responseKeys = Object.keys(res.data);
        const probableKeys = responseKeys.filter(key => 
          typeof res.data[key] === 'object' && 
          res.data[key] !== null &&
          !Array.isArray(res.data[key]) &&
          key !== 'visualization' &&
          key !== 'qiskit_info'
        );
        
        if (probableKeys.length > 0) {
          probabilityData = res.data[probableKeys[0]];
          console.log(`확률 데이터 (${probableKeys[0]}):`, probabilityData);
        }
      }
      
      if (probabilityData) {
        setResult(probabilityData);
        console.log("확률 데이터 상태 업데이트 완료:", probabilityData);      } else {
        console.warn("확률 데이터를 찾을 수 없습니다. 응답 구조:", res.data);
        setResult({});
      }
      
      // 상태 벡터 데이터 처리
      if (res.data.statevector && Array.isArray(res.data.statevector) && res.data.statevector.length > 0) {
        console.log("상태 벡터 원시 데이터:", res.data.statevector);
        
        const states = [];
        const amplitudes = [];
          // 상태 벡터 데이터 처리
        for (let index = 0; index < res.data.statevector.length; index++) {
          // 상태명 생성 |000⟩, |001⟩, 등
          const state = `|${index.toString(2).padStart(qubitCount, '0')}⟩`;
          states.push(state);
          
          // 상태 진폭(amplitude) 추출
          const amp = res.data.statevector[index];
          let amplitudeObj = { r: 0, i: 0 };
          
          if (typeof amp === 'number') {
            // 실수인 경우
            amplitudeObj = { r: amp, i: 0 };
          } else if (Array.isArray(amp) && amp.length >= 2) {
            // [실수, 허수] 배열 형식인 경우
            amplitudeObj = { r: amp[0] || 0, i: amp[1] || 0 };
          } else if (typeof amp === 'object' && amp !== null && 'r' in amp && 'i' in amp) {
            // {r, i} 객체 형식인 경우
            amplitudeObj = { r: amp.r || 0, i: amp.i || 0 };
          }          // 불필요하게 작은 진폭값들 정리
          const r = Math.abs(amplitudeObj.r) < 1e-10 ? 0 : amplitudeObj.r;
          const imaginary = Math.abs(amplitudeObj.i) < 1e-10 ? 0 : amplitudeObj.i;
          amplitudes.push({ r, i: imaginary });
        }
        
        console.log("처리된 상태 벡터:", { amplitudes, states });
        setStateVector({ amplitudes, states });
        
      } else if (probabilityData && Object.keys(probabilityData).length > 0) {
        // 상태 벡터가 없는 경우, 확률에서 대략적인 상태 벡터 생성
        console.log("확률에서 상태 벡터 근사 생성");
        
        const fullStates = [];
        const fullAmplitudes = [];
        const stateCount = Math.pow(2, qubitCount);
        
        for (let j = 0; j < stateCount; j++) {
          const bitString = j.toString(2).padStart(qubitCount, '0');
          const state = `|${bitString}⟩`;
          fullStates.push(state);
          
          // 이 상태가 probabilityData에 있는지 확인
          const prob = probabilityData[bitString] || 0;
          const sqrtProb = Math.sqrt(Number(prob));
          fullAmplitudes.push({ r: sqrtProb, i: 0 }); // 간소화: 모두 실수 진폭으로 가정
        }
        
        console.log("근사 상태 벡터:", { amplitudes: fullAmplitudes, states: fullStates });
        setStateVector({ amplitudes: fullAmplitudes, states: fullStates });
      }
      // 시각화 탭으로 전환
      setSelectedTab("visualization");
      console.log("=== 시뮬레이션 완료 ===");
      
    } catch (err: any) {
      // 서버가 보낸 에러 메시지를 alert/콘솔에 출력
      console.error("=== 시뮬레이션 오류 ===");
      console.error("Error object:", err);
      console.error("Response data:", err.response?.data);
      
      const errorMessage = err.response?.data?.error || err.message || "알 수 없는 오류가 발생했습니다.";
      alert(`시뮬레이션 실패:\n${errorMessage}`);
      
      // 결과 초기화
      setResult(null);
      setStateVector(null);
      setVisualizationImages({});
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
                        visualizationImages.histogram ? (
                          <div className="qiskit-histogram-container">
                            <img 
                              src={`data:image/png;base64,${visualizationImages.histogram}`} 
                              alt="Qiskit Histogram" 
                              className="qiskit-histogram-image"
                            />
                            <ResultChart data={result} />
                          </div>
                        ) : (
                          <ResultChart data={result} />
                        )
                      ) : (
                        <QSphere 
                          stateVector={stateVector} 
                          qiskitBlochImage={visualizationImages.bloch_sphere}
                        />
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
                <button className="icon-button" title="Copy code" onClick={() => navigator.clipboard.writeText(qasm)}>📋</button>
                <button className="icon-button" title="Analyze QASM" onClick={analyzeQasm}>🔍</button>
                <button className="icon-button" title="More options">⋮</button>
              </div>
            </div>
            
            <div className="code-container">
              {qasmAnalysis && (
                <div className="qasm-analysis">
                  <h3>QASM 분석 결과</h3>
                  
                  {qasmAnalysis.visualization?.circuit_image && (
                    <div className="circuit-visualization">
                      <h4>회로 시각화</h4>
                      <img 
                        src={`data:image/png;base64,${qasmAnalysis.visualization.circuit_image}`}
                        alt="Circuit Visualization"
                        className="circuit-image"
                      />
                    </div>
                  )}
                  
                  {qasmAnalysis.analysis && (
                    <div className="circuit-info">
                      <h4>회로 정보</h4>
                      <table className="info-table">
                        <tbody>
                          <tr>
                            <td>큐비트 수:</td>
                            <td>{qasmAnalysis.analysis.num_qubits}</td>
                          </tr>
                          <tr>
                            <td>회로 깊이:</td>
                            <td>{qasmAnalysis.analysis.depth}</td>
                          </tr>
                          <tr>
                            <td>게이트 수:</td>
                            <td>
                              {Object.entries(qasmAnalysis.analysis.gate_counts).map(([gate, count]) => (
                                <span key={gate}>{gate}: {count}, </span>
                              ))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {qasmAnalysis.python_code && (
                    <div className="python-code">
                      <h4>Qiskit Python 코드</h4>
                      <pre>{qasmAnalysis.python_code}</pre>
                    </div>
                  )}
                  
                  <button 
                    className="close-analysis-btn"
                    onClick={() => setQasmAnalysis(null)}
                  >
                    분석 결과 닫기
                  </button>
                </div>              )}
              
              {!qasmAnalysis && (
                <pre className="code-editor">
                  {qasm.split('\n').map((line, index) => (
                    <div className="code-line" key={index}>
                      <span className="line-number">{index + 1}</span>
                      <code className={line.includes('OPENQASM') || line.includes('include') ? 'code-keyword' : ''}>
                        {line}
                      </code>
                    </div>
                  ))}
                </pre>
              )}
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

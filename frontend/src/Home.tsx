import React, { useState } from "react";
import apiClient from "./utils/api";
import "./component/button.scss";
import { useNavigate } from "react-router-dom";

interface SimulationResult {
  qubits: number;
  gates_applied: number;
  shots: number;
  measurements: any[];
  probabilities: any[];
  execution_time: string;
}

function Home() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const simulateQuantum = async () => {
    const qasmCode = `
OPENQASM 2.0;
include "qelib1.inc";
qreg q[1];
h q[0];
`;

    try {
      const response = await apiClient.post("/simulate", {
        circuit: qasmCode,
        qubits: 1,
        gates: [{ type: "H", target: 0 }],
        shots: 1000
      });
      
      // 백엔드는 전체 응답을 response.data로 반환
      setResult(response.data);
      setError(null);
      navigate("/content");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error occurred");
      setResult(null);
      navigate("/content");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Quantum Circuit Simulator</h1>
      <button className="btn btn-slide" onClick={simulateQuantum}>
        Run Quantum Circuit
      </button>
      <br />
      <br />
      {result && (
        <div>
          <h3>시뮬레이션 결과:</h3>
          <p>큐비트 수: {result.qubits}</p>
          <p>적용된 게이트: {result.gates_applied}</p>
          <p>측정 횟수: {result.shots}</p>
          <p>실행 시간: {result.execution_time}</p>
          <p>확률 분포: {JSON.stringify(result.probabilities)}</p>
        </div>
      )}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
    </div>
  );
}

export default Home;

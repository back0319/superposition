import React, { useState } from "react";
import axios from "axios";

function App() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateQuantum = async () => {
    const qasmCode = `
OPENQASM 2.0;
include "qelib1.inc";
qreg q[1];
h q[0];
`;

    try {
      const response = await axios.post("http://localhost:5000/simulate", {
        circuit: qasmCode,
      });
      setResult(response.data.result);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error occurred");
      setResult(null);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Quantum Circuit Simulator</h1>
      <button onClick={simulateQuantum}>Run Quantum Circuit</button>
      <br />
      <br />
      {result && (
        <div>
          <h2>Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div style={{ color: "red" }}>
          <h2>Error</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

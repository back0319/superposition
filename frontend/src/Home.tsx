import React, { useState } from "react";
import axios from "axios";
import "./component/button.scss";
import { useNavigate } from "react-router-dom";

function Home() {
  const [result, setResult] = useState<any>(null);
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
      const response = await axios.post("http://localhost:5000/simulate", {
        circuit: qasmCode,
      });
      setResult(response.data.result);
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
      {result && <div>Result: {result}</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
    </div>
  );
}

export default Home;

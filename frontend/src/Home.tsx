import React, { useState } from "react";
import axios from "axios";
import "./component/button.scss";
import { useNavigate } from "react-router-dom";

function Home() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 바로 Content 로 이동만 합니다.
  const simulateQuantum = () => {
    navigate("/content");
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

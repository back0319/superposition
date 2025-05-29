import React, { useState } from "react";
import "../component/layout/content.scss";
import "../component/button.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Content() {
  const [showConceptButtons, setShowConceptButtons] = useState(false);
  const [showCircuitButtons, setShowCircuitButtons] = useState(false);
  const navigate = useNavigate();

  // 양자 버튼 클릭 → concept 페이지
  const handleConceptClick = async () => {
    try {
      await axios.get("http://localhost:5000/concept");
      navigate("/concept");
    } catch {
      alert("서버 요청에 실패했습니다.");
    }
  };

  // 중첩 버튼 클릭 → entangle 페이지
  const handleEtmClick = async () => {
    try {
      await axios.get("http://localhost:5000/entangle");
      navigate("/entangle");
    } catch {
      alert("서버 요청에 실패했습니다.");
    }
  };

  // 큐비트 버튼 클릭 → qubit 페이지
  const handleQubitClick = async () => {
    try {
      await axios.get("http://localhost:5000/qubit-info");
      navigate("/qubit");
    } catch {
      alert("서버 요청에 실패했습니다.");
    }
  };

  // 회로 버튼 클릭 → circuit 페이지
  const handleCircuitClick = async () => {
    try {
      await axios.get("http://localhost:5000/circuit");
      navigate("/circuit");
    } catch {
      alert("서버 요청에 실패했습니다.");
    }
  };

  return (
    <div className="content-container">
      <div
        className="content-section concept"
        onMouseEnter={() => setShowConceptButtons(true)}
        onMouseLeave={() => setShowConceptButtons(false)}
      >
        <span>개념</span>
        {showConceptButtons && (
          <div style={{ display: "flex", gap: "2rem" }}>
            <button className="btn btn-slide" onClick={handleConceptClick}>
              양자
            </button>
            <button className="btn btn-slide" onClick={handleEtmClick}>
              중첩
            </button>
            <button className="btn btn-slide" onClick={handleEtmClick}>
              얽힘
            </button>
            <button className="btn btn-slide" onClick={handleQubitClick}>
              큐비트
            </button>
          </div>
        )}
      </div>
      <div
        className="content-section circuit"
        onMouseEnter={() => setShowCircuitButtons(true)}
        onMouseLeave={() => setShowCircuitButtons(false)}
      >
        <span>회로</span>
        {showCircuitButtons && (
          <div style={{ display: "flex", gap: "2rem" }}>
            <button className="btn btn-slide" onClick={handleCircuitClick}>
              기본 회로
            </button>
          </div>
        )}
      </div>
      <div className="content-section practice">
        <span>실습</span>
      </div>
    </div>
  );
}

export default Content;
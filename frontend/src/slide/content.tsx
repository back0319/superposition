import React, { useState } from "react";
import "../component/layout/content.scss";
import "../component/button.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Content() {
  const [showConceptButtons, setShowConceptButtons] = useState(false);
  const navigate = useNavigate();

  // 큐비트 버튼 클릭 시 서버에 요청 후 이동
  const handleQubitClick = async () => {
    try {
      const response = await axios.get("http://localhost:5000/qubit-info");
      navigate("/qubit");
    } catch (error) {
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
          <div style={{ display: "flex", gap: "2rem"}}>
            <button className="btn btn-slide" onClick={handleQubitClick}>큐비트</button>
            <button className="btn btn-slide">얽힘</button>
            <button className="btn btn-slide">중첩</button>
          </div>
        )}
      </div>
      <div className="content-section circuit"><span>회로</span></div>
      <div className="content-section practice"><span>실습</span></div>
    </div>
  );
}

export default Content;
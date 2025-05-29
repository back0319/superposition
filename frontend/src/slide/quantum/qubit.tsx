import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SlideMenu from "../slide";

function Qubit() {
  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();

  // 페이지 매핑
  const pageMap: Record<string, string[]> = {
    "큐비트": ["/qubit", "/qubit1", "/qubit2"],
    "얽힘": ["/entangle", "/entangle1"],
    "중첩": ["/superpose", "/superpose1"]
  };

  const handleSlideChange = (title: string, detailIdx: number) => {
    const path = pageMap[title]?.[detailIdx];
    if (path) navigate(path);
  };

  return (
    <SlideMenu
      current="큐비트"
      detailIdx={0}
      onChange={handleSlideChange}
      bodyLeft={
        <div style={{
          width: "100%",
          height: "100%",
          background: "#222",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <h1>큐비트란?</h1>
          <p style={{ fontSize: "1.5rem", maxWidth: 600, textAlign: "center" }}>
            전통 컴퓨터에서는 <span style={{ color: "orange" }}>Bit</span>를 사용하지만, 양자 컴퓨터에서는 <span style={{ color: "orange" }}>Quantum Bit</span>의 약자인 <span style={{ color: "orange" }}>Qubit</span>를 사용합니다.
          </p>
        </div>
      }
      bodyRight={null}
    />
  );
}

export default Qubit;
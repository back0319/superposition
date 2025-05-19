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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#222",
        color: "#fff",
        position: "relative"
      }}
    >
      <SlideMenu
        current="큐비트"
        detailIdx={0}
        onOpenChange={setMenuOpen}
        onChange={handleSlideChange}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: menuOpen ? "60%" : "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "left 0.4s cubic-bezier(0.77,0,0.175,1)"
        }}
      >
        <h1>큐비트란?</h1>
        <p style={{ fontSize: "1.5rem", maxWidth: 600, textAlign: "center" }}>
          전통 컴퓨터에서는 <span style={{ color: "orange" }}>Bit</span>를 사용하지만, 양자 컴퓨터에서는 <span style={{ color: "orange" }}>Qu</span>antum <span style={{ color: "orange" }}>Bit</span>의 약자인 <span style={{ color: "orange" }}>Qubit</span>를 사용합니다.
        </p>
      </div>
    </div>
  );
}

export default Qubit;
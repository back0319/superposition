import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SlideMenu from "../slide";

function Qubit2() {
  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();

  const pageMap: Record<string, string[]> = {
    "얽힘": ["/entangle", "/entangle1"],
    "중첩": ["/superpose", "/superpose1"],
    "큐비트": ["/qubit", "/qubit1", "/qubit2"]
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
        detailIdx={1}
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
        <h1>상태벡터</h1>
        <p style={{ fontSize: "1.5rem", maxWidth: 600, textAlign: "center" }}>
          상태벡터에 대한 설명을 여기에 작성하세요...
        </p>
      </div>
    </div>
  );
}

export default Qubit2;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SlideMenu from "../slide";

function Qubit1() {
  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();

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
      detailIdx={1}
      onChange={handleSlideChange}
      bodyLeft={
        <div
          style={{
            width: "100vw",
            height: "100vh",
            background: "#222",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <h1>상태벡터</h1>
          <p style={{ fontSize: "1.5rem", maxWidth: 600, textAlign: "center" }}>
            큐비트의 상태를 나타내는 벡터입니다. 양자 컴퓨터의 핵심 개념 중 하나입니다.
          </p>
        </div>
      }
      bodyRight={null}
    />
  );
}

export default Qubit1;
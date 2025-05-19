import React from "react";
import SlideMenu from "../slide"; // slide.tsx에서 SlideMenu import

function Qubit() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#222",
      color: "#fff",
      position: "relative"
    }}>
      {/* 좌측 목차 */}
      <SlideMenu current="큐비트" />

      {/* 본문 내용 */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "60%", // 좌측 20%+여유를 고려해 60%로 조정
          transform: "translate(-50%, -50%)",
          width: "60vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
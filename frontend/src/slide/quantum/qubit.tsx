import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SlideMenu from "../slide";
import { useCenterSection } from "../useCenterSection";

function Qubit() {
  const navigate = useNavigate();
  const contentSections = useRef<Array<HTMLElement | null>>([]);
  
  // useCenterSection 훅을 사용하여 현재 화면 중앙에 있는 섹션 감지
  const centerSection = useCenterSection('.content-section', 0.6);

  // 페이지 매핑
  const pageMap: Record<string, string[]> = {
    "얽힘": ["/entangle", "/entangle1"],
    "중첩": ["/superpose", "/superpose1"],
    "큐비트": ["/qubit", "/qubit1", "/qubit2"]
  };

  const handleSlideChange = (title: string, detailIdx: number) => {
    const path = pageMap[title]?.[detailIdx];
    if (path) navigate(path);
  };
  // 스크롤 위치 변경에 따라 센터 섹션 업데이트
  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 이벤트가 발생할 때 추가 로직을 구현할 수 있습니다.
      // useCenterSection 훅이 대부분의 작업을 처리하므로, 
      // 여기서는 추가적인 동작이 필요하면 구현합니다.
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
        detailIdx={3}
        onChange={handleSlideChange}
      />

      <div className="slide-content">
        {/* 섹션 1 */}        <div 
          className="content-section"
          ref={(el) => {
            if (el) contentSections.current[0] = el;
          }}
          style={{
            position: "relative",
            width: "80%",
            margin: "0 auto 4rem auto",
            padding: "2rem",
            borderRadius: "1rem",
            transition: "all 0.3s ease"
          }}
        >
          <h1>큐비트란?</h1>
          <p style={{ fontSize: "1.5rem", maxWidth: 600, textAlign: "center" }}>
            전통 컴퓨터에서는 <span style={{ color: "orange" }}>Bit</span>를 사용하지만, 양자 컴퓨터에서는 <span style={{ color: "orange" }}>Qu</span>antum <span style={{ color: "orange" }}>Bit</span>의 약자인 <span style={{ color: "orange" }}>Qubit</span>를 사용합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Qubit;
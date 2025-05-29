import React, { useEffect, useRef, useState, ReactNode } from "react";
import "../component/slide.scss";

interface MenuItem {
  title: string;
  details: string[];
}

const menu: MenuItem[] = [
  { title: "큐비트", details: ["정의", "상태벡터", "블로흐 구"] },
  { title: "얽힘", details: ["벨 상태", "얽힘 측정"] },
  { title: "중첩", details: ["중첩 원리", "하드라마드 게이트"] }
];

export interface SlideMenuProps {
  current?: string;
  detailIdx?: number;
  onChange?: (title: string, detailIdx: number) => void;
  /** 본문 좌측에 렌더할 컴포넌트 (텍스트만 존재) */
  bodyLeft: ReactNode;
  /** 본문 우측에 렌더할 컴포넌트 (필요하지 않다면 null) */
  bodyRight: ReactNode;
}

export default function SlideMenu({
  current = "큐비트",
  detailIdx = 0,
  onChange,
  bodyLeft,
  bodyRight
}: SlideMenuProps) {
  const activeIdx = menu.findIndex(m => m.title === current);
  const details = menu[activeIdx].details;
  const count = details.length;

  const textRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setAtBottom(scrollTop + clientHeight >= scrollHeight - 5);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goNext = () => {
    if (detailIdx < count - 1 && onChange) {
      onChange(current, detailIdx + 1);
      if (textRef.current) textRef.current.scrollTop = 0;
    }
  };

  return (
    <div
      className="slide-container"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#222" // 전체 화면에 어두운 배경 적용
      }}
    >
      {/* 상단 메뉴 10% 영역 */}
      <div
        style={{
          height: "10%",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          padding: "0 3vw"
        }}
      >
        {/* 왼쪽 대단원 표시 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: "180px",
            marginRight: "2vw"
          }}
        >
          {menu.map((item, idx) => (
            <div
              key={item.title}
              style={{
                fontWeight: idx === activeIdx ? "bold" : "normal",
                fontSize: idx === activeIdx ? "2rem" : "1.5rem",
                color: idx === activeIdx ? "#ffb300" : "#bbb",
                marginRight: "2vw",
                transition: "color 0.3s, font-size 0.3s"
              }}
            >
              {item.title}
            </div>
          ))}
        </div>

        {/* → 여기에 프로그레스 바 영역 */}
        <div
          style={{
            position: "relative",
            flex: 1,
            height: "100%"
          }}
        >
          {/* 배경 바 */}
          <div
            className="slide-timeline-bg"
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "100%",
              height: "4px",
              background: "#444",
              borderRadius: "2px",
              transform: "translateY(-50%)"
            }}
          />
          {/* 진행 바 */}
          <div
            className="slide-timeline-progress"
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width:
                count === 1
                  ? "100%"
                  : `${(detailIdx / (count - 1)) * 100}%`,
              height: "4px",
              background: "#ffb200",
              borderRadius: "2px",
              transform: "translateY(-50%)",
              transition: "width 0.6s ease"
            }}
          />

          {/* 소단원 도트 + 레이블 */}
          {details.map((label, i) => {
            const pct = count === 1 ? 0 : (i / (count - 1)) * 100;
            const isActive = i <= detailIdx;
            return (
              <div
                key={label}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  top: "60%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  zIndex: 2
                }}
              >
                <div
                  className="slide-dot"
                  style={{
                    width: isActive ? 16 : 12,
                    height: isActive ? 16 : 12,
                    borderRadius: "50%",
                    background: isActive ? "#ffb200" : "#fff",
                    border: "2px solid #ffb200",
                    marginBottom: "0.25rem",
                    transition: "all 0.3s ease"
                  }}
                />
                <div
                  className="slide-dot-label"
                  style={{
                    fontSize: "0.9rem",
                    color: isActive ? "#ffb200" : "#bbb",
                    whiteSpace: "nowrap",
                    transition: "color 0.3s ease"
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 본문 90% 영역 (텍스트 콘텐츠만 존재) */}
      <div
        ref={textRef}
        style={{
          height: "90%",
          width: "100%",
          padding: "2rem",
          boxSizing: "border-box",
          overflowY: "auto"
        }}
      >
        {bodyLeft}
      </div>

      {/* (선택 사항) 하단에 "다음 소단원" 버튼 표시 */}
      {atBottom && detailIdx < count - 1 && (
        <button
          onClick={goNext}
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            background: "#ffb300",
            color: "#232323",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
          }}
        >
          다음 소단원 →
        </button>
      )}
    </div>
  );
}
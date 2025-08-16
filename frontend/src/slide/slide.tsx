import React, { useState, useEffect, useRef, useCallback } from "react";
import "../component/slide.scss";

const menu = [
  {
    title: "큐비트",
    details: ["정의", "상태벡터", "블로흐 구"]
  },
  {
    title: "얽힘",
    details: ["벨 상태", "얽힘 측정"]
  },
  {
    title: "중첩",
    details: ["중첩 원리", "하드라마드 게이트"]
  }
];

function SlideMenu({ current = "큐비트", onChange }: { current?: string, onChange?: (title: string) => void }) {
  const [open, setOpen] = useState(true);
  const [activeIdx, setActiveIdx] = useState(() => menu.findIndex(m => m.title === current));
  const wheelLock = useRef(false);

  const handleIndexChange = useCallback((newIdx: number) => {
    // 상태 업데이트를 더 안전하게 처리
    setActiveIdx(prev => {
      if (prev === newIdx) return prev; // 같은 값이면 업데이트 안함
      if (onChange) {
        // onChange 호출을 다음 tick으로 지연
        setTimeout(() => onChange(menu[newIdx].title), 0);
      }
      return newIdx;
    });
  }, [onChange]);

  // 마우스 휠로 슬라이드 이동
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (wheelLock.current) return;
      
      let newIdx = activeIdx;
      if (e.deltaY > 0 && activeIdx < menu.length - 1) {
        newIdx = activeIdx + 1;
      } else if (e.deltaY < 0 && activeIdx > 0) {
        newIdx = activeIdx - 1;
      }
      
      if (newIdx !== activeIdx) {
        wheelLock.current = true;
        handleIndexChange(newIdx);
        setTimeout(() => { 
          wheelLock.current = false; 
        }, 700);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIdx, handleIndexChange]);

  useEffect(() => {
    // 외부에서 current가 바뀌면 activeIdx도 바꿔줌 (activeIdx 의존성 제거로 무한 루프 방지)
    const newIdx = menu.findIndex(m => m.title === current);
    if (newIdx !== -1) {
      setActiveIdx(newIdx);
    }
  }, [current]); // activeIdx 의존성 제거

  return (
    <div
      className="slide-menu"
      style={{
        width: open ? "20vw" : "40px",
        height: "100vh",
        transition: "width 0.3s"
      }}
    >
      <button className="slide-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? "◀" : "▶"}
      </button>
      {open && (
        <ul className="slide-list">
          {menu.map((item, idx) => (
            <li
              key={item.title}
              style={{
                opacity: idx === activeIdx ? 1 : 0.7,
                fontWeight: idx === activeIdx ? "bold" : "normal"
              }}
            >
              {item.title}
              <ul className="slide-detail">
                {item.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SlideMenu;
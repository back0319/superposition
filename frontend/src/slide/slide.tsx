import React, { useState, useEffect, useRef } from "react";
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
  const [activeIdx, setActiveIdx] = useState(menu.findIndex(m => m.title === current));
  const wheelLock = useRef(false);

  // 마우스 휠로 슬라이드 이동
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (wheelLock.current) return;
      if (e.deltaY > 0 && activeIdx < menu.length - 1) {
        wheelLock.current = true;
        setActiveIdx(idx => {
          const next = Math.min(menu.length - 1, idx + 1);
          onChange && onChange(menu[next].title);
          return next;
        });
      } else if (e.deltaY < 0 && activeIdx > 0) {
        wheelLock.current = true;
        setActiveIdx(idx => {
          const prev = Math.max(0, idx - 1);
          onChange && onChange(menu[prev].title);
          return prev;
        });
      }
      setTimeout(() => { wheelLock.current = false; }, 700); // 중복 방지
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIdx, onChange]);

  useEffect(() => {
    // 외부에서 current가 바뀌면 activeIdx도 바꿔줌
    setActiveIdx(menu.findIndex(m => m.title === current));
  }, [current]);

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
import React, { useState, useEffect, useRef } from "react";
import "../component/slide.scss";

const menu = [
  { title: "큐비트", details: ["정의", "상태벡터", "블로흐 구"] },
  { title: "얽힘", details: ["벨 상태", "얽힘 측정"] },
  { title: "중첩", details: ["중첩 원리", "하드라마드 게이트"] }
];

type SlideMenuProps = {
  current?: string;
  detailIdx?: number; // 현재 세부 주제 인덱스
  onChange?: (title: string, detailIdx: number) => void;
  onOpenChange?: (open: boolean) => void;
};

function SlideMenu({
  current = "큐비트",
  detailIdx = 0,
  onChange,
  onOpenChange
}: SlideMenuProps) {
  const [open, setOpen] = useState(true);
  const wheelLock = useRef(false);

  // 현재 주제/세부주제 인덱스
  const activeIdx = menu.findIndex(m => m.title === current);

  // 마우스 휠로 슬라이드 이동
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (wheelLock.current) return;
      const details = menu[activeIdx].details;
      if (e.deltaY > 0) {
        // 다음 세부 주제 또는 다음 주제
        if (detailIdx < details.length - 1) {
          wheelLock.current = true;
          onChange && onChange(menu[activeIdx].title, detailIdx + 1);
        } else if (activeIdx < menu.length - 1) {
          wheelLock.current = true;
          onChange && onChange(menu[activeIdx + 1].title, 0);
        }
      } else if (e.deltaY < 0) {
        // 이전 세부 주제 또는 이전 주제
        if (detailIdx > 0) {
          wheelLock.current = true;
          onChange && onChange(menu[activeIdx].title, detailIdx - 1);
        } else if (activeIdx > 0) {
          const prevDetails = menu[activeIdx - 1].details;
          wheelLock.current = true;
          onChange && onChange(menu[activeIdx - 1].title, prevDetails.length - 1);
        }
      }
      setTimeout(() => { wheelLock.current = false; }, 700);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIdx, detailIdx, onChange]);

  useEffect(() => {
    if (onOpenChange) onOpenChange(open);
  }, [open, onOpenChange]);

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
                {item.details.map((d, dIdx) => (
                  <li
                    key={d}
                    style={{
                      opacity: idx === activeIdx && dIdx === detailIdx ? 1 : 0.7,
                      transition: "opacity 0.4s"
                    }}
                  >
                    {d}
                  </li>
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
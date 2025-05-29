import React, { useEffect, useRef, useState } from "react";
import "../component/slide.scss";

// 대단원 및 소단원 구조 정의
const menu = [
  { 
    title: "큐비트", 
    details: ["정의", "상태벡터", "블로흐 구"] 
  },
  { 
    title: "중첩", 
    details: ["중첩 원리", "하드라마드 게이트", "중첩 응용"] 
  },
  { 
    title: "얽힘", 
    details: ["얽힘", "벨 상태", "얽힘 측정", "얽힘 응용"] 
  }
];

// 색상 정의
const colors = {
  primary: "#4f8cff",
  secondary: "#34c759",
  inactive: "#666",
  background: "#222"
};

type SlideMenuProps = {
  current?: string;
  detailIdx?: number;
  onChange?: (title: string, detailIdx: number) => void;
  sectionRefs?: React.MutableRefObject<Array<HTMLElement | null>>;
};

function SlideMenu({
  current = "큐비트",
  detailIdx = 0,
  onChange,
  sectionRefs
}: SlideMenuProps) {
  const wheelLock = useRef(false);
  const activeIdx = menu.findIndex(m => m.title === current);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // 총 페이지 수 계산
  const totalPages = menu.reduce((acc, chapter) => acc + chapter.details.length, 0);
  
  // 현재 페이지 계산
  const currentPage = menu.slice(0, activeIdx).reduce((acc, chapter) => acc + chapter.details.length, 0) + detailIdx + 1;
  
  // 진행률 계산 (%)
  const progress = (currentPage / totalPages) * 100;

  // 프로그레스 바 포인트 생성
  const [points, setPoints] = useState<{position: number, title: string, active: boolean}[]>([]);
  
  // 프로그레스 바 포인트 계산
  useEffect(() => {
    const newPoints = [];
    let currentPos = 0;
    
    for (let i = 0; i < menu.length; i++) {
      const chapter = menu[i];
      for (let j = 0; j < chapter.details.length; j++) {
        const isActive = i === activeIdx && j === detailIdx;
        newPoints.push({
          position: (currentPos / totalPages) * 100,
          title: chapter.details[j],
          active: isActive
        });
        currentPos++;
      }
    }
    
    setPoints(newPoints);
  }, [activeIdx, detailIdx, totalPages]);

  // 마우스 휠로 슬라이드 이동
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (wheelLock.current) return;
      const details = menu[activeIdx].details;
      
      // 좌우 스크롤 대신 상하 스크롤을 감지하여 페이지 이동
      if (e.deltaY > 0) {  // 아래 방향 (다음 페이지)
        if (detailIdx < details.length - 1) {
          wheelLock.current = true;
          onChange?.(menu[activeIdx].title, detailIdx + 1);
        } else if (activeIdx < menu.length - 1) {
          wheelLock.current = true;
          onChange?.(menu[activeIdx + 1].title, 0);
        }
      } else if (e.deltaY < 0) {  // 위 방향 (이전 페이지)
        if (detailIdx > 0) {
          wheelLock.current = true;
          onChange?.(menu[activeIdx].title, detailIdx - 1);
        } else if (activeIdx > 0) {
          const prevDetails = menu[activeIdx - 1].details;
          wheelLock.current = true;
          onChange?.(menu[activeIdx - 1].title, prevDetails.length - 1);
        }
      }
      setTimeout(() => { wheelLock.current = false; }, 700);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIdx, detailIdx, onChange]);
  return (
    <div
      className="slide-menu-horizontal"
    >
      {/* 대단원 타이틀 표시 영역 */}
      <div className="chapter-titles">
        {menu.map((item, idx) => (
          <div
            key={item.title}
            className={`chapter-title ${idx === activeIdx ? 'active' : ''}`}
            onClick={() => onChange?.(item.title, 0)}
          >
            {item.title}
          </div>
        ))}      </div>
      
      {/* 프로그레스 바 */}
      <div className="progress-container" ref={progressRef}>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
            {/* 프로그레스 포인트 */}
          {points.map((point, idx) => (
            <div 
              key={idx}
              className={`progress-point ${point.active ? 'active' : ''}`}
              style={{ left: `${point.position}%` }}
              data-title={point.title}
              onClick={() => {
                // 현재 메뉴에서의 인덱스 계산
                let currentMenuIndex = 0;
                let currentDetailIndex = 0;
                let pointCounter = 0;
                
                for (let i = 0; i < menu.length; i++) {
                  for (let j = 0; j < menu[i].details.length; j++) {
                    if (pointCounter === idx) {
                      currentMenuIndex = i;
                      currentDetailIndex = j;
                      break;
                    }
                    pointCounter++;
                  }
                  if (pointCounter > idx) break;
                }
                
                // onChange 이벤트 호출
                onChange?.(menu[currentMenuIndex].title, currentDetailIndex);
                
                // 섹션 참조가 제공된 경우 해당 섹션으로 스크롤
                if (sectionRefs?.current && idx < sectionRefs.current.length) {
                  sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <div className="point-label">{point.title}</div>
            </div>
          ))}
        </div>
      </div>
        {/* 소단원 네비게이션 */}      <div className="section-navigation">
        {menu[activeIdx].details.map((section, idx) => (
          <div 
            key={section}
            className={`section-item ${idx === detailIdx ? 'active' : ''}`}
            onClick={() => {
              // onChange 함수 호출
              onChange?.(menu[activeIdx].title, idx);
              
              // 섹션 참조가 제공된 경우 해당 섹션으로 스크롤
              if (sectionRefs?.current && sectionRefs.current[idx]) {
                sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
                
                // 활성화된 섹션 강조를 위한 클래스 토글
                const sections = document.querySelectorAll('.content-section');
                sections.forEach((section, i) => {
                  if (i === idx) {
                    section.classList.add('active-section');
                  } else {
                    section.classList.remove('active-section');
                  }
                });
              }
            }}
          >
            {section}
          </div>
        ))}
      </div>
      
      {/* 페이지 표시기 */}
      <div className="page-indicator">
        {currentPage} / {totalPages}
      </div>
    </div>
  );
}

export default SlideMenu;
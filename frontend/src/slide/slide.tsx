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
    details: ["얽힘", "특성", "벨 상태", "벨 부등식"] 
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
  scrollProgress?: number; // 스크롤 진행도
  sectionPositions?: number[]; // 섹션 위치 정보 추가
};

function SlideMenu({
  current = "큐비트",
  detailIdx = 0,
  onChange,
  sectionRefs,
  scrollProgress = 0,
  sectionPositions = []
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
  const [points, setPoints] = useState<{position: number, title: string, active: boolean, reached: boolean}[]>([]);
  // 프로그레스 바 포인트 계산 - 현재 활성화된 대단원의 소단원만 표시
  useEffect(() => {
    const newPoints = [];
    
    // 현재 선택된 대단원만 처리
    const currentChapter = menu[activeIdx];
    
    // 현재 대단원의 소단원만 포인트로 생성
    for (let j = 0; j < currentChapter.details.length; j++) {
      const isActive = j === detailIdx;
      // 현재 대단원의 소단원 수에 기반하여 포지션 계산
      const position = (j / (currentChapter.details.length - 1)) * 100;
      
      newPoints.push({
        position: position,
        title: currentChapter.details[j],
        active: isActive,
        reached: false // 초기에는 도달하지 않음
      });
    }
    
    setPoints(newPoints);
  }, [activeIdx, detailIdx]);

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
  // 스크롤 진행도와 섹션 위치가 변할 때 포인트들의 도달 상태 업데이트
  useEffect(() => {
    // 현재 스크롤 진행도에 따라 포인트의 도달 상태 업데이트
    setPoints(currentPoints => {
      // 이미 모든 상태가 올바르게 설정되어 있다면 변경하지 않음
      let needsUpdate = false;
      
      const newPoints = currentPoints.map((point, idx) => {
        // 섹션 위치 정보가 있으면 그것을 사용
        const actualPosition = sectionPositions[idx] !== undefined ? sectionPositions[idx] : point.position;
        const shouldBeReached = scrollProgress >= actualPosition;
        
        if (point.reached !== shouldBeReached || point.position !== actualPosition) {
          needsUpdate = true;
        }
        
        return {
          ...point,
          position: actualPosition,
          reached: shouldBeReached
        };
      });
      
      if (needsUpdate) {
        return newPoints;
      }
      return currentPoints;
    });
  }, [scrollProgress, sectionPositions]);

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
            style={{ width: `${scrollProgress !== undefined ? scrollProgress : progress}%` }}
          ></div>          {/* 프로그레스 포인트 */}
          {points.map((point, idx) => (
            <div 
              key={idx}
              className={`progress-point ${point.active ? 'active' : ''} ${point.reached ? 'reached' : ''}`}
              style={{ left: `${point.position}%` }}
              data-title={point.title}
              onClick={() => {
                // 현재 대단원의 소단원 인덱스 사용
                onChange?.(current, idx);
                
                // 섹션 참조가 제공된 경우 해당 섹션으로 스크롤
                if (sectionRefs?.current && idx < sectionRefs.current.length) {
                  sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <div className="point-label">{point.title}</div>
            </div>
          ))}        </div>
      </div>
      
      {/* 페이지 표시기 */}
      <div className="page-indicator">
        {currentPage} / {totalPages}
      </div>
    </div>
  );
}

export default SlideMenu;
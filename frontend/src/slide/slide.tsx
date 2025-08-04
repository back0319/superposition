import React, { useEffect, useRef, useState } from "react";
import "./slide.scss";
import "../component/slide-menu-transitions.scss";
import { useSlideMenu, MenuItemType } from "../context/SlideMenuContext";

// 기본 대단원 및 소단원 구조 정의
const defaultMenu = [
  {
    title: "양자 컴퓨터", 
    details: ["정의", "고전 컴퓨터와의 차이", "양자 컴퓨터의 역사", "양자 컴퓨터의 응용"]
  },
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

interface SlideMenuProps {
  currentChapter?: number;
  scrollProgress?: number;
  onNavigate?: (chapterIndex: number, sectionIndex: number) => void;
}

function SlideMenu({ 
  currentChapter = 0, 
  scrollProgress: externalScrollProgress = 0,
  onNavigate = () => {} 
}: SlideMenuProps) {
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // props가 변경될 때 state 업데이트
  useEffect(() => {
    setSelectedChapter(currentChapter);
  }, [currentChapter]);

  // 외부에서 전달받은 스크롤 진행률 업데이트
  useEffect(() => {
    setScrollProgress(externalScrollProgress);
    
    // 현재 챕터의 섹션 수
    const currentChapterSections = defaultMenu[selectedChapter]?.details.length || 1;
    
    // 각 섹션이 차지하는 비율 (100% / 섹션 수)
    const sectionProgress = 100 / currentChapterSections;
    
    // 현재 섹션 인덱스 계산 (스크롤 진행률 기반)
    const newSectionIndex = Math.min(
      Math.floor(externalScrollProgress / sectionProgress),
      currentChapterSections - 1
    );
    
    setCurrentSectionIndex(newSectionIndex);
    
    // 현재 섹션 내에서의 스크롤 진행률 계산
    const chapterSections = defaultMenu[selectedChapter]?.details.length || 1;
    const sectionSize = 100 / chapterSections;
    const currentSectionProgress = (externalScrollProgress % sectionSize) / sectionSize * 100;
    
    // 현재 섹션 내에서 95% 이상 스크롤했을 때 다음 버튼 표시
    const isScrollComplete = currentSectionProgress >= 95;
    setShowNextButton(isScrollComplete);
  }, [externalScrollProgress, selectedChapter]);

  // 현재 진행률 계산 - 섹션별 진행률 표시
  const getCurrentProgress = () => {
    const currentChapterSections = defaultMenu[selectedChapter]?.details.length || 1;
    const sectionProgress = 100 / currentChapterSections;
    
    // 현재 섹션까지의 완료된 진행률 + 현재 섹션 내 진행률
    const completedSectionsProgress = currentSectionIndex * sectionProgress;
    const currentSectionProgress = (scrollProgress % sectionProgress);
    
    return Math.min(completedSectionsProgress + currentSectionProgress, 100);
  };

  // 다음 소단원으로 이동
  const handleNextSection = () => {
    const currentChapterSections = defaultMenu[selectedChapter]?.details.length || 1;
    
    // 현재 챕터 내에서 다음 섹션이 있는지 확인
    if (currentSectionIndex < currentChapterSections - 1) {
      // 같은 챕터의 다음 섹션으로 이동
      handleNavigation(selectedChapter, currentSectionIndex + 1);
    } else if (selectedChapter < defaultMenu.length - 1) {
      // 다음 챕터의 첫 번째 섹션으로 이동
      handleNavigation(selectedChapter + 1, 0);
    }
    
    // 페이지 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 네비게이션 핸들러
  const handleNavigation = (chapterIndex: number, sectionIndex: number) => {
    setSelectedChapter(chapterIndex);
    onNavigate(chapterIndex, sectionIndex); // 실제 섹션 인덱스 전달
  };

  // 프로그레스 포인트 생성 (현재 챕터의 소단원들)
  const generateProgressPoints = (): React.ReactElement[] => {
    const points: React.ReactElement[] = [];
    const currentChapterSections = defaultMenu[selectedChapter]?.details || [];
    
    currentChapterSections.forEach((section, sectionIndex) => {
      // 포인트들을 정확한 비율로 배치
      // 4개 섹션: 0%, 25%, 50%, 75%
      // 3개 섹션: 0%, 33.33%, 66.67%
      let position;
      if (currentChapterSections.length === 4) {
        position = sectionIndex * 25; // 0%, 25%, 50%, 75%
      } else if (currentChapterSections.length === 3) {
        position = sectionIndex * (100 / 3); // 0%, 33.33%, 66.67%
      } else {
        // 기본값: 균등 분할
        position = (sectionIndex / Math.max(currentChapterSections.length - 1, 1)) * 100;
      }
      
      // 현재 섹션에 도달했는지 확인
      const isReached = sectionIndex <= currentSectionIndex;
      const isActive = sectionIndex === currentSectionIndex;
      
      points.push(
        <div
          key={`${selectedChapter}-${sectionIndex}`}
          className={`progress-point ${isReached ? 'reached' : ''} ${isActive ? 'active' : ''}`}
          style={{ top: `${position}%` }}
          onClick={() => handleNavigation(selectedChapter, sectionIndex)}
        >
          <div className="point-label">
            {section}
          </div>
        </div>
      );
    });
    
    return points;
  };

  return (
    <>
      <div className="slide-menu-horizontal">
        {/* 챕터 제목들 */}
        <div className="chapter-titles">
          {defaultMenu.map((chapter, index) => (
            <div
              key={index}
              className={`chapter-title ${index === selectedChapter ? 'active' : ''}`}
              onClick={() => handleNavigation(index, 0)}
            >
              {chapter.title}
            </div>
          ))}
        </div>

        {/* 프로그레스 바 */}
        <div className="progress-container">
          <div className="progress-bar" ref={progressBarRef}>
            <div 
              className="progress-fill"
              style={{ height: `${getCurrentProgress()}%` }}
            />
            {generateProgressPoints()}
          </div>
        </div>
      </div>

      {/* 다음 소단원 버튼 */}
      {showNextButton && (
        <button 
          className="next-section-button"
          onClick={handleNextSection}
        >
          다음 소단원
        </button>
      )}
    </>
  );
}

export default SlideMenu;
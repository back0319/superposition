import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import "./slide.scss";
import "../component/slide-menu-transitions.scss";
import { useSlideMenu, MenuItemType } from "../context/SlideMenuContext";
import { QUIZ_DATA, DEFAULT_QUIZ, QuizComponent, QuizComponentProps, getQuizData } from "./explain/quiz";

// 스크롤 완료 임계값 상수
const SCROLL_COMPLETE_THRESHOLD = 80;

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
  isHidden?: boolean;
  onQuizComplete?: () => void;
}

function SlideMenu({ 
  currentChapter = 0, 
  scrollProgress: externalScrollProgress = 0,
  onNavigate = () => {},
  isHidden = false,
  onQuizComplete = () => {}
}: SlideMenuProps) {
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 메모이제이션된 계산값들
  const currentChapterData = useMemo(() => {
    return defaultMenu[selectedChapter] || { title: '', details: [] };
  }, [selectedChapter]);

  const sectionProgress = useMemo(() => {
    return 100 / Math.max(currentChapterData.details.length, 1);
  }, [currentChapterData.details.length]);

  const currentSectionProgress = useMemo(() => {
    const sectionSize = 100 / Math.max(currentChapterData.details.length, 1);
    return (externalScrollProgress % sectionSize) / sectionSize * 100;
  }, [externalScrollProgress, currentChapterData.details.length]);

  const isScrollComplete = useMemo(() => {
    return currentSectionProgress >= SCROLL_COMPLETE_THRESHOLD;
  }, [currentSectionProgress]);

  // 퀴즈 데이터 메모이제이션
  const currentQuizData = useMemo(() => {
    return getQuizData(selectedChapter, currentSectionIndex);
  }, [selectedChapter, currentSectionIndex]);

  // props가 변경될 때 state 업데이트
  useEffect(() => {
    setSelectedChapter(currentChapter);
  }, [currentChapter]);

  // 외부에서 전달받은 스크롤 진행률 업데이트 (최적화됨)
  useEffect(() => {
    setScrollProgress(externalScrollProgress);
    
    // 현재 섹션 인덱스 계산 (스크롤 진행률 기반)
    const newSectionIndex = Math.min(
      Math.floor(externalScrollProgress / sectionProgress),
      currentChapterData.details.length - 1
    );
    
    setCurrentSectionIndex(newSectionIndex);
    
    // 퀴즈 표시 조건
    setShowQuiz(isScrollComplete || quizCompleted);
    
    // 퀴즈 완료 후에만 다음 버튼 표시
    setShowNextButton(quizCompleted);
  }, [externalScrollProgress, sectionProgress, currentChapterData.details.length, isScrollComplete, quizCompleted]);

  // 현재 진행률 계산 - 메모이제이션됨
  const getCurrentProgress = useCallback(() => {
    const completedSectionsProgress = currentSectionIndex * sectionProgress;
    const currentSectionProgressValue = (scrollProgress % sectionProgress);
    
    return Math.min(completedSectionsProgress + currentSectionProgressValue, 100);
  }, [currentSectionIndex, sectionProgress, scrollProgress]);

  // 프로그레스 포인트 생성 (메모이제이션됨)
  const progressPoints = useMemo(() => {
    const points: React.ReactElement[] = [];
    const sections = currentChapterData.details;
    
    sections.forEach((section, sectionIndex) => {
      // 포인트 위치 계산
      let position: number;
      const sectionsLength = sections.length;
      
      if (sectionsLength === 4) {
        position = sectionIndex * 25; // 0%, 25%, 50%, 75%
      } else if (sectionsLength === 3) {
        position = sectionIndex * (100 / 3); // 0%, 33.33%, 66.67%
      } else {
        // 기본값: 균등 분할
        position = (sectionIndex / Math.max(sectionsLength - 1, 1)) * 100;
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
  }, [currentChapterData.details, selectedChapter, currentSectionIndex]);

  // 네비게이션 핸들러 (최적화됨)
  const handleNavigation = useCallback((chapterIndex: number, sectionIndex: number) => {
    setSelectedChapter(chapterIndex);
    setQuizCompleted(false); // 새 섹션으로 이동 시 퀴즈 상태 초기화
    onNavigate(chapterIndex, sectionIndex); // 실제 섹션 인덱스 전달
  }, [onNavigate]);

  // 퀴즈 완료 핸들러 (최적화됨)
  const handleQuizComplete = useCallback(() => {
    setQuizCompleted(true);
    onQuizComplete();
  }, [onQuizComplete]);

  // 다음 소단원으로 이동 (최적화됨)
  const handleNextSection = useCallback(() => {
    const currentChapterSections = currentChapterData.details.length;
    
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
  }, [currentChapterData.details.length, currentSectionIndex, selectedChapter, handleNavigation]);

  return (
    <>
      <div className={`slide-menu-horizontal ${isHidden ? 'hidden' : ''}`}>
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
            {progressPoints}
          </div>
        </div>
      </div>

      {/* 퀴즈 컴포넌트 */}
      {showQuiz && (
        <QuizComponent 
          selectedChapter={selectedChapter}
          currentSectionIndex={currentSectionIndex}
          currentQuizData={currentQuizData}
          currentChapterData={currentChapterData}
          onQuizComplete={handleQuizComplete}
          onNextSection={handleNextSection}
        />
      )}
    </>
  );
}

export default SlideMenu;
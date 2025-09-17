import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlideMenu from '../../slide';
import Qubit from '../../object/qubit/qubit';
import Superposition from '../../object/superposition/superposition';
import EntanglementVisualization from '../../object/entanglement/entanglement';
import { QuizComponent, getQuizData } from '../quiz';

function Compute() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  const [contentSlideDown, setContentSlideDown] = useState(false);
  const [clickedStrongElement, setClickedStrongElement] = useState<HTMLElement | null>(null);
  const [showQubitVisualization, setShowQubitVisualization] = useState(false);
  const [showSuperpositionVisualization, setShowSuperpositionVisualization] = useState(false);
  const [showEntanglementVisualization, setShowEntanglementVisualization] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // strong 태그 클릭 핸들러 - strong 태그가 중앙 상단으로 이동하며 콘텐츠 사라짐
  const handleStrongClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    
    if (!contentSlideDown) {
      // 클릭된 strong 태그를 저장
      setClickedStrongElement(target);
      
      // 요소의 현재 위치 저장
      const rect = target.getBoundingClientRect();
      
      // 새로운 strong 태그 요소를 body에 직접 추가 (메인 컨테이너 밖에)
      const fixedStrong = document.createElement('div');
      fixedStrong.textContent = target.textContent;
      fixedStrong.id = 'fixed-strong-element';
      fixedStrong.style.position = 'fixed';
      fixedStrong.style.top = `${rect.top}px`;
      fixedStrong.style.left = `${rect.left}px`;
      fixedStrong.style.zIndex = '10001';
      fixedStrong.style.fontSize = '1em';
      fixedStrong.style.fontWeight = 'bold';
      fixedStrong.style.color = '#4f8cff';
      fixedStrong.style.pointerEvents = 'none';
      fixedStrong.style.background = 'transparent';
      fixedStrong.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
      fixedStrong.style.whiteSpace = 'nowrap';
      
      // body에 추가
      document.body.appendChild(fixedStrong);
      
      // 원본 strong 태그 숨기기
      target.style.opacity = '0';
      
      // 1단계: 네비게이션 바 숨기기와 동시에 strong 태그를 중앙 상단으로 이동
      setIsMenuHidden(true);
      
      // strong 태그를 중앙 상단으로 이동 (애니메이션과 함께)
      setTimeout(() => {
        fixedStrong.style.top = '5%';
        fixedStrong.style.left = '50%';
        fixedStrong.style.transform = 'translateX(-50%)';
        fixedStrong.style.fontSize = '2.5em';
        fixedStrong.style.color = '#ffffff';
        fixedStrong.style.textShadow = '0 0 30px rgba(79, 140, 255, 0.8), 0 0 60px rgba(79, 140, 255, 0.4)';
        
      }, 50);
      
      // 2단계: 콘텐츠 왼쪽으로 슬라이드
      setTimeout(() => {
        setContentSlideDown(true);
        
        // 큐비트 클릭인 경우 시각화 표시
        if (target.textContent?.includes('큐비트')) {
          setTimeout(() => {
            setShowQubitVisualization(true);
          }, 500);
        }

        if (target.textContent?.includes('중첩')) {
          setTimeout(() => {
            setShowSuperpositionVisualization(true);
          }, 500);
        }

        if (target.textContent?.includes('얽힘')) {
          setTimeout(() => {
            setShowEntanglementVisualization(true);
          }, 500);
        }
        
      }, 300);
    } else {
      // 리셋 기능
      
      // body에서 고정된 strong 태그 제거 (안전 검사 포함)
      const fixedElement = document.getElementById('fixed-strong-element');
      if (fixedElement && fixedElement.parentNode === document.body) {
        document.body.removeChild(fixedElement);
      }
      
      // 원본 strong 태그 복원
      if (clickedStrongElement) {
        clickedStrongElement.style.opacity = '';
      }
      
      setContentSlideDown(false);
      setIsMenuHidden(false);
      setClickedStrongElement(null);
      setShowQubitVisualization(false);
      setShowSuperpositionVisualization(false);
      setShowEntanglementVisualization(false);
      setShowQuiz(false);
      setQuizCompleted(false);
    }
  };

  // 스크롤 이벤트 핸들러 - 프로그레스 바 업데이트
  useEffect(() => {
    const handleScroll = () => {
      const scrollableElement = document.querySelector('.slide-content');
      
      if (scrollableElement) {
        const scrollTop = scrollableElement.scrollTop;
        const scrollHeight = scrollableElement.scrollHeight;
        const clientHeight = scrollableElement.clientHeight;
        
        // 스크롤 가능한 최대 높이
        const maxScrollTop = scrollHeight - clientHeight;
        
        if (maxScrollTop > 0) {
          // 스크롤 진행률 계산 (0-25%) - 첫 번째 소단원
          const progress = Math.min((scrollTop / maxScrollTop) * 25, 25);
          setScrollProgress(progress);
          
          // 현재 섹션은 항상 0으로 설정 (첫 번째 소단원)
          setCurrentSection(0);
          
          // 스크롤이 끝에 도달했을 때 퀴즈 표시 (95% 이상 스크롤)
          const scrollPercentage = (scrollTop / maxScrollTop) * 100;
          if (scrollPercentage >= 95 && !showQuiz && !contentSlideDown) {
            setShowQuiz(true);
          }
        }
        
      }
    };

    const scrollableElement = document.querySelector('.slide-content');
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
      
      // 초기 스크롤 위치 설정
      handleScroll();
      
      return () => {
        scrollableElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const handleNavigate = (chapter: number, section: number) => {
    // 각 챕터와 섹션에 따른 라우팅
    if (chapter === 0) {
      // 양자 컴퓨터 챕터
      if (section === 0) navigate('/compute');
      else if (section === 1) navigate('/compute/difference');
      else if (section === 2) navigate('/compute/history');
      else if (section === 3) navigate('/compute/applications');
    } else if (chapter === 1) {
      // 큐비트 챕터
      if (section === 0) navigate('/qubit');
      else if (section === 1) navigate('/qubit/state-vector');
      else if (section === 2) navigate('/qubit/bloch-sphere');
    } else if (chapter === 2) {
      // 중첩 챕터
      if (section === 0) navigate('/superposition');
      else if (section === 1) navigate('/superposition/hadamard');
      else if (section === 2) navigate('/superposition/applications');
    } else if (chapter === 3) {
      // 얽힘 챕터
      if (section === 0) navigate('/entangle');
      else if (section === 1) navigate('/entangle/properties');
      else if (section === 2) navigate('/entangle/bell-states');
      else if (section === 3) navigate('/entangle/bell-inequality');
    }
  };

  // 퀴즈 완료 핸들러
  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  // 다음 섹션으로 이동 핸들러
  const handleNextSection = () => {
    navigate('/compute/difference'); // 다음 소단원으로 이동
  };

  return (
    <div className="slide-container">
      <SlideMenu 
        currentChapter={0} 
        scrollProgress={scrollProgress}
        onNavigate={handleNavigate}
        isHidden={isMenuHidden}
      />
      
      {/* 리셋 버튼 (콘텐츠 슬라이드 중일 때만 표시) */}
      {contentSlideDown && (
        <div className="reset-button" onClick={() => {
          // body에서 고정된 strong 태그 제거 (안전 검사 포함)
          const fixedElement = document.getElementById('fixed-strong-element');
          if (fixedElement && fixedElement.parentNode === document.body) {
            document.body.removeChild(fixedElement);
          }
          
          // 원본 strong 태그 복원
          if (clickedStrongElement) {
            clickedStrongElement.style.opacity = '';
          }
          
          setContentSlideDown(false);
          setIsMenuHidden(false);
          setClickedStrongElement(null);
          setShowQubitVisualization(false);
          setShowSuperpositionVisualization(false);
          setShowEntanglementVisualization(false);
          setShowQuiz(false);
          setQuizCompleted(false);
        }}>
          ✕
        </div>
      )}
      
      <div className={`slide-content ${isMenuHidden ? 'expansion-mode' : ''} ${contentSlideDown ? 'slide-down' : ''}`}>
        <div className="compute-container">
          <h1>양자 컴퓨터 - 정의</h1>

          {/* 첫 번째 섹션 */}
          <div className="content-section">
            <h2>양자 컴퓨터란 무엇인가?</h2>
            <div className="section-content">
              <p>
                양자 컴퓨터(Quantum Computer)는 양자역학의 원리를 이용하여 정보를 처리하는 혁신적인 컴퓨팅 시스템입니다. 
                기존의 고전 컴퓨터가 0과 1의 비트(bit)를 사용하여 정보를 처리하는 반면, 양자 컴퓨터는 
                <strong onClick={handleStrongClick}>큐비트(qubit)</strong>라는 양자 정보의 기본 단위를 사용합니다.
              </p>
              <p>
                큐비트의 가장 놀라운 특성은 <strong onClick={handleStrongClick}>중첩(superposition)</strong>과 <strong onClick={handleStrongClick}>얽힘(entanglement)</strong>입니다. 
                중첩 상태에 있는 큐비트는 0과 1을 동시에 나타낼 수 있으며, 이는 고전 컴퓨터의 비트가 특정 시점에 
                0 또는 1 중 하나의 확정된 값만을 가질 수 있는 것과는 완전히 다른 개념입니다.
              </p>
            </div>
          </div>

          {/* 두 번째 섹션 */}
          <div className="content-section">
            <h2>양자역학의 기본 원리</h2>
            <div className="section-content">
              <p>
                양자 컴퓨터의 이해를 위해서는 먼저 양자역학의 몇 가지 핵심 원리를 알아야 합니다. 
                20세기 초 막스 플랑크, 닐스 보어, 베르너 하이젠베르크 등의 물리학자들이 발견한 이러한 원리들은 
                우리의 직관과는 상당히 다른 미시세계의 법칙들입니다.
              </p>
              <p>
                <strong onClick={handleStrongClick}>1. 중첩 원리:</strong> 양자 입자는 여러 상태를 동시에 존재할 수 있습니다. 
                예를 들어, 전자의 스핀은 "위" 또는 "아래" 방향을 가질 수 있지만, 측정되기 전까지는 
                두 상태의 확률적 조합으로 존재합니다. 이는 슈뢰딩거의 고양이 사고실험으로 유명해진 개념입니다.
              </p>
              <p>
                <strong onClick={handleStrongClick}>2. 얽힘:</strong> 두 개 이상의 양자 입자가 서로 연결되어, 한 입자의 상태를 측정하면 
                즉시 다른 입자의 상태가 결정되는 현상입니다. 아인슈타인이 "유령 같은 원격 작용"이라고 
                표현했던 이 현상은 입자들 사이의 거리에 관계없이 발생합니다.
              </p>
              <p>
                <strong onClick={handleStrongClick}>3. 측정의 영향:</strong> 양자 상태를 측정하는 행위 자체가 그 상태를 변화시킵니다. 
                측정 전까지는 확률적 중첩 상태에 있던 입자가 측정 순간 하나의 확정된 상태로 "붕괴"됩니다.
              </p>
            </div>
          </div>

          {/* 세 번째 섹션 */}
          <div className="content-section">
            <h2>양자 컴퓨터의 작동 원리</h2>
            <div className="section-content">
              <p>
                양자 컴퓨터는 이러한 양자역학적 현상들을 정보 처리에 활용합니다. 
                고전 컴퓨터가 수많은 트랜지스터를 통해 논리 연산을 수행하는 것과 달리, 
                양자 컴퓨터는 <strong onClick={handleStrongClick}>양자 게이트(quantum gate)</strong>를 통해 큐비트의 상태를 조작합니다.
              </p>
              <p>
                예를 들어, n개의 고전 비트로는 2^n개의 가능한 상태 중 하나만을 표현할 수 있습니다. 
                하지만 n개의 큐비트는 중첩 상태를 통해 2^n개의 모든 상태를 동시에 표현할 수 있습니다. 
                이는 양자 컴퓨터가 특정 문제에 대해 기하급수적인 병렬 처리 능력을 가질 수 있음을 의미합니다.
              </p>
              <p>
                양자 컴퓨터의 연산 과정은 다음과 같습니다:
              </p>
              <ul>
                <li><strong onClick={handleStrongClick}>초기화:</strong> 큐비트들을 특정 초기 상태로 설정합니다.</li>
                <li><strong onClick={handleStrongClick}>양자 게이트 적용:</strong> 하다마드 게이트, CNOT 게이트 등을 통해 큐비트 상태를 조작합니다.</li>
                <li><strong onClick={handleStrongClick}>얽힘 생성:</strong> 여러 큐비트 사이에 양자 얽힘을 만들어 복잡한 양자 상태를 구성합니다.</li>
                <li><strong onClick={handleStrongClick}>측정:</strong> 최종적으로 큐비트의 상태를 측정하여 고전적인 정보로 변환합니다.</li>
              </ul>
            </div>
          </div>
          
          <div className="compute-demo">
            <h3>양자 컴퓨터의 핵심 개념</h3>
            <p>
              양자 컴퓨터를 이해하기 위한 핵심은 고전적 직관을 버리고 양자역학적 사고방식을 받아들이는 것입니다. 
              우리가 일상에서 경험하는 물리 법칙과는 완전히 다른 미시세계의 규칙들이 
              정보 처리라는 새로운 패러다임을 만들어내고 있습니다.
            </p>
          </div>
        </div>
      </div>
      
      {/* 큐비트 시각화 컴포넌트 */}
      <Qubit isVisible={showQubitVisualization} />
      <Superposition isVisible={showSuperpositionVisualization} />
      <EntanglementVisualization 
        isVisible={showEntanglementVisualization} 
        onClose={() => setShowEntanglementVisualization(false)}
      />
      
      {/* 퀴즈 컴포넌트 */}
      {showQuiz && (
        <QuizComponent
          selectedChapter={0}
          currentSectionIndex={0}
          currentQuizData={getQuizData(0, 0)}
          currentChapterData={{
            title: "양자 컴퓨터 - 정의",
            details: ["큐비트의 개념", "중첩과 얽힘", "양자역학의 기본 원리"]
          }}
          onQuizComplete={handleQuizComplete}
          onNextSection={handleNextSection}
        />
      )}
    </div>
  );
}

export default Compute;
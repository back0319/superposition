import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlideMenu from '../../slide';

function Qubit() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  const [contentSlideDown, setContentSlideDown] = useState(false);
  const [clickedStrongElement, setClickedStrongElement] = useState<HTMLElement | null>(null);

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
      
      // 네비게이션 바 숨기기와 동시에 strong 태그를 중앙 상단으로 이동
      setIsMenuHidden(true);
      
      // strong 태그를 중앙 상단으로 이동 (애니메이션과 함께)
      setTimeout(() => {
        fixedStrong.style.top = '15%';
        fixedStrong.style.left = '50%';
        fixedStrong.style.transform = 'translateX(-50%)';
        fixedStrong.style.fontSize = '2.5em';
        fixedStrong.style.color = '#ffffff';
        fixedStrong.style.textShadow = '0 0 30px rgba(79, 140, 255, 0.8), 0 0 60px rgba(79, 140, 255, 0.4)';
      }, 50);
      
      // 콘텐츠 왼쪽으로 슬라이드
      setTimeout(() => {
        setContentSlideDown(true);
      }, 300);
    } else {
      // 리셋 기능
      // body에서 고정된 strong 태그 제거
      const fixedElement = document.getElementById('fixed-strong-element');
      if (fixedElement) {
        document.body.removeChild(fixedElement);
      }
      
      // 원본 strong 태그 복원
      if (clickedStrongElement) {
        clickedStrongElement.style.opacity = '';
      }
      
      setContentSlideDown(false);
      setIsMenuHidden(false);
      setClickedStrongElement(null);
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
          // 스크롤 진행률 계산 (0-100%)
          const progress = Math.min((scrollTop / maxScrollTop) * 100, 100);
          setScrollProgress(progress);
          
          // 섹션별 진행률 계산 (4개 섹션)
          const sectionProgress = 100 / 4; // 4개 섹션
          const newCurrentSection = Math.min(Math.floor(progress / sectionProgress), 3);
          setCurrentSection(newCurrentSection);
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

  return (
    <div className="slide-container">
      <SlideMenu 
        currentChapter={1} 
        scrollProgress={scrollProgress}
        onNavigate={handleNavigate}
        isHidden={isMenuHidden}
      />
      
      {/* 리셋 버튼 (콘텐츠 슬라이드 중일 때만 표시) */}
      {contentSlideDown && (
        <div className="reset-button" onClick={() => {
          // body에서 고정된 strong 태그 제거
          const fixedElement = document.getElementById('fixed-strong-element');
          if (fixedElement) {
            document.body.removeChild(fixedElement);
          }
          
          // 원본 strong 태그 복원
          if (clickedStrongElement) {
            clickedStrongElement.style.opacity = '';
          }
          
          setContentSlideDown(false);
          setIsMenuHidden(false);
          setClickedStrongElement(null);
        }}>
          ✕
        </div>
      )}
      
      <div className={`slide-content ${isMenuHidden ? 'expansion-mode' : ''} ${contentSlideDown ? 'slide-down' : ''}`}>
        <div className="qubit-container">
          <h1>큐비트 (Qubit) - 정의</h1>
          
          <div className="content-section">
            <h2>큐비트란 무엇인가?</h2>
            <div className="section-content">
              <p>
                큐비트(Qubit)는 "Quantum Bit"의 줄임말로, 양자 정보의 기본 단위입니다. 
                고전 컴퓨터의 비트가 0 또는 1의 확정된 값을 가지는 반면, 
                큐비트는 <strong>중첩(superposition)</strong> 상태를 통해 0과 1을 동시에 나타낼 수 있습니다.
              </p>
              <p>
                이러한 특성은 양자 컴퓨터가 기존 컴퓨터보다 훨씬 강력한 병렬 처리 능력을 가질 수 있게 해주는 
                핵심적인 요소입니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>큐비트의 수학적 표현</h2>
            <div className="section-content">
              <p>
                큐비트의 상태는 복소수 계수를 가진 선형 결합으로 표현됩니다. 
                일반적인 큐비트 상태 |ψ⟩는 다음과 같이 쓸 수 있습니다:
              </p>
              <p>
                |ψ⟩ = α|0⟩ + β|1⟩
              </p>
              <p>
                여기서 α와 β는 복소수 확률 진폭(probability amplitude)이며, 
                |α|² + |β|² = 1이라는 정규화 조건을 만족해야 합니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>블로흐 구면 (Bloch Sphere)</h2>
            <div className="section-content">
              <p>
                큐비트의 상태는 블로흐 구면이라는 3차원 구면 위의 점으로 시각화할 수 있습니다. 
                이 구면의 북극은 |0⟩ 상태를, 남극은 |1⟩ 상태를 나타냅니다.
              </p>
              <p>
                적도 위의 점들은 |0⟩와 |1⟩의 동등한 중첩 상태들을 나타내며, 
                구면 위의 모든 점은 가능한 큐비트 상태에 대응됩니다.
              </p>
            </div>
          </div>
          
          <div className="qubit-demo">
            <h3>큐비트의 핵심 개념</h3>
            <p>
              큐비트는 양자 컴퓨터의 기본 구성 요소로, 고전적인 비트와는 완전히 다른 특성을 가집니다. 
              중첩, 위상, 측정 등의 양자역학적 개념들이 큐비트를 통해 정보 처리에 활용됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Qubit;
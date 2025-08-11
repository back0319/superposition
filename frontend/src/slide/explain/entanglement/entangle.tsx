import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlideMenu from '../../slide';

function Entanglement() {
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

  // 스크롤 이벤트 핸들러 (메인 콘텐츠 영역에서만 동작)
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
          const sectionProgress = 100 / 3; // 3개 섹션
          const newCurrentSection = Math.min(Math.floor(progress / sectionProgress), 2);
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
        currentChapter={3} 
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
        <div className="entanglement-container">
          <h1>얽힘 (Entanglement) - 얽힘</h1>
          
          <div className="content-section">
            <h2>양자 얽힘이란?</h2>
            <div className="section-content">
              <p>
                양자 얽힘(Quantum Entanglement)은 두 개 이상의 입자가 서로 연결되어, 
                한 입자의 상태를 측정하면 즉시 다른 입자의 상태가 결정되는 놀라운 현상입니다.
              </p>
              <p>
                아인슈타인이 "유령 같은 원격 작용(spooky action at a distance)"이라고 표현했던 이 현상은 
                입자들 사이의 거리에 관계없이 발생하며, 양자역학의 가장 신비로운 특성 중 하나입니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>얽힘의 특성</h2>
            <div className="section-content">
              <p>
                얽힌 입자들은 개별적으로 기술할 수 없으며, 전체 시스템으로만 설명할 수 있습니다. 
                이를 <strong>비분리성(non-separability)</strong>이라고 합니다.
              </p>
              <p>
                예를 들어, 두 큐비트가 얽힌 상태에 있을 때, 한 큐비트를 측정하여 |0⟩을 얻으면 
                다른 큐비트는 즉시 |1⟩ 상태로 결정됩니다. 이는 두 입자 사이에 어떤 신호가 
                전달되는 것이 아니라, 양자역학의 근본적인 특성입니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>벨 상태 (Bell States)</h2>
            <div className="section-content">
              <p>
                벨 상태는 두 큐비트의 최대 얽힘 상태를 나타내는 네 가지 상태입니다:
              </p>
              <ul>
                <li>|Φ⁺⟩ = (|00⟩ + |11⟩)/√2</li>
                <li>|Φ⁻⟩ = (|00⟩ - |11⟩)/√2</li>
                <li>|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2</li>
                <li>|Ψ⁻⟩ = (|01⟩ - |10⟩)/√2</li>
              </ul>
              <p>
                이러한 상태들은 양자 암호, 양자 텔레포테이션, 양자 컴퓨팅 알고리즘에서 
                핵심적인 역할을 합니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>벨 부등식과 양자역학</h2>
            <div className="section-content">
              <p>
                벨 부등식(Bell's Inequality)은 국소적 숨은 변수 이론과 양자역학을 구분하는 중요한 도구입니다. 
                실험 결과는 벨 부등식을 위반하여 양자역학의 예측이 옳음을 증명했습니다.
              </p>
              <p>
                이는 우리 우주가 근본적으로 비국소적이며, 얽힌 입자들 사이에는 
                고전적인 의미에서의 "숨은 변수"가 존재하지 않음을 의미합니다.
              </p>
            </div>
          </div>
          
          <div className="entanglement-demo">
            <h3>양자 얽힘의 응용</h3>
            <p>
              양자 얽힘은 양자 컴퓨터, 양자 암호, 양자 통신의 핵심 자원입니다. 
              이를 통해 고전적으로는 불가능한 정보 처리와 통신이 가능해집니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Entanglement;
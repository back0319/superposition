import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlideMenu from '../../slide';

function Superposition() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

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
        currentChapter={2} 
        scrollProgress={scrollProgress}
        onNavigate={handleNavigate}
      />
      
      <div className="slide-content">
        <div className="superposition-container">
          <h1>중첩 (Superposition) - 중첩 원리</h1>
          
          <div className="content-section">
            <h2>양자 중첩이란?</h2>
            <div className="section-content">
              <p>
                양자 중첩(Quantum Superposition)은 양자역학의 가장 신비로운 현상 중 하나입니다. 
                큐비트가 |0⟩와 |1⟩ 상태를 동시에 존재할 수 있다는 것을 의미합니다.
              </p>
              <p>
                이는 고전적인 직관과는 완전히 다른 개념으로, 동전이 앞면과 뒷면을 동시에 보이는 것과 같습니다. 
                하지만 측정하는 순간, 큐비트는 하나의 확정된 상태로 "붕괴"됩니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>하다마드 게이트</h2>
            <div className="section-content">
              <p>
                하다마드 게이트(Hadamard Gate)는 큐비트를 중첩 상태로 만드는 가장 기본적인 양자 게이트입니다. 
                |0⟩ 상태에 하다마드 게이트를 적용하면 (|0⟩ + |1⟩)/√2 상태가 됩니다.
              </p>
              <p>
                이 상태에서 측정하면 50% 확률로 |0⟩을, 50% 확률로 |1⟩을 얻게 됩니다. 
                하다마드 게이트는 H로 표기되며, 양자 알고리즘에서 핵심적인 역할을 합니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>중첩의 응용</h2>
            <div className="section-content">
              <p>
                양자 중첩은 양자 컴퓨터의 강력함의 원천입니다. n개의 큐비트가 중첩 상태에 있으면, 
                2^n개의 모든 가능한 상태를 동시에 탐색할 수 있습니다.
              </p>
              <p>
                이는 검색 알고리즘, 최적화 문제, 암호 해독 등 다양한 분야에서 
                고전 컴퓨터보다 지수적으로 빠른 성능을 가능하게 합니다.
              </p>
            </div>
          </div>
          
          <div className="superposition-demo">
            <h3>양자 중첩의 핵심</h3>
            <p>
              양자 중첩은 양자 컴퓨터가 고전 컴퓨터보다 강력한 이유입니다. 
              확률적 특성과 간섭 현상을 통해 올바른 답을 높은 확률로 얻을 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Superposition;
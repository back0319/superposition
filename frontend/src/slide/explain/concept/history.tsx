import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlideMenu from '../../slide';

function History() {
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
          // 스크롤 진행률 계산 (50-75%) - 세 번째 소단원
          const baseProgress = 50; // 앞의 2개 소단원 완료 (0%, 25%)
          const progress = Math.min(baseProgress + (scrollTop / maxScrollTop) * 25, 75);
          setScrollProgress(progress);
          
          // 현재 섹션은 항상 2로 설정 (세 번째 소단원)
          setCurrentSection(2);
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
        currentChapter={0} 
        scrollProgress={scrollProgress}
        onNavigate={handleNavigate}
      />
      
      <div className="slide-content">
        <div className="compute-container">
          <h1>양자 컴퓨터 - 고전 컴퓨터와의 차이</h1>
          
          <div className="content-section">
            <h2>고전 컴퓨터의 정보 처리 방식</h2>
            <div className="section-content">
              <p>
                고전 컴퓨터는 <strong>비트(bit)</strong>를 기본 정보 단위로 사용합니다. 
                각 비트는 0 또는 1의 확정된 값을 가지며, 이는 트랜지스터의 ON/OFF 상태로 구현됩니다. 
                모든 연산은 이러한 이진 논리를 기반으로 순차적으로 처리됩니다.
              </p>
              <p>
                고전 컴퓨터의 처리 방식은 결정론적입니다. 같은 입력에 대해서는 항상 같은 출력을 생성하며, 
                복잡한 문제를 해결하기 위해서는 더 많은 시간과 자원이 필요합니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>양자 컴퓨터의 혁신적 접근</h2>
            <div className="section-content">
              <p>
                양자 컴퓨터는 <strong>큐비트(qubit)</strong>를 사용하여 정보를 처리합니다. 
                큐비트는 양자역학의 중첩 원리에 따라 0과 1 상태를 동시에 존재할 수 있어, 
                고전 비트보다 훨씬 더 많은 정보를 저장하고 처리할 수 있습니다.
              </p>
              <p>
                <strong>핵심 차이점:</strong>
              </p>
              <ul>
                <li><strong>중첩(Superposition):</strong> 여러 상태를 동시에 탐색 가능</li>
                <li><strong>얽힘(Entanglement):</strong> 큐비트 간의 강력한 상관관계</li>
                <li><strong>간섭(Interference):</strong> 확률 진폭의 상쇄와 증폭을 통한 최적화</li>
              </ul>
            </div>
          </div>

          <div className="content-section">
            <h2>계산 능력의 차이</h2>
            <div className="section-content">
              <p>
                가장 극적인 차이는 계산 능력에서 나타납니다. n개의 고전 비트는 한 번에 하나의 상태만 
                나타낼 수 있지만, n개의 큐비트는 2^n개의 모든 상태를 동시에 나타낼 수 있습니다.
              </p>
              <p>
                예를 들어, 300개의 큐비트는 우주의 모든 원자 수보다 많은 상태를 동시에 처리할 수 있습니다. 
                이는 특정 문제(암호 해독, 최적화, 시뮬레이션 등)에서 
                <strong>지수적인 속도 향상</strong>을 가능하게 합니다.
              </p>
              <p>
                하지만 모든 문제에서 양자 컴퓨터가 우월한 것은 아닙니다. 
                양자 컴퓨터는 특정 유형의 문제에서만 양자 우위(Quantum Advantage)를 보입니다.
              </p>
            </div>
          </div>
          
          <div className="compute-demo">
            <h3>고전 vs 양자: 핵심 비교</h3>
            <p>
              고전 컴퓨터는 확실성과 안정성을 제공하지만, 양자 컴퓨터는 확률적이면서도 
              특정 문제에서 압도적인 성능을 보입니다. 두 기술은 상호 보완적이며, 
              미래의 컴퓨팅은 이 둘의 협력으로 이루어질 것입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default History;
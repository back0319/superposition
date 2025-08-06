import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlideMenu from '../../slide';

function Compute() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  // strong 태그 클릭 핸들러 - 네비게이션 메뉴 토글 및 섹션 확장
  const handleStrongClick = (event: React.MouseEvent, sectionIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 메뉴 숨기기
    setIsMenuHidden(true);
    
    // 해당 섹션 확장
    setExpandedSection(sectionIndex);
  };

  // ESC 키로 확장 상태 해제
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && expandedSection !== null) {
        setExpandedSection(null);
        setIsMenuHidden(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [expandedSection]);

  // 스크롤 이벤트 핸들러 - 프로그레스 바 업데이트
  useEffect(() => {
    const handleScroll = () => {
      // 확장 상태일 때는 스크롤 이벤트 무시
      if (expandedSection !== null) {
        return;
      }
      
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
  }, [expandedSection]); // expandedSection 상태를 의존성에 추가

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
        isHidden={isMenuHidden}
      />
      
      <div className={`slide-content ${isMenuHidden ? 'fullscreen' : ''}`}>
        <div className={`compute-container ${expandedSection !== null ? 'section-expanded' : ''}`}>
          <h1>양자 컴퓨터 - 정의</h1>
          
          <div className={`content-section ${expandedSection === 0 ? 'expanded' : (expandedSection !== null ? 'hidden' : '')}`}>
            <h2>양자 컴퓨터란 무엇인가?</h2>
            <div className="section-content">
              {expandedSection === 0 && (
                <button className="close-btn" onClick={() => {setExpandedSection(null); setIsMenuHidden(false);}}>×</button>
              )}
              <p>
                양자 컴퓨터(Quantum Computer)는 양자역학의 원리를 이용하여 정보를 처리하는 혁신적인 컴퓨팅 시스템입니다. 
                기존의 고전 컴퓨터가 0과 1의 비트(bit)를 사용하여 정보를 처리하는 반면, 양자 컴퓨터는 
                <strong onClick={(e) => handleStrongClick(e, 0)}>큐비트(qubit)</strong>라는 양자 정보의 기본 단위를 사용합니다.
              </p>
              <p>
                큐비트의 가장 놀라운 특성은 <strong onClick={(e) => handleStrongClick(e, 0)}>중첩(superposition)</strong>과 <strong onClick={(e) => handleStrongClick(e, 0)}>얽힘(entanglement)</strong>입니다. 
                중첩 상태에 있는 큐비트는 0과 1을 동시에 나타낼 수 있으며, 이는 고전 컴퓨터의 비트가 특정 시점에 
                0 또는 1 중 하나의 확정된 값만을 가질 수 있는 것과는 완전히 다른 개념입니다.
              </p>
            </div>
          </div>

          <div className={`content-section ${expandedSection === 1 ? 'expanded' : (expandedSection !== null ? 'hidden' : '')}`}>
            <h2>양자역학의 기본 원리</h2>
            <div className="section-content">
              {expandedSection === 1 && (
                <button className="close-btn" onClick={() => {setExpandedSection(null); setIsMenuHidden(false);}}>×</button>
              )}
              <p>
                양자 컴퓨터의 이해를 위해서는 먼저 양자역학의 몇 가지 핵심 원리를 알아야 합니다. 
                20세기 초 막스 플랑크, 닐스 보어, 베르너 하이젠베르크 등의 물리학자들이 발견한 이러한 원리들은 
                우리의 직관과는 상당히 다른 미시세계의 법칙들입니다.
              </p>
              <p>
                <strong onClick={(e) => handleStrongClick(e, 1)}>1. 중첩 원리:</strong> 양자 입자는 여러 상태를 동시에 존재할 수 있습니다. 
                예를 들어, 전자의 스핀은 "위" 또는 "아래" 방향을 가질 수 있지만, 측정되기 전까지는 
                두 상태의 확률적 조합으로 존재합니다. 이는 슈뢰딩거의 고양이 사고실험으로 유명해진 개념입니다.
              </p>
              <p>
                <strong onClick={(e) => handleStrongClick(e, 1)}>2. 얽힘:</strong> 두 개 이상의 양자 입자가 서로 연결되어, 한 입자의 상태를 측정하면 
                즉시 다른 입자의 상태가 결정되는 현상입니다. 아인슈타인이 "유령 같은 원격 작용"이라고 
                표현했던 이 현상은 입자들 사이의 거리에 관계없이 발생합니다.
              </p>
              <p>
                <strong onClick={(e) => handleStrongClick(e, 1)}>3. 측정의 영향:</strong> 양자 상태를 측정하는 행위 자체가 그 상태를 변화시킵니다. 
                측정 전까지는 확률적 중첩 상태에 있던 입자가 측정 순간 하나의 확정된 상태로 "붕괴"됩니다.
              </p>
            </div>
          </div>

          <div className={`content-section ${expandedSection === 2 ? 'expanded' : (expandedSection !== null ? 'hidden' : '')}`}>
            <h2>양자 컴퓨터의 작동 원리</h2>
            <div className="section-content">
              {expandedSection === 2 && (
                <button className="close-btn" onClick={() => {setExpandedSection(null); setIsMenuHidden(false);}}>×</button>
              )}
              <p>
                양자 컴퓨터는 이러한 양자역학적 현상들을 정보 처리에 활용합니다. 
                고전 컴퓨터가 수많은 트랜지스터를 통해 논리 연산을 수행하는 것과 달리, 
                양자 컴퓨터는 <strong onClick={(e) => handleStrongClick(e, 2)}>양자 게이트(quantum gate)</strong>를 통해 큐비트의 상태를 조작합니다.
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
                <li><strong onClick={(e) => handleStrongClick(e, 2)}>초기화:</strong> 큐비트들을 특정 초기 상태로 설정합니다.</li>
                <li><strong onClick={(e) => handleStrongClick(e, 2)}>양자 게이트 적용:</strong> 하다마드 게이트, CNOT 게이트 등을 통해 큐비트 상태를 조작합니다.</li>
                <li><strong onClick={(e) => handleStrongClick(e, 2)}>얽힘 생성:</strong> 여러 큐비트 사이에 양자 얽힘을 만들어 복잡한 양자 상태를 구성합니다.</li>
                <li><strong onClick={(e) => handleStrongClick(e, 2)}>측정:</strong> 최종적으로 큐비트의 상태를 측정하여 고전적인 정보로 변환합니다.</li>
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
    </div>
  );
}

export default Compute;
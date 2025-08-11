import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlideMenu from '../../slide';

function Applications() {
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
          // 스크롤 진행률 계산 (75-100%) - 네 번째 소단원
          const baseProgress = 75; // 앞의 3개 소단원 완료 (0%, 25%, 50%)
          const progress = Math.min(baseProgress + (scrollTop / maxScrollTop) * 25, 100);
          setScrollProgress(progress);
          
          // 현재 섹션은 항상 3으로 설정 (네 번째 소단원)
          setCurrentSection(3);
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
        <div className="compute-container">
          <h1>양자 컴퓨터 - 양자 컴퓨터의 응용</h1>
          
          <div className="content-section">
            <h2>암호학 및 보안</h2>
            <div className="section-content">
              <p>
                양자 컴퓨터의 가장 주목받는 응용 분야는 <strong onClick={handleStrongClick}>암호학</strong>입니다. 
                쇼어(Shor) 알고리즘을 사용하면 현재 널리 사용되는 RSA 암호화를 효율적으로 해독할 수 있어, 
                기존 보안 체계에 혁명적인 변화를 가져올 것으로 예상됩니다.
              </p>
              <p>
                반대로 <strong onClick={handleStrongClick}>양자 암호</strong>는 양자역학의 원리를 이용하여 
                이론적으로 완벽한 보안을 제공합니다. <strong onClick={handleStrongClick}>양자 키 분배(QKD)</strong>는 도청을 물리적으로 
                탐지할 수 있어 절대적으로 안전한 통신을 가능하게 합니다.
              </p>
            </div>
          </div>

          <div className="content-section">
            <h2>최적화 문제</h2>
            <div className="section-content">
              <p>
                양자 컴퓨터는 복잡한 <strong onClick={handleStrongClick}>최적화 문제</strong>를 해결하는 데 탁월한 성능을 보입니다. 
                교통 최적화, 포트폴리오 관리, 공급망 최적화 등 다양한 분야에서 
                기존 컴퓨터로는 해결하기 어려운 문제들을 효율적으로 처리할 수 있습니다.
              </p>
              <p>
                <strong>주요 응용 분야:</strong>
              </p>
              <ul>
                <li><strong onClick={handleStrongClick}>금융:</strong> 리스크 분석, 포트폴리오 최적화, 파생상품 가격 결정</li>
                <li><strong onClick={handleStrongClick}>물류:</strong> 배송 경로 최적화, 재고 관리, 스케줄링</li>
                <li><strong onClick={handleStrongClick}>에너지:</strong> 전력망 최적화, 자원 배분, 신재생 에너지 관리</li>
              </ul>
            </div>
          </div>

          <div className="content-section">
            <h2>분자 시뮬레이션 및 신약 개발</h2>
            <div className="section-content">
              <p>
                양자 컴퓨터는 <strong onClick={handleStrongClick}>분자와 원자 수준의 시뮬레이션</strong>에서 특히 강력합니다. 
                분자의 양자역학적 특성을 직접 모델링할 수 있어, <strong onClick={handleStrongClick}>신약 개발</strong>, 촉매 설계, 
                새로운 소재 개발 등에 혁신을 가져올 것으로 기대됩니다.
              </p>
              <p>
                특히 <strong onClick={handleStrongClick}>신약 개발</strong> 분야에서는 단백질 접힘, 약물-표적 상호작용, 
                부작용 예측 등을 정확하게 시뮬레이션하여 개발 시간과 비용을 크게 줄일 수 있습니다. 
                이는 개인 맞춤형 의료와 정밀 의학의 발전을 가속화할 것입니다.
              </p>
            </div>
          </div>
          
          <div className="compute-demo">
            <h3>양자 컴퓨터의 미래</h3>
            <p>
              양자 컴퓨터는 현재 초기 단계이지만, 암호학, 최적화, 분자 시뮬레이션 등의 분야에서 
              이미 실용적인 가능성을 보여주고 있습니다. 향후 10-20년 내에 
              특정 분야에서는 혁명적인 변화를 가져올 것으로 예상됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Applications;
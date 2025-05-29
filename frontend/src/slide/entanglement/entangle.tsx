import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SlideMenu from "../slide";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const menu = [  
  { title: "얽힘", details: ["얽힘이란", "벨 상태", "얽힘 측정"] },
  { title: "중첩", details: ["중첩 원리", "하드라마드 게이트"] },
  { title: "큐비트", details: ["정의", "상태벡터", "블로흐 구"] }
];

// 섹션별 그래픽 데이터 정의
const sectionGraphics = [
  {
    id: "intro",
    title: "양자 얽힘 소개",
    image: "/images/entanglement-intro.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Quantum_entanglement.svg",
    formula: "\\ket{\\Phi^+} = \\frac{1}{\\sqrt{2}}(\\ket{00} + \\ket{11})"
  },
  {
    id: "bell-states",
    title: "벨 상태",
    image: "/images/bell-states.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Bloch_sphere_bell.svg",
    formula: "\\ket{\\Phi^{\\pm}} = \\frac{1}{\\sqrt{2}}(\\ket{00} \\pm \\ket{11})"
  },
  {
    id: "measurement",
    title: "얽힘 측정",
    image: "/images/entanglement-measurement.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Quantum_entanglement_experiment.png",
    formula: "\\text{측정 결과: } P(00) = P(11) = \\frac{1}{2}, \\quad P(01) = P(10) = 0"
  },
  {
    id: "applications",
    title: "얽힘의 응용",
    image: "/images/entanglement-applications.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/7/73/Quantum_teleportation.svg",
    formula: "\\text{양자 텔레포테이션, 밀도 부호화, 양자 암호}"
  }
];

function Entangle() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([null, null, null, null]);

  const pageMap: Record<string, string[]> = {
    "얽힘": ["/entangle"]
  };

  const handleSlideChange = (title: string, detailIdx: number) => {
    const path = pageMap[title]?.[detailIdx];
    if (path) navigate(path);
  };
  // 스크롤 이벤트 처리
  useEffect(() => {    const handleScroll = () => {
      if (!textContainerRef.current) return;
      
      // 현재 스크롤 위치 확인
      const scrollPosition = textContainerRef.current.scrollTop;
      const containerHeight = textContainerRef.current.clientHeight;
      
      // 화면 중앙 위치
      const screenCenter = scrollPosition + containerHeight / 2;
      
      // 각 섹션의 위치 확인하여 현재 보이는 섹션 결정
      let currentSection = 0;
      
      // 모든 섹션을 순회하며 스크롤 위치에 따른 투명도 조정
      sectionRefs.current.forEach((section, index) => {
        if (!section) return;
        
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionCenter = sectionTop + sectionHeight / 2;
        
        // 섹션이 화면 상단에서 비율적으로 충분히 보이면 현재 섹션으로 설정
        // 화면의 1/3 지점을 기준으로 섹션 전환
        if (scrollPosition >= sectionTop - containerHeight / 3) {
          currentSection = index;
        }
        
        // 현재 섹션이 화면 중앙에서 얼마나 떨어져 있는지 계산
        const distanceFromCenter = Math.abs(sectionCenter - screenCenter);
        const maxDistance = containerHeight * 0.7; // 최대 거리 (이 이상이면 opacity 최소값 적용)
          // 거리에 따른 투명도 계산 (중앙에 가까울수록 1에 가까움, 멀수록 0.3에 가까움)
        let opacity = 1 - (distanceFromCenter / maxDistance) * 0.7; // 0.3 ~ 1 범위의 투명도
        opacity = Math.max(0.3, Math.min(1, opacity)); // 0.3에서 1 사이로 제한
        
        // 중앙에 있는지 여부 (거리가 컨테이너 높이의 15% 이내인 경우)
        const isInCenter = distanceFromCenter < (containerHeight * 0.15);
        
        // 섹션에 중앙 위치 클래스 추가/제거
        if (isInCenter) {
          section.classList.add('in-center');
        } else {
          section.classList.remove('in-center');
        }
        
        // 텍스트 투명도 적용
        const contentText = section.querySelector('.section-content');
        if (contentText) {
          (contentText as HTMLElement).style.opacity = opacity.toString();
        }
        
        // 제목 투명도 적용 (제목은 약간 높은 최소 투명도)
        const headingText = section.querySelector('h2');
        if (headingText) {
          const headingOpacity = Math.max(0.5, opacity); // 제목은 최소 0.5 투명도
          (headingText as HTMLElement).style.opacity = headingOpacity.toString();
        }
      });
        if (currentSection !== activeSection) {        // 섹션이 변경되면 그래픽 요소에 애니메이션 효과를 위한 클래스 추가/제거
        setActiveSection(currentSection);
        
        // 네비게이션 항목 강조 처리
        const navigationItems = document.querySelectorAll('.section-item');
        navigationItems.forEach((item, idx) => {
          if (idx === currentSection) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
        
        // 그래픽 컨테이너 애니메이션 효과 추가
        const graphicsContent = document.querySelector('.graphics-content');
        if (graphicsContent) {
          graphicsContent.classList.remove('animated');
          void (graphicsContent as HTMLElement).offsetWidth; // 리플로우 강제로 발생시켜 애니메이션 재시작
          graphicsContent.classList.add('animated');
          
          // 이미지와 수식 요소에 개별 애니메이션 적용
          const sectionImage = document.querySelector('.section-image');
          const formulaDisplay = document.querySelector('.formula-display');
          
          if (sectionImage) {
            sectionImage.classList.remove('animated');
            void (sectionImage as HTMLElement).offsetWidth;
            sectionImage.classList.add('animated');
          }
          
          if (formulaDisplay) {
            formulaDisplay.classList.remove('animated');
            void (formulaDisplay as HTMLElement).offsetWidth;
            formulaDisplay.classList.add('animated');
          }
        }
      }
    };
      // 스로틀링 적용: 스크롤 이벤트가 너무 자주 발생하지 않도록 최적화
    let ticking = false;
    let lastScrollTime = 0;
    const scrollThreshold = 10; // 10ms 이내의 스크롤은 무시 (성능 최적화)
    
    const throttledScroll = () => {
      const now = Date.now();
      if (!ticking && now - lastScrollTime > scrollThreshold) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
          lastScrollTime = Date.now();
        });
        ticking = true;
      }
    };
    
    const container = textContainerRef.current;
    if (container) {
      container.addEventListener('scroll', throttledScroll);
      
      // 스크롤이 멈추면 마지막으로 한번 더 업데이트
      container.addEventListener('scrollend', handleScroll, { passive: true });
    }
    
    // 페이지 로드 시 초기 스크롤 위치에 따라 섹션 설정
    handleScroll();
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', throttledScroll);
        container.removeEventListener('scrollend', handleScroll);
      }
    };
  }, [activeSection]);  return (
    <div className="slide-container">      <SlideMenu
        current="얽힘"
        detailIdx={0}
        onChange={handleSlideChange}
        sectionRefs={sectionRefs}
      />
      {/* 가로 분할 레이아웃 */}
      <div className="split-layout">
        {/* 스크롤 가이드는 텍스트 섹션 안으로 이동 */}        {/* 왼쪽 텍스트 섹션 */}          <div className="text-section" ref={textContainerRef}>
          
          
          <div className="scroll-guide">
            <div className="scroll-guide-icon">↓</div>
            <div>스크롤하여 더 보기</div>
          </div>
            {/* 섹션 1 */}          <section className={`content-section ${activeSection === 0 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[0] = el; }}>
            <h2>양자 얽힘 소개</h2>
            <p className="section-content">양자 얽힘은 둘 이상의 입자가 서로 얽혀 있어 하나의 상태를 측정하면 다른 입자의 상태도 즉시 결정되는 현상입니다. 아인슈타인은 이를 '괴기한 원격 작용'이라고 불렀습니다.</p>
          </section>
            {/* 섹션 2 */}          <section className={`content-section ${activeSection === 1 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[1] = el; }}>
            <h2>벨 상태</h2>
            <p className="section-content">벨 상태는 가장 단순하면서도 완전히 얽힌 두 큐비트 상태를 의미합니다. 이 상태에서는 두 큐비트가 항상 완벽하게 상관 관계를 가지며, 양자 얽힘의 기본 형태를 나타냅니다.</p>
          </section>
            {/* 섹션 3 */}          <section className={`content-section ${activeSection === 2 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[2] = el; }}>
            <h2>얽힘 측정</h2>
            <p className="section-content">얽힘 상태에서 하나의 큐비트를 측정하면, 다른 큐비트의 상태도 즉시 결정됩니다. 이는 거리에 상관없이 발생하는 현상으로, 양자 정보의 기반이 됩니다.</p>
          </section>
            {/* 섹션 4 */}          <section className={`content-section ${activeSection === 3 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[3] = el; }}>
            <h2>얽힘의 응용</h2>
            <p className="section-content">양자 얽힘은 양자 텔레포테이션, 초밀도 부호화, 양자 암호화 등 다양한 양자 기술의 핵심 메커니즘입니다. 이를 통해 기존 기술로는 불가능한 정보 처리가 가능해집니다.</p>
          </section>
        </div>
          {/* 오른쪽 그래픽 섹션 */}
        <div className="graphics-section">
          <div className="graphics-container">
            <h2 className="graphics-title">{sectionGraphics[activeSection].title}</h2>
            <div className="graphics-content animated">
              <img 
                src={sectionGraphics[activeSection].image} 
                alt={sectionGraphics[activeSection].title}
                className="section-image"
                onError={(e) => {
                  // 이미지 로드 실패 시 폴백 이미지 사용
                  e.currentTarget.src = sectionGraphics[activeSection].fallbackImage;
                }}
              />
              <div className="formula-display">
                <BlockMath math={sectionGraphics[activeSection].formula} />
              </div>
            </div>
            <div className="graphics-indicators">
              {sectionGraphics.map((section, idx) => (
                <div 
                  key={section.id}
                  className={`indicator ${activeSection === idx ? 'active' : ''}`}
                  onClick={() => {
                    // 인디케이터 클릭 시 해당 섹션으로 스크롤
                    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="indicator-label">{section.title}</span>
                </div>              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Entangle;
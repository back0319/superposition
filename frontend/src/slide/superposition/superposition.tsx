import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SlideMenu from "../slide";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import './superposition.scss';

// Import components
import SuperpositionIntroDemo from './components/SuperpositionIntroDemo';
import SuperpositionMeasurementDemo from './components/SuperpositionMeasurementDemo';

const menu = [  
  { title: "얽힘", details: ["얽힘이란", "벨 상태", "얽힘 측정"] },
  { title: "중첩", details: ["중첩의 정의", "중첩 상태의 측정과 붕괴"] },
  { title: "큐비트", details: ["정의", "상태벡터", "블로흐 구"] }
];

// 섹션별 그래픽 데이터 정의
const sectionGraphics = [
  {
    id: "definition",
    title: "중첩의 정의",
    image: "/images/superposition-intro.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Superposition_of_quantum_states.png/800px-Superposition_of_quantum_states.png",
    formula: "|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle"
  },
  {
    id: "measurement",
    title: "중첩 상태의 측정과 붕괴",
    image: "/images/superposition-measurement.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Quantum_measurement.svg/800px-Quantum_measurement.svg.png",
    formula: "P(|0\\rangle) = |\\alpha|^2, \\quad P(|1\\rangle) = |\\beta|^2"
  }
];

function Superposition() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([null, null]);
  const [sectionPositions, setSectionPositions] = useState<number[]>([]);

  const pageMap: Record<string, string[]> = {
    "큐비트": ["/qubit"],
    "얽힘": ["/entangle"],
    "중첩": ["/superposition"]
  };

  const handleSlideChange = (title: string, detailIdx: number) => {
    const path = pageMap[title]?.[detailIdx];
    if (path) navigate(path);
  };

  // 각 섹션의 상대적 위치를 계산하는 함수
  const calculateSectionPositions = () => {
    if (!textContainerRef.current) return;
    
    const container = textContainerRef.current;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    
    // 각 섹션의 시작 위치를 계산하여 백분율로 저장
    const positions = sectionRefs.current.map((section) => {
      if (!section) return 0;
      const sectionTop = section.offsetTop;
      // 섹션 시작 위치의 백분율 계산 (전체 스크롤 길이 대비)
      return Math.min(100, Math.max(0, (sectionTop / scrollHeight) * 100));
    });
    
    setSectionPositions(positions);
  };

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      if (!textContainerRef.current) return;
      
      // 스크롤 진행도 계산
      const container = textContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollable = scrollHeight - clientHeight;
      
      // 스크롤 진행도 상태 업데이트
      if (scrollable > 0) {
        const progress = (scrollTop / scrollable) * 100;
        setScrollProgress(progress);
      }
      
      // 현재 스크롤 위치 확인
      const scrollPosition = container.scrollTop;
      const containerHeight = container.clientHeight;
      
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
        
        // 중앙에 있는지 여부 (거리가 컨테이너 높이의 25% 이내인 경우)
        const isInCenter = distanceFromCenter < (containerHeight * 0.25);
        
        // 섹션에 중앙 위치 클래스 추가/제거
        if (isInCenter) {
          section.classList.add('in-center');
        } else {
          section.classList.remove('in-center');
        }

        // 텍스트 투명도 적용 (중앙이 아닐 경우만 인라인 스타일 적용)
        const contentText = section.querySelector('.section-content');
        if (contentText) {
          if (!isInCenter) {
            (contentText as HTMLElement).style.opacity = opacity.toString();
            (contentText as HTMLElement).style.textShadow = '';
            (contentText as HTMLElement).style.color = '';
            (contentText as HTMLElement).style.transform = '';
            // 내부 p 태그들도 같은 투명도로 설정
            const paragraphs = contentText.querySelectorAll('p');
            paragraphs.forEach((p: Element) => {
              (p as HTMLElement).style.opacity = opacity.toString();
            });
          } else {
            // 중앙에 있는 경우는 CSS 클래스를 통해 스타일 적용
            (contentText as HTMLElement).style.opacity = '1';
            // 내부 p 태그들도 완전히 불투명하게
            const paragraphs = contentText.querySelectorAll('p');
            paragraphs.forEach(p => {
              (p as HTMLElement).style.opacity = '1';
            });
          }
        }
        
        // 제목 투명도 적용 (중앙이 아닐 경우만 인라인 스타일 적용)
        const headingText = section.querySelector('h2');
        if (headingText) {
          if (!isInCenter) {
            const headingOpacity = Math.max(0.5, opacity); // 제목은 최소 0.5 투명도
            (headingText as HTMLElement).style.opacity = headingOpacity.toString();
            (headingText as HTMLElement).style.color = '';
            (headingText as HTMLElement).style.textShadow = '';
            (headingText as HTMLElement).style.transform = '';
            (headingText as HTMLElement).style.letterSpacing = '';
          } else {
            // 중앙에 있는 경우는 CSS 클래스를 통해 스타일 적용
            (headingText as HTMLElement).style.opacity = '1';
          }
        }
      });
      
      if (currentSection !== activeSection) {
        // 섹션이 변경되면 그래픽 요소에 애니메이션 효과를 위한 클래스 추가/제거
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
            
            // 이미지에 추가 시각 효과
            (sectionImage as HTMLElement).style.filter = 'brightness(1.2) contrast(1.1)';
            setTimeout(() => {
              (sectionImage as HTMLElement).style.filter = '';
            }, 800);
          }
          
          if (formulaDisplay) {
            formulaDisplay.classList.remove('animated');
            void (formulaDisplay as HTMLElement).offsetWidth;
            formulaDisplay.classList.add('animated');
            
            // 수식에 추가 시각 효과
            (formulaDisplay as HTMLElement).style.textShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
            setTimeout(() => {
              (formulaDisplay as HTMLElement).style.textShadow = '';
            }, 800);
          }
        }
      }
    };
    
    // 스로틀링 적용: 스크롤 이벤트가 너무 자주 발생하지 않도록 최적화
    let ticking = false;
    let lastScrollTime = 0;
    const scrollThreshold = 5; // 5ms 이내의 스크롤은 무시 (성능 최적화 & 더 매끄러운 스크롤)
    
    const throttledScroll = () => {
      const now = Date.now();
      
      // 스크롤 진행도 즉시 업데이트 (더 매끄러운 프로그레스 바를 위해)
      if (!textContainerRef.current) return;
      const container = textContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollable = scrollHeight - clientHeight;
      
      if (scrollable > 0) {
        const progress = (scrollTop / scrollable) * 100;
        setScrollProgress(progress);
      }
      
      // 다른 스크롤 처리는 throttle 적용
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
  }, [activeSection]); 
  
  // 섹션 위치 계산을 위한 useEffect
  useEffect(() => {
    // 초기 섹션 위치 계산
    calculateSectionPositions();
    
    // 창 크기 변경 시 섹션 위치 재계산
    const handleResize = () => {
      calculateSectionPositions();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 콘텐츠 로드 후 섹션 위치 계산을 위한 timeout 설정
    const timer = setTimeout(calculateSectionPositions, 300);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="slide-container">
      <SlideMenu
        current="중첩"
        detailIdx={0}
        onChange={handleSlideChange}
        sectionRefs={sectionRefs}
        scrollProgress={scrollProgress}
        sectionPositions={sectionPositions}
      />
      
      {/* 프로그레스 바 업데이트 - 스크롤 진행에 따라 채워지도록 수정 */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${scrollProgress}%` }}
          ></div>
          
          {/* 각 섹션의 포인트들 */}
          {sectionGraphics.map((section, idx) => {
            // 각 섹션의 실제 위치에 기반한 포인트 위치 계산
            const pointPosition = sectionPositions[idx] || (idx / (sectionGraphics.length - 1)) * 100;
            const isReached = scrollProgress >= pointPosition;
            
            return (
              <div
                key={`progress-point-${idx}`}
                className={`progress-point ${idx <= activeSection ? 'active' : ''} ${isReached ? 'reached' : ''}`}
                style={{ left: `${pointPosition}%` }}
                onClick={() => {
                  sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="point-label">{section.title}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 가로 분할 레이아웃 */}
      <div className="split-layout">
        {/* 왼쪽 텍스트 섹션 */}
        <div className="text-section" ref={textContainerRef}>
          <div className="scroll-guide">
            <div className="scroll-guide-icon">↓</div>
            <div>스크롤하여 양자 중첩에 대해 알아보기</div>
          </div>
          
          {/* 섹션 1: 중첩의 정의 */}
          <section className={`content-section ${activeSection === 0 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[0] = el; }}>
            <h2>중첩의 정의</h2>
            <div className="section-content">
              <p>일상 세계에서 한 물체는 한 번에 한 위치에만 존재할 수 있습니다. 그런데 양자 세계에서는 놀랍게도 하나의 입자가 <strong>여러 다른 상태를 동시에 가질 수 있어요</strong>. 이런 신기한 현상을 <strong>양자 중첩(Quantum Superposition)</strong>이라고 합니다! 🔮</p>
              
              <p>중첩 상태에 있는 큐비트는 0과 1 둘 다 아닌, 그 사이의 무한한 가능성을 가집니다. 마치 동전이 앞면도 뒷면도 아닌 공중에 떠 있는 상태와 비슷해요!</p>
              
              <p>✨ <strong>중첩의 핵심 개념:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li>하나의 입자가 여러 상태를 <strong>동시에</strong> 가질 수 있어요</li>
                <li>중첩된 큐비트는 <strong>0과 1 사이의 모든 가능성</strong>을 가져요</li>
                <li>수학적으로는 <strong>|ψ⟩ = α|0⟩ + β|1⟩</strong> 형태로 표현돼요</li>
                <li>여기서 α와 β는 <strong>확률 진폭</strong>이라 불리는 복소수예요</li>
              </ul>
              
              <p>🧙‍♂️ <strong>중첩의 마법 같은 힘:</strong></p>
              <p>중첩 덕분에 양자 컴퓨터는 여러 계산을 동시에 처리할 수 있어요! 일반 컴퓨터가 하나씩 순차적으로 계산하는 동안, 양자 컴퓨터는 모든 가능성을 한 번에 탐색할 수 있답니다. 이것이 바로 양자 컴퓨터가 특정 문제를 기존 컴퓨터보다 훨씬 빠르게 해결할 수 있는 비밀이에요! 🚀</p>
              
              <p>🔬 <strong>중첩의 역사:</strong></p>
              <p>중첩 원리는 1920년대에 처음 발견되었어요. 특히 유명한 <strong>슈뢰딩어의 고양이</strong> 사고실험은 양자 중첩의 이상함을 설명하기 위해 만들어졌답니다. 이 실험에서 고양이는 이론적으로 살아있는 상태와 죽은 상태의 중첩 상태에 놓이게 됩니다! 🐱</p>
            </div>
          </section>
          
          {/* 섹션 2: 중첩 상태의 측정과 붕괴 */}
          <section className={`content-section ${activeSection === 1 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[1] = el; }}>
            <h2>중첩 상태의 측정과 붕괴</h2>
            <div className="section-content">
              <p>양자 중첩은 우리가 관찰하기 전까지만 유지돼요. 중첩 상태에 있는 큐비트를 <strong>측정(measurement)</strong>하는 순간, 중첩은 사라지고 큐비트는 0 또는 1 중 하나의 명확한 상태로 <strong>붕괴(collapse)</strong>합니다! 🔍</p>
              
              <p>이런 현상을 <strong>파동함수 붕괴</strong>라고 불러요. 마치 주사위를 던져 공중에 있을 때는 모든 면이 가능하지만, 바닥에 닿는 순간 한 면만 나오는 것처럼요!</p>
              
              <p>🎯 <strong>측정 결과의 확률:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li>큐비트가 <strong>|0⟩ 상태로 측정될 확률</strong>: |α|² (알파의 제곱)</li>
                <li>큐비트가 <strong>|1⟩ 상태로 측정될 확률</strong>: |β|² (베타의 제곱)</li>
                <li>언제나 |α|² + |β|² = 1 (총 확률은 항상 100%)</li>
              </ul>
              
              <p>🧩 <strong>양자 측정의 특별한 성질:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li><strong>불가역성</strong>: 한 번 붕괴된 상태는 되돌릴 수 없어요</li>
                <li><strong>확률적 본질</strong>: 결과를 완벽히 예측할 수 없어요</li>
                <li><strong>관찰자 효과</strong>: 측정 행위 자체가 시스템을 변화시켜요</li>
                <li><strong>양자 얽힘과의 관계</strong>: 얽힌 입자 하나를 측정하면 다른 입자의 상태도 즉시 결정돼요</li>
              </ul>
              
              <p>🔮 <strong>측정 방향의 중요성:</strong></p>
              <p>큐비트를 어떤 방향(기저)으로 측정하느냐에 따라 다른 결과를 얻을 수 있어요. 표준 기저(Z-기저)로 측정하면 |0⟩ 또는 |1⟩을 얻고, X-기저로 측정하면 |+⟩ 또는 |-⟩를 얻게 됩니다. 이것이 양자 암호학의 핵심 아이디어가 되었어요! 🔐</p>
              
              <p>💡 <strong>양자 중첩과 측정의 응용:</strong></p>
              <p>중첩과 측정의 특성은 <strong>양자 난수 생성기</strong>, <strong>양자 암호화</strong>, <strong>양자 컴퓨팅 알고리즘</strong> 등 다양한 혁신적 기술의 기반이 되고 있어요. 미래 기술의 열쇠를 쥐고 있는 중요한 개념이랍니다!</p>
            </div>
          </section>
        </div>
        
        {/* 오른쪽 그래픽 섹션 */}
        <div className="graphics-section">
          <div className="graphics-container">
            <h2 className="graphics-title">{sectionGraphics[activeSection].title}</h2>
            <div className="graphics-content animated">
              {/* 섹션별 2D 인터랙티브 컴포넌트 렌더링 */}
              {activeSection === 0 && <SuperpositionIntroDemo />}
              {activeSection === 1 && <SuperpositionMeasurementDemo />}
              
              {/* 폴백 이미지 및 수식 (컴포넌트 아래에 표시) */}
              <div className="fallback-content">
                <img 
                  src={sectionGraphics[activeSection].image} 
                  alt={sectionGraphics[activeSection].title}
                  className="section-image fallback"
                  onError={(e) => {
                    e.currentTarget.src = sectionGraphics[activeSection].fallbackImage;
                  }}
                  style={{ display: 'none' }} // 기본적으로 숨김
                />
                <div className="formula-display">
                  <BlockMath math={sectionGraphics[activeSection].formula} />
                </div>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Superposition;
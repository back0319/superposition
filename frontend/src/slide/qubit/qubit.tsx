import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SlideMenu from "../slide";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import './qubit.scss';

// Import 2D components
import QubitDefinitionDemo from './components/QubitDefinitionDemo';
import StateVectorDemo from './components/StateVectorDemo';
import BlochSphereDemo from './components/BlochSphereDemo';

const menu = [  
  { title: "얽힘", details: ["얽힘이란", "벨 상태", "얽힘 측정"] },
  { title: "중첩", details: ["중첩 원리", "하드라마드 게이트"] },
  { title: "큐비트", details: ["정의", "상태벡터", "블로흐 구"] }
];

// 섹션별 그래픽 데이터 정의 - 타입 정의 추가
interface SectionGraphic {
  id: string;
  title: string;
  image: string;
  fallbackImage: string;
  formula: string;
}

const sectionGraphics: SectionGraphic[] = [
  {
    id: "definition",
    title: "큐비트의 정의",
    image: "/images/qubit-definition.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bloch_sphere.svg",
    formula: "\\left|\\psi\\right\\rangle = \\alpha\\left|0\\right\\rangle + \\beta\\left|1\\right\\rangle"
  },
  {
    id: "state-vector",
    title: "상태 벡터",
    image: "/images/state-vector.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Qubit_Representations.png",
    formula: "\\begin{pmatrix} \\alpha \\\\ \\beta \\end{pmatrix}, \\text{where } |\\alpha|^2 + |\\beta|^2 = 1"
  },
  {
    id: "bloch-sphere",
    title: "블로흐 구",
    image: "/images/bloch-sphere.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Bloch_Sphere.svg/1200px-Bloch_Sphere.svg.png",
    formula: "\\left|\\psi\\right\\rangle = \\cos\\frac{\\theta}{2}\\left|0\\right\\rangle + e^{i\\phi}\\sin\\frac{\\theta}{2}\\left|1\\right\\rangle"
  }
];

function Qubit() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0); // 스크롤 진행 상태 추가
  const textContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([null, null, null]);
  // 섹션의 상대적 위치 정보를 저장하는 상태
  const [sectionPositions, setSectionPositions] = useState<number[]>([]);
  const pageMap: Record<string, string[]> = {
    "큐비트": ["/qubit"],
    "얽힘": ["/entangle"],
    "중첩": ["/sp1"]
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
          
        // 중앙에 있는지 여부 (거리가 컨테이너 높이의 25% 이내인 경우 - 영역을 더 넓힘)
        const isInCenter = distanceFromCenter < (containerHeight * 0.25);
        
        // 섹션에 중앙 위치 클래스 추가/제거
        if (isInCenter) {
          section.classList.add('in-center');
          
          // 중앙 섹션일 때는 CSS 클래스를 통해 스타일이 적용되므로
          // 추가적인 인라인 스타일링은 필요하지 않음
        } else {
          section.classList.remove('in-center');
          
          // 중앙에서 벗어났을 때 원래 상태로 복원 (CSS 트랜지션이 알아서 처리)
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
        current="큐비트"
        detailIdx={0}
        onChange={handleSlideChange}
        sectionRefs={sectionRefs}
        scrollProgress={scrollProgress}
        sectionPositions={sectionPositions}
      />
      
      {/* 프로그레스 바 */}
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
            <div>스크롤하여 큐비트에 대해 알아보기</div>
          </div>

          {/* 섹션 1: 큐비트의 정의 */}
          <section className={`content-section ${activeSection === 0 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[0] = el; }}>
            <h2>큐비트의 정의</h2>
            <div className="section-content">
              <p>일반 컴퓨터가 0과 1로만 정보를 저장하는 <strong>비트(bit)</strong>를 사용한다면, 양자 컴퓨터는 <strong>큐비트(qubit)</strong>라는 특별한 정보 단위를 사용해요!</p>
              
              <p>💡 <strong>큐비트란?</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li>양자 세계의 가장 기본 정보 단위로 양자 컴퓨터의 '0'과 '1'이에요</li>
                <li>일반 비트와 달리 0과 1을 <strong>동시에</strong> 가질 수 있어요 (양자 중첩 상태)</li>
                <li>여러 큐비트가 <strong>얽혀서</strong> 훨씬 많은 정보를 담을 수 있어요</li>
              </ul>
              
              <p>📚 <strong>수학적으로는?</strong></p>
              <p>큐비트는 수학적으로 이렇게 표현해요:</p>
              <div className="formula-box">
                |ψ⟩ = α|0⟩ + β|1⟩
              </div>
              <p>여기서:</p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li>|ψ⟩ (사이): 큐비트의 양자 상태</li>
                <li>α (알파): 0 상태의 확률 진폭</li>
                <li>β (베타): 1 상태의 확률 진폭</li>
                <li>|α|² + |β|² = 1: 확률의 합은 항상 1 (100%)</li>
              </ul>
              
              <p>⚛️ <strong>큐비트의 특별한 점:</strong></p>
              <p>큐비트가 관측되기 전까지는 0과 1이 <strong>"중첩"</strong>되어 있어요. 마치 동전을 공중에 던졌을 때 앞면과 뒷면이 동시에 존재하는 것처럼요! 하지만 측정(관측)하는 순간 하나의 값만 나타납니다.</p>
              
              <p>🔬 <strong>어떻게 만들어요?</strong></p>
              <p>실제 큐비트는 다양한 물리 시스템으로 구현할 수 있어요:</p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li>🔄 전자의 스핀</li>
                <li>⚡ 초전도체의 양자 상태</li>
                <li>🧠 이온의 에너지 레벨</li>
                <li>💎 다이아몬드의 결점</li>
              </ul>
              
              <p>이렇게 신비한 특성을 가진 큐비트 덕분에 양자 컴퓨터는 특정 문제에서 일반 컴퓨터보다 훨씬 빠르게 계산할 수 있는 가능성을 가지고 있어요! 🚀</p>
            </div>
          </section>

          {/* 섹션 2: 상태 벡터 */}
          <section className={`content-section ${activeSection === 1 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[1] = el; }}>
            <h2>상태 벡터</h2>
            <div className="section-content">
              <p>큐비트의 상태를 수학적으로 표현하는 방법 중 가장 기본적인 것은 <strong>상태 벡터</strong>에요! 이것은 큐비트의 모든 정보를 담은 수학적인 표현이랍니다.</p>
              
              <p>📏 <strong>상태 벡터란?</strong></p>
              <p>상태 벡터는 2차원 복소수 공간에서 큐비트의 상태를 나타내는 벡터에요:</p>
              <div className="formula-box">
                |ψ⟩ = 
                <div style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '5px', marginRight: '5px' }}>
                  <div style={{ borderLeft: '1px solid white', borderRight: '1px solid white', padding: '0 5px' }}>
                    <div>α</div>
                    <div>β</div>
                  </div>
                </div>
              </div>
              <p>여기서 α와 β는 복소수이고, 확률 보존 법칙에 따라 |α|² + |β|² = 1을 만족해요.</p>
              
              <p>🎲 <strong>측정 확률:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li>|α|²: 측정 시 |0⟩ 상태를 얻을 확률</li>
                <li>|β|²: 측정 시 |1⟩ 상태를 얻을 확률</li>
              </ul>
              
              <p>📊 <strong>특별한 상태 벡터들:</strong></p>
              <div className="state-vectors">
                <div className="state-vector">
                  <div className="state-name">|0⟩ 상태</div>
                  <div className="vector-formula">
                    <div style={{ borderLeft: '1px solid white', borderRight: '1px solid white', padding: '0 5px' }}>
                      <div>1</div>
                      <div>0</div>
                    </div>
                  </div>
                </div>
                <div className="state-vector">
                  <div className="state-name">|1⟩ 상태</div>
                  <div className="vector-formula">
                    <div style={{ borderLeft: '1px solid white', borderRight: '1px solid white', padding: '0 5px' }}>
                      <div>0</div>
                      <div>1</div>
                    </div>
                  </div>
                </div>
                <div className="state-vector">
                  <div className="state-name">|+⟩ 상태</div>
                  <div className="vector-formula">
                    <div style={{ borderLeft: '1px solid white', borderRight: '1px solid white', padding: '0 5px' }}>
                      <div>1/√2</div>
                      <div>1/√2</div>
                    </div>
                  </div>
                </div>
                <div className="state-vector">
                  <div className="state-name">|-⟩ 상태</div>
                  <div className="vector-formula">
                    <div style={{ borderLeft: '1px solid white', borderRight: '1px solid white', padding: '0 5px' }}>
                      <div>1/√2</div>
                      <div>-1/√2</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p>🔄 <strong>큐비트 변환:</strong></p>
              <p>큐비트의 상태를 변화시킬 때는 <strong>유니타리 연산자(Unitary operators)</strong>라는 특별한 행렬을 사용해요. 이는 양자 게이트에 해당하는 수학적 표현이에요.</p>
              
              <p>예를 들어, X 게이트(NOT 연산)는 |0⟩을 |1⟩으로, |1⟩을 |0⟩으로 바꾸는 행렬이에요:</p>
              <div className="formula-box">
                X = 
                <div style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '5px', marginRight: '5px' }}>
                  <div style={{ borderLeft: '1px solid white', borderRight: '1px solid white', padding: '0 5px' }}>
                    <div>0 1</div>
                    <div>1 0</div>
                  </div>
                </div>
              </div>
              
              <p>🧩 <strong>여러 큐비트의 상태 벡터</strong></p>
              <p>n개의 큐비트 시스템은 2^n 차원의 상태 벡터가 필요해요. 3개 큐비트는 8차원 벡터로 표현됩니다!</p>
              
              <p>이렇게 높은 차원의 상태 공간을 다룰 수 있는 것이 양자 컴퓨터의 큰 장점이에요. 고전 컴퓨터에서는 n개의 비트로 단 하나의 상태만 표현할 수 있지만, n개의 큐비트는 동시에 2^n개의 상태를 표현할 수 있답니다! 💪</p>
            </div>
          </section>

          {/* 섹션 3: 블로흐 구 */}
          <section className={`content-section ${activeSection === 2 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[2] = el; }}>
            <h2>블로흐 구</h2>
            <div className="section-content">
              <p><strong>블로흐 구(Bloch sphere)</strong>는 큐비트 상태를 시각적으로 표현하는 가장 직관적인 방법이에요. 복잡한 수학 대신 3D 공간에서 큐비트를 볼 수 있답니다!</p>
              
              <p>🌐 <strong>블로흐 구란?</strong></p>
              <p>블로흐 구는 반지름이 1인 3차원 구(sphere)로, 큐비트의 모든 가능한 순수 상태가 이 구의 표면 위의 한 점으로 표현돼요.</p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li><strong>북극(|0⟩)</strong>: 큐비트가 100% |0⟩ 상태</li>
                <li><strong>남극(|1⟩)</strong>: 큐비트가 100% |1⟩ 상태</li>
                <li><strong>적도상의 점</strong>: |0⟩과 |1⟩의 50:50 중첩 상태</li>
                <li><strong>그 외 표면의 점</strong>: |0⟩과 |1⟩의 다양한 확률 비율 조합</li>
              </ul>
              
              <p>📐 <strong>수학적 표현:</strong></p>
              <p>블로흐 구 상의 모든 점은 두 각도로 표현할 수 있어요:</p>
              <div className="formula-box">
                |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
              </div>
              <p>여기서:</p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li><strong>θ (세타, 0 ≤ θ ≤ π)</strong>: 북극(θ=0)에서 남극(θ=π)까지의 각도</li>
                <li><strong>φ (파이, 0 ≤ φ &lt; 2π)</strong>: 적도 평면에서의 회전 각도</li>
              </ul>
              
              <p>🎮 <strong>양자 게이트와 블로흐 구:</strong></p>
              <p>양자 게이트는 블로흐 구에서 큐비트를 회전시키는 연산으로 표현할 수 있어요:</p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li><strong>X 게이트</strong>: x축을 중심으로 π 회전 (|0⟩ ↔ |1⟩)</li>
                <li><strong>Y 게이트</strong>: y축을 중심으로 π 회전</li>
                <li><strong>Z 게이트</strong>: z축을 중심으로 π 회전 (위상 반전)</li>
                <li><strong>H 게이트</strong>: |0⟩을 적도 상의 |+⟩로, |1⟩을 |-⟩로 변환</li>
              </ul>
              
              <p>🔒 <strong>블로흐 구의 한계:</strong></p>
              <p>블로흐 구는 <strong>단일 큐비트</strong>만 표현할 수 있어요. 여러 큐비트의 얽힘 상태는 블로흐 구로 표현할 수 없답니다! 이는 얽힌 상태가 개별 큐비트로 분리할 수 없는 특별한 상태이기 때문이에요.</p>
              
              <p>🔬 <strong>실험에서의 활용:</strong></p>
              <p>과학자들은 블로흐 구를 이용해 큐비트 조작을 계획하고 실행 결과를 분석해요. 양자 상태 톡모그래피(quantum state tomography)라는 기술을 통해 실제 큐비트의 블로흐 구 좌표를 측정할 수도 있답니다!</p>
              
              <p>블로흐 구는 추상적인 양자역학 개념을 직관적으로 이해할 수 있게 도와주는 강력한 도구에요. 복잡한 수식 대신 구 위의 점으로 생각하면 큐비트의 동작을 더 쉽게 상상할 수 있답니다! 🧠✨</p>
            </div>
          </section>
        </div>
        
        {/* 오른쪽 그래픽 섹션 */}
        <div className="graphics-section">
          <div className="graphics-container">
            <h2 className="graphics-title">{sectionGraphics[activeSection].title}</h2>
            <div className="graphics-content animated">
              {/* 섹션별 2D 인터랙티브 컴포넌트 렌더링 */}
              {activeSection === 0 && <QubitDefinitionDemo />}
              {activeSection === 1 && <StateVectorDemo />}
              {activeSection === 2 && <BlochSphereDemo />}
              
              {/* 폴백 이미지 및 수식 */}
              <div className="fallback-content">
                <img 
                  src={sectionGraphics[activeSection].image} 
                  alt={sectionGraphics[activeSection].title}
                  className="section-image fallback"
                  onError={(e) => {
                    e.currentTarget.src = sectionGraphics[activeSection].fallbackImage;
                  }}
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

export default Qubit;
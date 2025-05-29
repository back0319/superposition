import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SlideMenu from "../slide";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import './entangle.scss';

// Import 2D components
import EntanglementDemo from './components/EntanglementDemo';
import PropertiesDemo from './components/PropertiesDemo';
import BellStatesDemo from './components/BellStatesDemo';
import BellTestDemo from './components/BellTestDemo';

const menu = [  
  { title: "얽힘", details: ["얽힘이란", "벨 상태", "얽힘 측정"] },
  { title: "중첩", details: ["중첩 원리", "하드라마드 게이트"] },
  { title: "큐비트", details: ["정의", "상태벡터", "블로흐 구"] }
];

// 섹션별 그래픽 데이터 정의
const sectionGraphics = [
  {
    id: "definition",
    title: "양자 얽힘이란?",
    image: "/images/entanglement-intro.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Quantum_entanglement.svg",
    formula: "\\text{얽힌 입자 A + 얽힌 입자 B = 하나의 연결된 시스템}"
  },
  {
    id: "characteristics",
    title: "얽힘의 신기한 특성들",
    image: "/images/entanglement-properties.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Quantum_entanglement_experiment.png ",
    formula: "\\text{입자 A의 상태} \\rightarrow \\text{즉시 결정되는 입자 B의 상태}"
  },
  {
    id: "bell-states",
    title: "특별한 얽힘 상태들",
    image: "/images/bell-states.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Bloch_sphere_bell.svg",
    formula: "\\text{4가지 기본 얽힘 상태: } \\Phi^+, \\Phi^-, \\Psi^+, \\Psi^-"
  },  {
    id: "bell-inequality",
    title: "얽힘 증명하기",
    image: "/images/bell-inequality.png",
    fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/7/73/Quantum_teleportation.svg",
    formula: "\\text{실험 결과} > \\text{고전 물리학 예측값}"
  }
];

function Entangle() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0); // 스크롤 진행 상태 추가
  const textContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([null, null, null, null]);
  // 섹션의 상대적 위치 정보를 저장하는 상태
  const [sectionPositions, setSectionPositions] = useState<number[]>([]);

  const pageMap: Record<string, string[]> = {
    "얽힘": ["/entangle"]
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
    <div className="slide-container">      <SlideMenu
        current="얽힘"
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
        {/* 스크롤 가이드는 텍스트 섹션 안으로 이동 */}        {/* 왼쪽 텍스트 섹션 */}          <div className="text-section" ref={textContainerRef}>            <div className="scroll-guide">
            <div className="scroll-guide-icon">↓</div>
            <div>스크롤하여 양자 얽힘에 대해 알아보기</div>
            </div>{/* 섹션 1 */}          <section className={`content-section ${activeSection === 0 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[0] = el; }}>            <h2>양자 얽힘이란?</h2>
            <div className="section-content">
              <p>상상해보세요. 두 개의 특별한 동전이 있다고 해봅시다. 이 동전들은 마법처럼 연결되어 있어서, 한 동전이 앞면이 나오면 다른 동전은 반드시 뒷면이 나옵니다. 아무리 멀리 떨어뜨려 놓아도 말이죠!</p>
              
              <p><strong>양자 얽힘</strong>이 바로 이런 현상입니다. 두 개 이상의 아주 작은 입자들이 신비한 방식으로 연결되어, 하나의 입자 상태를 확인하면 다른 입자의 상태도 즉시 알 수 있게 됩니다.</p>
              
              <p>🔗 <strong>얽힘의 핵심 특징:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li>두 입자가 하나의 팀처럼 행동해요</li>
                <li>거리와 상관없이 즉시 연결되어 있어요</li>
                <li>하나를 관찰하면 다른 하나도 바로 결정돼요</li>
              </ul>
              
              <p>이 놀라운 현상은 1935년 아인슈타인이 처음 발견했어요. 그는 이것이 너무 이상해서 <strong>'유령 같은 원격 작용'</strong>이라고 불렀답니다. 하지만 지금은 이것이 자연의 실제 법칙이라는 것을 알고 있어요!</p>
              
              <p>양자 얽힘은 마치 텔레파시처럼 보이지만, 실제로는 정보를 빠르게 전송하는 것은 아니에요. 대신 양자 컴퓨터나 초보안 통신 같은 미래 기술의 핵심이 되고 있답니다! 🚀</p>
            </div></section>
            {/* 섹션 2 */}          <section className={`content-section ${activeSection === 1 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[1] = el; }}>            <h2>얽힘의 신기한 특성들</h2>
            <div className="section-content">
              <p>양자 얽힘은 우리가 일상에서 경험하는 것과는 완전히 다른 놀라운 특성들을 가지고 있어요. 이런 특성들 때문에 과학자들이 양자 얽힘에 열광하고 있답니다!</p>
              
              <p>🌟 <strong>양자 얽힘의 놀라운 특성들:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li><strong>🚀 순간 이동 같은 연결</strong>: 얽힌 입자들은 지구와 달만큼 멀리 떨어져 있어도 즉시 소통해요! 한 입자를 측정하면 다른 입자도 그 순간 바로 반응합니다. 마치 텔레파시 같죠?</li>
                <li><strong>🔗 떼려야 뗄 수 없는 관계</strong>: 얽힌 입자들은 각각 따로 설명할 수 없어요. 둘이 합쳐져야 비로소 하나의 완전한 시스템이 됩니다. 마치 쌍둥이 같은 느낌이에요!</li>
                <li><strong>🎯 관찰하면 결정되는 상태</strong>: 얽힌 입자 중 하나를 관찰하는 순간, 다른 입자의 상태도 즉시 결정돼요. 마치 한쪽 동전을 뒤집으면 다른 쪽 동전의 면도 바로 정해지는 것처럼요!</li>
                <li><strong>🎲 신비한 상관관계</strong>: 개별 측정 결과는 랜덤하지만, 두 입자 사이에는 일반적인 확률로는 설명할 수 없는 강한 연결이 있어요. 이것이 바로 양자역학의 마법이죠!</li>
              </ul>
              
              <p>이런 신기한 특성들 덕분에 양자 얽힘은 <strong>양자 컴퓨터</strong> 🖥️, <strong>절대 해킹이 불가능한 통신</strong> 🔒, <strong>순간이동 통신</strong> 📡 같은 미래 기술의 핵심이 되고 있어요!</p>
            </div></section>
            {/* 섹션 3 */}          <section className={`content-section ${activeSection === 2 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[2] = el; }}>            <h2>특별한 얽힘 상태들</h2>
            <div className="section-content">
              <p>양자 얽힘의 세계에는 <strong>벨 상태</strong>라고 불리는 4가지 특별한 상태가 있어요! 이들은 물리학자 존 벨의 이름을 딴 것으로, 가장 완벽하게 얽힌 상태들이랍니다.</p>
              
              <p>✨ <strong>4가지 마법같은 벨 상태들:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li><strong>🟢 첫 번째 벨 상태 (Φ⁺)</strong>: 두 입자가 "둘 다 0이거나 둘 다 1"인 상태로 얽혀있어요</li>
                <li><strong>🔴 두 번째 벨 상태 (Φ⁻)</strong>: 마치 쌍둥이처럼 같은 상태를 가지지만 약간 다른 특성을 가져요</li>
                <li><strong>🔵 세 번째 벨 상태 (Ψ⁺)</strong>: "하나는 0, 하나는 1"로 서로 다른 상태로 얽혀있어요</li>
                <li><strong>🟡 네 번째 벨 상태 (Ψ⁻)</strong>: 가장 특별한 상태로, 항상 정반대 결과를 보여줘요!</li>
              </ul>
              
              <p>🎯 <strong>벨 상태 만들기 레시피:</strong></p>
              <ol style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li>🎲 두 개의 큐비트를 준비해요 (둘 다 0 상태로 시작)</li>
                <li>⚡ 첫 번째 큐비트에 '하다마드 게이트'라는 특별한 조작을 해요</li>
                <li>🔗 'CNOT 게이트'로 두 큐비트를 연결해서 얽힘을 만들어요</li>
                <li>🌟 짜잔! 이제 완벽한 벨 상태가 완성됐어요!</li>
              </ol>
              
              <p>이 벨 상태들은 <strong>양자 텔레포테이션</strong> 📡, <strong>초보안 통신</strong> 🔐, <strong>양자 컴퓨팅</strong> 💻 같은 미래 기술의 핵심 재료가 되고 있어요. 마치 레고 블록처럼 이 기본 상태들을 조합해서 더 복잡하고 강력한 양자 시스템을 만들 수 있답니다!</p>
            </div></section>
            {/* 섹션 4 */}          <section className={`content-section ${activeSection === 3 ? 'active-section' : ''}`} ref={el => { sectionRefs.current[3] = el; }}>            <h2>얽힘 증명하기</h2>
            <div className="section-content">
              <p>양자 얽힘이 정말로 존재하는지 어떻게 증명할 수 있을까요? 1964년 존 벨이라는 똑똑한 물리학자가 이를 증명할 수 있는 멋진 방법을 생각해냈어요!</p>
              
              <p>🔬 <strong>벨의 똑똑한 실험 아이디어:</strong></p>
              <ul style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li><strong>🎯 일반적인 예상</strong>: 만약 입자들이 미리 정해진 성질을 가지고 있다면, 실험 결과는 특정 한계를 넘을 수 없어요</li>
                <li><strong>⚡ 양자의 예측</strong>: 하지만 양자 얽힘이 진짜라면, 이 한계를 깰 수 있어요!</li>
                <li><strong>📊 실제 결과</strong>: 실험해보니 정말로 한계가 깨졌어요! 양자 얽힘이 진짜였답니다!</li>
              </ul>
              
              <p>🏆 <strong>역사적인 실험들:</strong></p>
              <ol style={{ textAlign: 'left', marginLeft: '2rem', marginBottom: '1rem' }}>
                <li><strong>1972년</strong> 🥇: 최초로 양자 얽힘을 실험으로 증명!</li>
                <li><strong>1982년</strong> 🎖️: 더 정확한 실험으로 확실히 증명!</li>
                <li><strong>2015년</strong> 🏅: 완벽한 실험으로 모든 의혹을 해결!</li>
                <li><strong>2018년</strong> 🌍: 전 세계 사람들이 참여한 대규모 실험!</li>
              </ol>
              
              <p>이 실험들은 모두 같은 결과를 보여줬어요: <strong>양자 얽힘은 진짜이고, 우리가 생각하는 것보다 자연은 훨씬 더 신기하다는 것!</strong></p>
              
              <p>🚀 <strong>이 발견의 의미:</strong> 벨 실험의 성공은 단순히 과학적 호기심을 만족시키는 것을 넘어서, <strong>해킹 불가능한 통신</strong> 🔐과 <strong>진짜 랜덤 숫자 생성기</strong> 🎲 같은 실용적인 기술의 기반이 되고 있어요!</p>
            </div>
          </section>
        </div>
          {/* 오른쪽 그래픽 섹션 */}
        <div className="graphics-section">
          <div className="graphics-container">            <h2 className="graphics-title">{sectionGraphics[activeSection].title}</h2>            <div className="graphics-content animated">
              {/* 섹션별 2D 인터랙티브 컴포넌트 렌더링 */}
              {activeSection === 0 && <EntanglementDemo />}
              {activeSection === 1 && <PropertiesDemo />}
              {activeSection === 2 && <BellStatesDemo />}
              {activeSection === 3 && <BellTestDemo />}
              
              {/* 폴백 이미지 및 수식 (3D 컴포넌트 아래에 표시) */}
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
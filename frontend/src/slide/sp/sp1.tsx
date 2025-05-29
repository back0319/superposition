import React, { useState, useEffect } from "react";
import SlideMenu from "../slide";
import "../../component/slide.scss";
import axios from "axios";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Sp1 = () => {
  // 현재 선택된 메뉴와 세부 항목 인덱스 상태
  const [currentMenu, setCurrentMenu] = useState("중첩");
  const [currentDetailIdx, setCurrentDetailIdx] = useState(0);
  const [animateFormulas, setAnimateFormulas] = useState(false);

  // 컴포넌트 마운트 시 수학 공식 애니메이션 활성화
  useEffect(() => {
    // 약간의 지연 후 수학 공식 애니메이션 활성화
    const timer = setTimeout(() => {
      setAnimateFormulas(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // 메뉴 변경 핸들러
  const handleMenuChange = (title: string, detailIdx: number) => {
    setCurrentMenu(title);
    setCurrentDetailIdx(detailIdx);
    // 메뉴 변경 시 수학 공식 애니메이션 리셋 후 다시 활성화
    setAnimateFormulas(false);
    setTimeout(() => setAnimateFormulas(true), 300);
  };
  return (
    <div className="slide-container">
      {/* 왼쪽 슬라이드 메뉴 */}
      <SlideMenu 
        current={currentMenu}
        detailIdx={currentDetailIdx}
        onChange={handleMenuChange}
      />
      
      {/* 메인 콘텐츠 영역 */}
      <div className="slide-content">
        <h1>중첩 원리 <span className="subtitle">(Superposition)</span></h1>
        <div className="slide-header-line"></div>
        
        <section className="slide-section">
          <h2>중첩 원리란?</h2>
          <p>
            양자역학에서 중첩 원리는 양자 시스템이 여러 상태를 동시에 가질 수 있음을 의미합니다.
            고전적인 비트가 0 또는 1만 될 수 있는 반면, 큐비트는 0과 1의 중첩 상태가 될 수 있습니다.
          </p>            <div className={`formula-box ${animateFormulas ? 'animate-in' : ''}`}>
              <BlockMath math={"|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle"} />
              <p className="formula-description">
                여기서 <InlineMath math={"\\alpha"} />와 <InlineMath math={"\\beta"} />는 각 상태의 확률 진폭으로, <InlineMath math={"|\\alpha|^2 + |\\beta|^2 = 1"} />의 조건을 만족합니다.
              </p>
            </div>
        </section>        <section className="slide-section">
          <h2>중첩의 특징</h2>
          <div className="content-with-image">
            <div className="content-list">
              <ul>
                <li>관측하기 전까지는 확률적 상태로 존재</li>
                <li>관측 시 확률에 따라 특정 상태로 붕괴</li>
                <li>양자 컴퓨팅의 병렬 계산 능력의 기반</li>
                <li>슈뢰딩거의 고양이 사고실험으로 설명 가능</li>
              </ul>
            </div>
            <div className="bloch-sphere-container">
              <img 
                src="/images/bloch-sphere.png" 
                alt="블로흐 구(Bloch Sphere)" 
                className="bloch-sphere-image"
                onError={(e) => {
                  e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bloch_sphere.svg";
                  e.currentTarget.style.maxWidth = "240px";
                }}
              />
              <p className="image-caption">블로흐 구에서의 큐비트 상태 표현</p>
            </div>
          </div>
        </section>
        
        <section className="slide-section">
          <h2>하드라마드 게이트</h2>
          <p>            하드라마드 게이트(H)는 큐비트를 중첩 상태로 만드는 기본적인 양자 게이트입니다.
            <InlineMath math={"|0\\rangle"} /> 상태의 큐비트에 하드라마드 게이트를 적용하면, <InlineMath math={"\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}"} />의 중첩 상태가 됩니다.
          </p>            <div className={`formula-box ${animateFormulas ? 'animate-in' : ''}`}>
              <BlockMath math={"H = \\frac{1}{\\sqrt{2}} \\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}"} />
              <p className="formula-description">
                하드라마드 행렬은 큐비트에 적용될 때 중첩 상태를 생성합니다:
                <br />
                <InlineMath math={"H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}"} /> 및 
                <InlineMath math={"H|1\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}"} />
              </p>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Sp1;
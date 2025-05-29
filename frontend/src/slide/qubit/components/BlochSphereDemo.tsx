import React, { useState } from 'react';
import './QubitDemo.scss';

export default function BlochSphereDemo() {
  const [theta, setTheta] = useState(0); // 세타 값 (0-π)
  const [phi, setPhi] = useState(0);     // 파이 값 (0-2π)
  
  // 블로흐 구 좌표 변환 (구면 좌표계 -> 데카르트 좌표계)
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
    // 상태 벡터 계산
  const alpha = Math.cos(theta / 2);
  // 복소수 계산을 간소화: 실수 부분만 표시
  const betaReal = Math.cos(phi) * Math.sin(theta / 2);
  const betaImag = Math.sin(phi) * Math.sin(theta / 2);
  
  // 블로흐 벡터 포인트 위치 계산 (2D 화면에 매핑)
  // 원근감을 위한 간단한 변환 적용
  const centerX = 150; // 구의 중심 X 좌표
  const centerY = 150; // 구의 중심 Y 좌표
  const radius = 120;  // 구의 반지름
  
  // 3D -> 2D 투영 (매우 간단한 투영)
  const pointX = centerX + x * radius;
  const pointY = centerY - z * radius; // z축은 화면에서 위/아래 방향
  const pointSize = 10 + (y + 1) * 5;  // y축은 화면에서 앞/뒤에 해당, 크기로 표현
  
  return (
    <div className="bloch-sphere-demo">
      <div className="bloch-controls">
        <div className="control-group">
          <label htmlFor="theta-slider">θ (세타): {(theta / Math.PI).toFixed(2)}π</label>
          <input
            id="theta-slider"
            type="range"
            min="0"
            max={Math.PI}
            step="0.01"
            value={theta}
            onChange={(e) => setTheta(parseFloat(e.target.value))}
            className="angle-slider"
          />
        </div>
        
        <div className="control-group">
          <label htmlFor="phi-slider">φ (파이): {(phi / Math.PI).toFixed(2)}π</label>
          <input
            id="phi-slider"
            type="range"
            min="0"
            max={2 * Math.PI}
            step="0.01"
            value={phi}
            onChange={(e) => setPhi(parseFloat(e.target.value))}
            className="angle-slider"
          />
        </div>
      </div>
      
      <div className="bloch-visualization">
        <div className="bloch-sphere">
          {/* 구의 윤곽선 (원) */}
          <div className="sphere-outline"></div>
          
          {/* 축 */}
          <div className="axis x-axis"></div>
          <div className="axis y-axis"></div>
          <div className="axis z-axis"></div>
          
          {/* 축 레이블 */}
          <div className="axis-label x-label">x</div>
          <div className="axis-label y-label">y</div>
          <div className="axis-label z-label">z</div>
          
          {/* 상태 레이블 */}
          <div className="state-label zero-label">|0⟩</div>
          <div className="state-label one-label">|1⟩</div>
          <div className="state-label plus-label">|+⟩</div>
          <div className="state-label minus-label">|-⟩</div>
          
          {/* 블로흐 벡터 */}
          <div className="bloch-vector"
            style={{
              width: `${Math.sqrt(x*x + z*z) * radius}px`, 
              transform: `translate(${centerX}px, ${centerY}px) rotate(${Math.atan2(-z, x) * (180/Math.PI)}deg)`,
              opacity: pointSize / 20, // y값에 따라 투명도 조절
            }}
          ></div>
          
          {/* 현재 포인트 */}
          <div className="bloch-point"
            style={{
              width: `${pointSize}px`,
              height: `${pointSize}px`,
              left: `${pointX - pointSize/2}px`,
              top: `${pointY - pointSize/2}px`,
              opacity: (y + 1) / 2 + 0.2, // y값에 따라 투명도 조절
            }}
          ></div>
        </div>
      </div>
      
      <div className="state-info">      <div className="state-vector">
          |ψ⟩ = {alpha.toFixed(2)}|0⟩ + ({betaReal.toFixed(2)} {betaImag >= 0 ? '+' : ''} {betaImag.toFixed(2)}i)|1⟩
        </div>
        <div className="coordinates">
          블로흐 좌표: (x={x.toFixed(2)}, y={y.toFixed(2)}, z={z.toFixed(2)})
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import '../superposition.scss';

const SuperpositionIntroDemo = () => {
  const [alphaValue, setAlphaValue] = useState(1);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // 슬라이더 값에 따라 α와 β 계산
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAlphaValue(value);
  };
  
  // 블로흐 구 좌표 계산
  const theta = Math.acos(alphaValue) * 2; // 세타 값 (0 에서 π)
  const phi = 0; // 이 데모에서는 φ를 0으로 고정 (실수 축에서만 이동)
  
  // 데카르트 좌표계로 변환
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  
  // 확률 계산
  const probZero = alphaValue * alphaValue;
  const probOne = 1 - probZero;
  const beta = Math.sqrt(probOne); // β는 실수로 단순화
  
  // 블로흐 구 상의 점 위치 계산
  const centerX = 140;
  const centerY = 140;
  const radius = 120;
  
  const pointX = centerX + x * radius;
  const pointY = centerY - z * radius; // z축은 화면에서 위/아래 방향
  
  // 벡터 길이 및 방향 계산
  const vectorLength = Math.sqrt(x*x + z*z) * radius;
  const vectorAngle = Math.atan2(-z, x) * (180 / Math.PI); // 각도를 도(degree)로 변환
  
  // 애니메이션 토글
  const toggleAnimation = () => {
    setShowAnimation(!showAnimation);
  };
  
  return (
    <div className="superposition-demo">
      <div className="bloch-sphere">
        <div className="sphere-outline"></div>
        <div className="axis x-axis"></div>
        <div className="axis y-axis"></div>
        
        <div className="state-label zero">|0⟩</div>
        <div className="state-label one">|1⟩</div>
        <div className="state-label plus">|+⟩</div>
        <div className="state-label minus">|-⟩</div>
        
        {/* 상태 벡터 */}
        <div 
          className="state-vector"
          style={{
            width: `${vectorLength}px`,
            left: `${centerX}px`,
            top: `${centerY}px`,
            transform: `rotate(${vectorAngle}deg)`
          }}
        ></div>
        
        {/* 상태 점 */}
        <div 
          className="state-point"
          style={{
            left: `${pointX}px`,
            top: `${pointY}px`
          }}
        ></div>
      </div>
      
      <div className="controls">
        <div className="slider-container">
          <label>
            α 값 조절: {alphaValue.toFixed(2)}
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={alphaValue}
              onChange={handleSliderChange}
            />
          </label>
        </div>
        
        <div className="state-info">
          <div className="state-formula">
            |ψ⟩ = {alphaValue.toFixed(2)}|0⟩ + {beta.toFixed(2)}|1⟩
          </div>
          <div className="state-probabilities">
            P(|0⟩) = {(probZero * 100).toFixed(0)}%, 
            P(|1⟩) = {(probOne * 100).toFixed(0)}%
          </div>
        </div>
        
        <button 
          onClick={toggleAnimation} 
          style={{
            width: '100%',
            padding: '0.5rem',
            marginTop: '1rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showAnimation ? '애니메이션 중지' : '중첩 애니메이션 보기'}
        </button>
      </div>
      
      {showAnimation && (
        <div 
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            animation: 'pulse 3s infinite',
          }}
        >
          <p style={{ marginBottom: '0.5rem' }}>큐비트가 두 상태를 동시에 가지는 중첩 상태입니다</p>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: '2rem'
            }}
          >
            <div 
              style={{ 
                animation: 'fadeInOut 2s infinite',
                padding: '1rem',
                border: '1px solid #3498db',
                borderRadius: '8px',
                backgroundColor: 'rgba(52, 152, 219, 0.2)'
              }}
            >
              |0⟩ 상태
            </div>
            <div 
              style={{ 
                animation: 'fadeInOut 2s infinite 1s',
                padding: '1rem',
                border: '1px solid #e74c3c',
                borderRadius: '8px',
                backgroundColor: 'rgba(231, 76, 60, 0.2)'
              }}
            >
              |1⟩ 상태
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperpositionIntroDemo;

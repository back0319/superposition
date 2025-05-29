import React, { useState } from 'react';
import './QubitDemo.scss';

export default function QubitDefinitionDemo() {
  const [stateAlpha, setStateAlpha] = useState(1);
  const [stateBeta, setStateBeta] = useState(0);
  const [showProbabilities, setShowProbabilities] = useState(false);
  
  // 확률 계산 (|α|² 및 |β|²)
  const probZero = stateAlpha * stateAlpha;
  const probOne = stateBeta * stateBeta;
  
  // 슬라이더 변경 처리
  const handleSliderChange = (value: number) => {
    // 0과 1 사이의 값을 기준으로 α와 β 계산
    // |α|² + |β|² = 1을 만족하도록 정규화
    const newAlpha = Math.cos(value * Math.PI / 2);
    const newBeta = Math.sin(value * Math.PI / 2);
    
    setStateAlpha(newAlpha);
    setStateBeta(newBeta);
  };
  
  return (
    <div className="qubit-definition-demo">
      <div className="qubit-state-display">
        <div className="state-vector">
          <div className="state-label">|ψ⟩ = </div>
          <div className="vector-values">
            <div className="vector-value">{stateAlpha.toFixed(2)}|0⟩ + {stateBeta.toFixed(2)}|1⟩</div>
          </div>
        </div>
        
        {showProbabilities && (
          <div className="probability-display">
            <div className="probability-item">
              <div className="probability-label">|0⟩ 측정 확률:</div>
              <div className="probability-value">{(probZero * 100).toFixed(1)}%</div>
            </div>
            <div className="probability-item">
              <div className="probability-label">|1⟩ 측정 확률:</div>
              <div className="probability-value">{(probOne * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="qubit-controls">
        <div className="slider-container">
          <div className="slider-label">|0⟩</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={Math.asin(stateBeta) / (Math.PI / 2)}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            className="qubit-slider"
          />
          <div className="slider-label">|1⟩</div>
        </div>
        
        <button 
          className="toggle-button"
          onClick={() => setShowProbabilities(!showProbabilities)}
        >
          {showProbabilities ? '확률 숨기기' : '확률 보기'}
        </button>
      </div>
    </div>
  );
}

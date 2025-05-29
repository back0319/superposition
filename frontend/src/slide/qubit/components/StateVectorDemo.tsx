import React, { useState } from 'react';
import './QubitDemo.scss';

export default function StateVectorDemo() {
  const [selectedState, setSelectedState] = useState('0');
  
  // 4가지 기본 상태에 대한 설명 및 벡터 표현
  const stateInfo = {
    '0': {
      name: '|0⟩ 상태',
      vector: [1, 0],
      description: '0 상태는 큐비트가 100% 확률로 0으로 측정됩니다.'
    },
    '1': {
      name: '|1⟩ 상태',
      vector: [0, 1],
      description: '1 상태는 큐비트가 100% 확률로 1로 측정됩니다.'
    },
    '+': {
      name: '|+⟩ 상태',
      vector: [1/Math.sqrt(2), 1/Math.sqrt(2)],
      description: '+ 상태는 큐비트가 50% 확률로 0, 50% 확률로 1로 측정됩니다.'
    },
    '-': {
      name: '|-⟩ 상태',
      vector: [1/Math.sqrt(2), -1/Math.sqrt(2)],
      description: '- 상태는 큐비트가 50% 확률로 0, 50% 확률로 1로 측정됩니다.'
    }
  };
  
  // 선택된 상태 정보
  const currentState = stateInfo[selectedState as keyof typeof stateInfo];
  
  return (
    <div className="state-vector-demo">
      <div className="state-selector">
        <div className="selector-label">큐비트 상태 선택:</div>
        <div className="state-buttons">
          {Object.keys(stateInfo).map(key => (
            <button
              key={key}
              className={`state-button ${selectedState === key ? 'active' : ''}`}
              onClick={() => setSelectedState(key)}
            >
              |{key}⟩
            </button>
          ))}
        </div>
      </div>
      
      <div className="state-display">
        <h3>{currentState.name}</h3>
        
        <div className="vector-display">
          <div className="vector-label">상태 벡터:</div>
          <div className="vector-bracket">[</div>
          <div className="vector-values">
            <div className="vector-value">{currentState.vector[0].toFixed(2)}</div>
            <div className="vector-value">{currentState.vector[1].toFixed(2)}</div>
          </div>
          <div className="vector-bracket">]</div>
        </div>
        
        <div className="state-visualization">
          <div className="visualization-container">
            <div className="basis-state basis-0">|0⟩</div>
            <div className="basis-state basis-1">|1⟩</div>
            
            <div
              className="state-indicator"
              style={{
                top: `${(1 - currentState.vector[0] * currentState.vector[0]) * 80}%`,
                left: `${currentState.vector[1] * currentState.vector[1] * 80}%`
              }}
            ></div>
          </div>
        </div>
        
        <div className="state-description">
          {currentState.description}
        </div>
      </div>
    </div>
  );
}

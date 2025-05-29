import React, { useState } from 'react';

export default function BellStatesDemo() {
  const [selectedState, setSelectedState] = useState<0 | 1 | 2 | 3>(0);
  const [showMeasurement, setShowMeasurement] = useState(false);

  const bellStates = [
    { 
      name: "Φ⁺", 
      color: "#4CAF50", 
      description: "둘 다 같은 상태",
      formula: "|00⟩ + |11⟩",
      behavior: "두 큐비트가 항상 같은 값을 가집니다"
    },
    { 
      name: "Φ⁻", 
      color: "#F44336", 
      description: "같지만 다른 특성",
      formula: "|00⟩ - |11⟩",
      behavior: "같은 값이지만 위상이 반대입니다"
    },
    { 
      name: "Ψ⁺", 
      color: "#2196F3", 
      description: "서로 다른 상태",
      formula: "|01⟩ + |10⟩",
      behavior: "항상 다른 값을 가집니다"
    },
    { 
      name: "Ψ⁻", 
      color: "#FF9800", 
      description: "항상 반대!",
      formula: "|01⟩ - |10⟩",
      behavior: "반대 값에 위상까지 반대입니다"
    }
  ];

  const measureBellState = () => {
    setShowMeasurement(true);
    setTimeout(() => setShowMeasurement(false), 3000);
  };

  const currentState = bellStates[selectedState];

  return (
    <div className="bell-states-demo">
      <h3>특별한 얽힘 상태들</h3>
      
      <div className="state-selector">
        {bellStates.map((state, idx) => (
          <button
            key={idx}
            className={`state-btn ${selectedState === idx ? 'active' : ''}`}
            style={{ 
              backgroundColor: selectedState === idx ? state.color : 'transparent',
              borderColor: state.color,
              color: selectedState === idx ? 'white' : state.color
            }}
            onClick={() => setSelectedState(idx as any)}
          >
            {state.name}
          </button>
        ))}
      </div>

      <div className="state-display">
        <div className="state-info">
          <h4 style={{ color: currentState.color }}>
            벨 상태: {currentState.name}
          </h4>
          <p>{currentState.description}</p>
        </div>

        <div className="state-visualization">
          <div className="formula-box" style={{ borderColor: currentState.color }}>
            <div className="formula">
              |{currentState.name}⟩ = {currentState.formula}
            </div>
          </div>

          <div className="qubits-display">
            <div className="qubit-pair">
              <div 
                className={`qubit ${showMeasurement ? 'measuring' : ''}`}
                style={{ backgroundColor: currentState.color }}
              >
                <div className="qubit-label">큐비트 1</div>
                <div className="qubit-state">
                  {showMeasurement ? '🌀' : '❓'}
                </div>
              </div>

              <div className="entanglement-connection">
                <div 
                  className={`connection-line ${showMeasurement ? 'active' : ''}`}
                  style={{ backgroundColor: currentState.color }}
                >
                  ⚡
                </div>
              </div>

              <div 
                className={`qubit ${showMeasurement ? 'measuring' : ''}`}
                style={{ backgroundColor: currentState.color }}
              >
                <div className="qubit-label">큐비트 2</div>
                <div className="qubit-state">
                  {showMeasurement ? '🌀' : '❓'}
                </div>
              </div>
            </div>
          </div>

          <div className="behavior-explanation">
            <strong>특성:</strong> {currentState.behavior}
          </div>

          {showMeasurement && (
            <div className="measurement-result">
              <div className="result-text" style={{ color: currentState.color }}>
                측정 완료: {currentState.description}
              </div>
            </div>
          )}
        </div>

        <div className="controls">
          <button 
            onClick={measureBellState} 
            className="measure-btn"
            style={{ backgroundColor: currentState.color }}
          >
            상태 측정하기
          </button>
        </div>
      </div>
    </div>
  );
}

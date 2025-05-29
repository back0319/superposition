import React, { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

export default function BellStates3DDemo() {
  const [selectedState, setSelectedState] = useState<0 | 1 | 2 | 3>(0);
  const [showMeasurement, setShowMeasurement] = useState(false);

  const bellStates = [
    { 
      name: "Φ⁺", 
      color: "#4CAF50", 
      description: "둘 다 같은 상태",
      theta1: 0, phi1: 0,
      theta2: 0, phi2: 0
    },
    { 
      name: "Φ⁻", 
      color: "#F44336", 
      description: "같지만 다른 특성",
      theta1: Math.PI, phi1: 0,
      theta2: Math.PI, phi2: 0
    },
    { 
      name: "Ψ⁺", 
      color: "#2196F3", 
      description: "서로 다른 상태",
      theta1: Math.PI/2, phi1: 0,
      theta2: Math.PI/2, phi2: Math.PI
    },
    { 
      name: "Ψ⁻", 
      color: "#FF9800", 
      description: "항상 반대!",
      theta1: Math.PI/2, phi1: 0,
      theta2: Math.PI/2, phi2: 0
    }
  ];

  const measureBellState = () => {
    setShowMeasurement(true);
    setTimeout(() => setShowMeasurement(false), 3000);
  };

  const currentState = bellStates[selectedState];
  const { scale, opacity } = useSpring({
    scale: showMeasurement ? 1.2 : 1,
    opacity: showMeasurement ? 1 : 0.6,
    config: { tension: 150, friction: 20 }
  });

  return (
    <div className="bell-states-3d-demo">
      <div className="visualization-container">
        <h3>벨 상태: {currentState.name}</h3>
        <p style={{ color: currentState.color }}>{currentState.description}</p>
        
        <div className="qubits-container">
          {/* Qubit 1 */}          <animated.div 
            className="qubit-sphere"
            style={{ 
              backgroundColor: currentState.color,
              transform: scale.to((s: number) => `scale(${s})`),
              opacity
            }}
          >
            <div className="qubit-label">큐비트 1</div>
            <div className="qubit-state">
              θ: {(currentState.theta1 * 180 / Math.PI).toFixed(0)}°
            </div>
          </animated.div>

          {/* Connection line */}
          <animated.div 
            className="entanglement-line"
            style={{ 
              backgroundColor: currentState.color,
              opacity: opacity.to((o: number) => o * 0.6)
            }}
          >
            {[...Array(5)].map((_, i) => (
              <animated.div
                key={i}
                className="connection-particle"
                style={{
                  backgroundColor: currentState.color,
                  transform: scale.to((s: number) => `scale(${s})`),
                  left: `${20 + i * 15}%`
                }}
              />
            ))}
          </animated.div>

          {/* Qubit 2 */}
          <animated.div 
            className="qubit-sphere"
            style={{ 
              backgroundColor: currentState.color,
              transform: scale.to((s: number) => `scale(${s})`),
              opacity
            }}
          >
            <div className="qubit-label">큐비트 2</div>
            <div className="qubit-state">
              θ: {(currentState.theta2 * 180 / Math.PI).toFixed(0)}°
            </div>
          </animated.div>
        </div>

        <div className="state-formula">
          |{currentState.name}⟩
        </div>

        {showMeasurement && (
          <div className="measurement-result">
            측정 완료: {currentState.description}
          </div>
        )}
      </div>      <div className="controls-3d">
        <div className="state-selector-3d">
          {bellStates.map((state, idx) => (
            <button
              key={idx}
              className={`state-btn-3d ${selectedState === idx ? 'active' : ''}`}
              style={{ borderColor: state.color, color: state.color }}
              onClick={() => setSelectedState(idx as 0 | 1 | 2 | 3)}
            >
              {state.name}
            </button>
          ))}
        </div>
        
        <button onClick={measureBellState} className="measure-btn-3d">
          상태 측정하기
        </button>
      </div>
    </div>
  );
}

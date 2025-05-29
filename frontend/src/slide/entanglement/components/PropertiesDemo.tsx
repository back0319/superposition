import React, { useState } from 'react';

export default function PropertiesDemo() {
  const [selectedProperty, setSelectedProperty] = useState<'nonlocal' | 'inseparable' | 'collapse' | 'correlation'>('nonlocal');
  const [demoActive, setDemoActive] = useState(false);

  const propertyInfo = {
    nonlocal: {
      title: "비국소성 (Non-locality)",
      description: "얽힌 입자들은 거리와 상관없이 즉시 연결되어 있습니다.",
      example: "한 입자를 지구에서 측정하면, 달에 있는 다른 입자도 즉시 영향을 받습니다!"
    },
    inseparable: {
      title: "분리불가능성",
      description: "얽힌 입자들은 각각 따로 설명할 수 없는 하나의 시스템입니다.",
      example: "두 입자가 완전히 하나로 묶여있어서 개별적으로는 설명이 불가능합니다."
    },
    collapse: {
      title: "파동함수 붕괴",
      description: "한 입자를 관찰하면 다른 입자의 상태도 즉시 결정됩니다.",
      example: "관찰하는 순간 모든 가능성이 하나의 현실로 확정됩니다!"
    },
    correlation: {
      title: "양자 상관관계",
      description: "개별 결과는 랜덤하지만 두 입자 사이에는 완벽한 상관관계가 있습니다.",
      example: "동전 던지기처럼 랜덤하지만, 두 입자는 항상 연결되어 있습니다."
    }
  };

  const runDemo = () => {
    setDemoActive(true);
    setTimeout(() => setDemoActive(false), 3000);
  };

  const currentProperty = propertyInfo[selectedProperty];

  return (
    <div className="properties-demo">
      <h3>얽힘의 신기한 특성들</h3>
      
      <div className="property-selector">
        {Object.entries(propertyInfo).map(([key, property]) => (
          <button
            key={key}
            className={`property-btn ${selectedProperty === key ? 'active' : ''}`}
            onClick={() => setSelectedProperty(key as any)}
          >
            {property.title}
          </button>
        ))}
      </div>

      <div className="property-display">
        <div className="property-info">
          <h4>{currentProperty.title}</h4>
          <p>{currentProperty.description}</p>
        </div>

        <div className="property-visualization">
          <div className={`demo-box ${selectedProperty} ${demoActive ? 'active' : ''}`}>
            {selectedProperty === 'nonlocal' && (
              <div className="nonlocal-demo">
                <div className="particle left">🔴</div>
                <div className="distance-line">
                  {demoActive ? '🌍 ⚡ 🌙' : '🌍 ——— 🌙'}
                </div>
                <div className="particle right">🔵</div>
              </div>
            )}
            
            {selectedProperty === 'inseparable' && (
              <div className="inseparable-demo">
                <div className={`merged-particles ${demoActive ? 'pulse' : ''}`}>
                  🔴🔵
                </div>
                <div>하나의 시스템</div>
              </div>
            )}
            
            {selectedProperty === 'collapse' && (
              <div className="collapse-demo">
                <div className="before">
                  {demoActive ? '❓' : '🌀 + 🌀'}
                </div>
                <div className="arrow">→</div>
                <div className="after">
                  {demoActive ? '🔴 + 🔵' : '? + ?'}
                </div>
              </div>
            )}
            
            {selectedProperty === 'correlation' && (
              <div className="correlation-demo">
                <div className="correlation-pattern">
                  {demoActive ? (
                    <>
                      <div>🔴 ↔ 🔵</div>
                      <div>100% 상관관계</div>
                    </>
                  ) : (
                    <>
                      <div>? ↔ ?</div>
                      <div>신비한 연결</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="property-example">
          <strong>예시:</strong> {currentProperty.example}
        </div>

        <div className="controls">
          <button onClick={runDemo} className="demo-btn">
            {demoActive ? '데모 실행 중...' : '데모 실행'}
          </button>
        </div>
      </div>
    </div>
  );
}

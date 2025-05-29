import React, { useState } from 'react';

export default function EntanglementDemo() {
  const [particleA, setParticleA] = useState<'up' | 'down' | null>(null);
  const [particleB, setParticleB] = useState<'up' | 'down' | null>(null);
  const [measuring, setMeasuring] = useState(false);

  const measureParticle = (particle: 'A' | 'B') => {
    if (measuring) return;
    
    setMeasuring(true);
    
    // 측정 애니메이션
    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'up' : 'down';
      
      if (particle === 'A') {
        setParticleA(result);
        // 얽힌 입자는 반대 상태로 즉시 결정
        setTimeout(() => setParticleB(result === 'up' ? 'down' : 'up'), 300);
      } else {
        setParticleB(result);
        // 얽힌 입자는 반대 상태로 즉시 결정
        setTimeout(() => setParticleA(result === 'up' ? 'down' : 'up'), 300);
      }
      
      setMeasuring(false);
    }, 500);
  };

  const reset = () => {
    setParticleA(null);
    setParticleB(null);
  };

  return (
    <div className="entanglement-demo">
      <h3>양자 얽힘 시뮬레이션</h3>
      
      <div className="particles-container">
        {/* Particle A */}
        <div 
          className={`particle ${particleA || 'unknown'} ${measuring ? 'measuring' : ''}`}
          onClick={() => measureParticle('A')}
        >
          <div className="particle-icon">
            {measuring ? '🌀' : particleA === 'up' ? '↑' : particleA === 'down' ? '↓' : '?'}
          </div>
          <div className="particle-label">입자 A</div>
          <div className="particle-state">
            {particleA === 'up' ? 'UP' : particleA === 'down' ? 'DOWN' : '미정'}
          </div>
        </div>

        {/* Connection */}
        <div className="connection-line">
          <div className={`entanglement-wave ${particleA && particleB ? 'active' : ''}`}>
            ⚡ 얽힘 연결 ⚡
          </div>
        </div>

        {/* Particle B */}
        <div 
          className={`particle ${particleB || 'unknown'} ${measuring ? 'measuring' : ''}`}
          onClick={() => measureParticle('B')}
        >
          <div className="particle-icon">
            {measuring ? '🌀' : particleB === 'up' ? '↑' : particleB === 'down' ? '↓' : '?'}
          </div>
          <div className="particle-label">입자 B</div>
          <div className="particle-state">
            {particleB === 'up' ? 'UP' : particleB === 'down' ? 'DOWN' : '미정'}
          </div>
        </div>
      </div>

      {/* Result display */}
      {particleA && particleB && (
        <div className="result-display">
          <div className="result-text">
            결과: 입자 A({particleA === 'up' ? '↑' : '↓'}) + 입자 B({particleB === 'up' ? '↑' : '↓'})
          </div>
          <div className="explanation">
            → 항상 반대 상태로 측정됩니다!
          </div>
        </div>
      )}

      <div className="controls">
        <button onClick={reset} className="reset-btn">
          다시 시작
        </button>
        <div className="instruction">
          입자를 클릭해서 측정해보세요!
        </div>
      </div>
    </div>
  );
}

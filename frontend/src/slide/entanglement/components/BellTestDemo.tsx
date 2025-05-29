import React, { useState } from 'react';

export default function BellTestDemo() {
  const [testRunning, setTestRunning] = useState(false);
  const [classicalResult, setClassicalResult] = useState<number | null>(null);
  const [quantumResult, setQuantumResult] = useState<number | null>(null);
  const [testCount, setTestCount] = useState(0);

  const runBellTest = () => {
    if (testRunning) return;
    
    setTestRunning(true);
    setTestCount(prev => prev + 1);
    
    // 고전 물리학 예측 (최대 2.0)
    const classical = 1.5 + Math.random() * 0.5;
    
    // 양자역학 예측 (2.0 초과 가능)
    const quantum = 2.1 + Math.random() * 0.7;
    
    setTimeout(() => {
      setClassicalResult(classical);
      setQuantumResult(quantum);
      setTestRunning(false);
    }, 2000);
  };

  const reset = () => {
    setClassicalResult(null);
    setQuantumResult(null);    setTestCount(0);
  };

  return (
    <div className="bell-test-demo">
      <div className="visualization-container">
        <h3>🔬 벨 부등식 실험</h3>
        <p>양자 얽힘을 증명하는 실험!</p>
        
        <div className="experiment-setup">
          <div className="theory-comparison">
            <div className="theory-box classical">
              <h4>🏛️ 고전 물리학</h4>
              <p>예측: ≤ 2.0</p>              {classicalResult && (
                <div 
                  className="result-value"
                >
                  {classicalResult.toFixed(2)}
                </div>
              )}
            </div>

            <div className="vs-indicator">VS</div>

            <div className="theory-box quantum">
              <h4>⚛️ 양자역학</h4>
              <p>예측: &gt; 2.0</p>              {quantumResult && (
                <div 
                  className="result-value"
                >
                  {quantumResult.toFixed(2)}
                </div>
              )}
            </div>
          </div>          <div 
            className={`experiment-apparatus ${testRunning ? 'running' : ''}`}
          >
            <div className="detector detector-a">
              <div className="detector-icon">📡</div>
              <div className="detector-label">검출기 A</div>
            </div>

            <div className="particle-source">
              <div className={`source-icon ${testRunning ? 'active' : ''}`}>⚛️</div>
              <div className="entangled-particles">
                {testRunning && (
                  <>
                    <div className="particle particle-left"></div>
                    <div className="particle particle-right"></div>
                  </>
                )}
              </div>
            </div>            <div className="detector detector-b">
              <div className="detector-icon">📡</div>
              <div className="detector-label">검출기 B</div>
            </div>
          </div>          {testRunning && (
            <div 
              className="progress-bar active"
            >
              <div className="progress-text">실험 진행 중...</div>
            </div>
          )}          {(classicalResult !== null && quantumResult !== null) && (
            <div 
              className="experiment-result visible"
            >
              <h4>🎯 실험 결과</h4>
              <div className="result-comparison">
                <div className="result-item">
                  <span>고전 물리학:</span>
                  <span className="value classical">{classicalResult.toFixed(2)}</span>
                </div>
                <div className="result-item">
                  <span>양자역학:</span>
                  <span className="value quantum">{quantumResult.toFixed(2)}</span>
                </div>
              </div>
              <div className="conclusion">
                {quantumResult > 2.0 ? (
                  <span className="winner">✅ 양자 얽힘 증명!</span>
                ) : (
                  <span className="inconclusive">🤔 재실험 필요</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="controls">
        <button 
          onClick={runBellTest} 
          className={`test-btn ${testRunning ? 'running' : ''}`}
          disabled={testRunning}
        >
          {testRunning ? '실험 중...' : `실험 ${testCount + 1}차 시작`}
        </button>
        
        {testCount > 0 && (
          <button onClick={reset} className="reset-btn">
            초기화
          </button>
        )}
      </div>
    </div>
  );
}

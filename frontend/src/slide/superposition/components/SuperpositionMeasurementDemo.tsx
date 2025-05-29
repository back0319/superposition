import React, { useState } from 'react';
import '../superposition.scss';

const SuperpositionMeasurementDemo = () => {
  const [alphaValue, setAlphaValue] = useState(0.7); // Default value
  const [measured, setMeasured] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<string | null>(null);
  const [measurementHistory, setMeasurementHistory] = useState<Array<{result: string, count: number}>>([
    { result: '|0⟩', count: 0 },
    { result: '|1⟩', count: 0 }
  ]);
  const [totalMeasurements, setTotalMeasurements] = useState(0);

  // Calculate probabilities
  const probZero = alphaValue * alphaValue;
  const probOne = 1 - probZero;
  const beta = Math.sqrt(probOne); // β is real for simplification

  // Bloch sphere coordinates calculation
  const theta = Math.acos(alphaValue) * 2;
  const phi = 0; // Fixed at 0 for this demo (real axis only)
  
  // Convert to Cartesian coordinates
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  
  // Bloch sphere positioning
  const centerX = 140;
  const centerY = 140;
  const radius = 120;
  
  const pointX = centerX + x * radius;
  const pointY = centerY - z * radius;
  
  // Vector calculations
  const vectorLength = Math.sqrt(x*x + z*z) * radius;
  const vectorAngle = Math.atan2(-z, x) * (180 / Math.PI);

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (measured) {
      resetMeasurement();
    }
    setAlphaValue(parseFloat(e.target.value));
  };

  // Perform measurement
  const performMeasurement = () => {
    // Generate a random number between 0 and 1
    const random = Math.random();
    
    // Determine measurement result based on probabilities
    let result;
    if (random < probZero) {
      result = '|0⟩';
      // Update state vector to |0⟩
      setAlphaValue(1);
    } else {
      result = '|1⟩';
      // Update state vector to |1⟩
      setAlphaValue(0);
    }
    
    // Update history
    const newHistory = [...measurementHistory];
    if (result === '|0⟩') {
      newHistory[0].count += 1;
    } else {
      newHistory[1].count += 1;
    }
    
    setMeasurementResult(result);
    setMeasured(true);
    setMeasurementHistory(newHistory);
    setTotalMeasurements(totalMeasurements + 1);
  };

  // Reset measurement
  const resetMeasurement = () => {
    setMeasured(false);
    setMeasurementResult(null);
  };

  // Reset all
  const resetAll = () => {
    resetMeasurement();
    setMeasurementHistory([
      { result: '|0⟩', count: 0 },
      { result: '|1⟩', count: 0 }
    ]);
    setTotalMeasurements(0);
    setAlphaValue(0.7); // Reset to default value
  };

  return (
    <div className="superposition-measurement-demo">
      <div className="bloch-sphere">
        <div className="sphere-outline"></div>
        <div className="axis x-axis"></div>
        <div className="axis y-axis"></div>
        
        <div className="state-label zero">|0⟩</div>
        <div className="state-label one">|1⟩</div>
        
        {/* State vector */}
        <div 
          className={`state-vector ${measured ? 'measured' : ''}`}
          style={{
            width: `${vectorLength}px`,
            left: `${centerX}px`,
            top: `${centerY}px`,
            transform: `rotate(${vectorAngle}deg)`
          }}
        ></div>
        
        {/* State point */}
        <div 
          className={`state-point ${measured ? 'measured' : ''}`}
          style={{
            left: `${pointX}px`,
            top: `${pointY}px`
          }}
        ></div>
      </div>
      
      <div className="controls">
        {!measured ? (
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
            <div className="state-formula">
              |ψ⟩ = {alphaValue.toFixed(2)}|0⟩ + {beta.toFixed(2)}|1⟩
            </div>
            <div className="state-probabilities">
              P(|0⟩) = {(probZero * 100).toFixed(0)}%, 
              P(|1⟩) = {(probOne * 100).toFixed(0)}%
            </div>
          </div>
        ) : (
          <div className="measurement-result">
            <h3>측정 결과:</h3>
            <div className={`result ${measurementResult === '|0⟩' ? 'zero' : 'one'}`}>
              {measurementResult}
            </div>
            <p>상태가 붕괴되었습니다!</p>
          </div>
        )}
        
        <div className="button-group">
          {!measured ? (
            <button className="measure-btn" onClick={performMeasurement}>
              측정하기
            </button>
          ) : (
            <button className="reset-btn" onClick={resetMeasurement}>
              다시 준비하기
            </button>
          )}
          <button className="reset-all-btn" onClick={resetAll}>
            모두 초기화
          </button>
        </div>
        
        {totalMeasurements > 0 && (
          <div className="measurement-statistics">
            <h4>측정 통계:</h4>
            <div className="stat-bars">
              <div className="stat-item">
                <div className="label">|0⟩:</div>
                <div className="bar-container">
                  <div 
                    className="bar zero-bar"
                    style={{
                      width: `${(measurementHistory[0].count / totalMeasurements) * 100}%`
                    }}
                  ></div>
                  <span className="percentage">
                    {((measurementHistory[0].count / totalMeasurements) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="count">{measurementHistory[0].count}</div>
              </div>
              <div className="stat-item">
                <div className="label">|1⟩:</div>
                <div className="bar-container">
                  <div 
                    className="bar one-bar"
                    style={{
                      width: `${(measurementHistory[1].count / totalMeasurements) * 100}%`
                    }}
                  ></div>
                  <span className="percentage">
                    {((measurementHistory[1].count / totalMeasurements) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="count">{measurementHistory[1].count}</div>
              </div>
            </div>
            <p className="total">총 {totalMeasurements}회 측정</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperpositionMeasurementDemo;

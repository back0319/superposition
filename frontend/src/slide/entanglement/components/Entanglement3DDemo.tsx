import React, { useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import Scene3D from './Scene3D';
import EntangledQubit from './EntangledQubit';
import EntanglementConnection from './EntanglementConnection';

export default function Entanglement3DDemo() {
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

  const particleAPos = new THREE.Vector3(-3, 0, 0);
  const particleBPos = new THREE.Vector3(3, 0, 0);

  const { scaleA, scaleB } = useSpring({
    scaleA: measuring ? 1.3 : 1,
    scaleB: measuring ? 1.3 : 1,
    config: { tension: 200, friction: 20 }
  });
  return (
    <div className="entanglement-3d-demo">
      <Scene3D cameraPosition={[0, 2, 8]}>
        {/* Title */}
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          양자 얽힘 시뮬레이션
        </Text>

        {/* Particle A */}
        <animated.group 
          position={particleAPos} 
          scale={scaleA}
          onClick={() => measureParticle('A')}
        >
          <EntangledQubit
            oneProbability={particleA === 'up' ? 1 : particleA === 'down' ? 0 : 0.5}
            radius={0.8}
            label="입자 A"
            color={particleA === 'up' ? "#4CAF50" : particleA === 'down' ? "#F44336" : "#9E9E9E"}
            isSpinning={measuring}
          />
        </animated.group>

        {/* Particle B */}
        <animated.group 
          position={particleBPos} 
          scale={scaleB}
          onClick={() => measureParticle('B')}
        >
          <EntangledQubit
            oneProbability={particleB === 'up' ? 1 : particleB === 'down' ? 0 : 0.5}
            radius={0.8}
            label="입자 B"
            color={particleB === 'up' ? "#4CAF50" : particleB === 'down' ? "#F44336" : "#9E9E9E"}
            isSpinning={measuring}
          />
        </animated.group>

        {/* Entanglement connection */}
        <EntanglementConnection
          particleA={particleAPos}
          particleB={particleBPos}
          isActive={particleA !== null && particleB !== null}
          connectionType="wave"
        />

        {/* Instructions */}
        <Text
          position={[0, -2, 0]}
          fontSize={0.3}
          color="#64ffda"
          anchorX="center"
          anchorY="middle"
        >
          입자를 클릭해서 측정해보세요!
        </Text>

        {/* Result display */}
        {particleA && particleB && (
          <group>
            <Text
              position={[0, -2.8, 0]}
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              결과: 입자 A({particleA === 'up' ? '↑' : '↓'}) + 입자 B({particleB === 'up' ? '↑' : '↓'})
            </Text>
            <Text
              position={[0, -3.3, 0]}
              fontSize={0.2}
              color="#ffeb3b"
              anchorX="center"
              anchorY="middle"
            >
              → 항상 반대 상태로 측정됩니다!
            </Text>
          </group>
        )}
      </Scene3D>      <div className="controls-3d">
        <button onClick={reset} className="btn-3d reset-btn-3d">
          다시 시작
        </button>
      </div>
      
      <div className="info-panel-3d">
        <div className="info-title">양자 얽힘의 특성</div>
        <div className="info-content">
          입자를 클릭하여 측정하면, 다른 입자도 <span className="highlight">즉시 반대 상태</span>로 결정됩니다.
          이것이 바로 <span className="highlight">양자 얽힘</span>의 신비한 현상입니다!
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import Scene3D from './Scene3D';
import EntangledQubit from './EntangledQubit';

export default function Properties3DDemo() {
  const [selectedProperty, setSelectedProperty] = useState<'nonlocal' | 'inseparable' | 'collapse' | 'correlation'>('nonlocal');
  const [demoActive, setDemoActive] = useState(false);

  const propertyInfo = {
    nonlocal: {
      title: "🚀 순간 이동 같은 연결",
      description: "아무리 멀리 떨어져도 즉시 연결!",
      demo: "distance-demo"
    },
    inseparable: {
      title: "🔗 떼려야 뗄 수 없는 관계",
      description: "둘이 합쳐져야 완전한 시스템!",
      demo: "merge-demo"
    },
    collapse: {
      title: "🎯 관찰하면 결정되는 상태",
      description: "측정하는 순간 모든 것이 결정!",
      demo: "measurement-demo"
    },
    correlation: {
      title: "🎲 신비한 상관관계",
      description: "랜덤하지만 강하게 연결된 결과!",
      demo: "correlation-demo"
    }
  };

  const runDemo = () => {
    setDemoActive(true);
    setTimeout(() => setDemoActive(false), 3000);
  };

  const currentProperty = propertyInfo[selectedProperty];

  const { particleDistance, particleScale, connectionIntensity } = useSpring({
    particleDistance: selectedProperty === 'nonlocal' ? (demoActive ? 8 : 4) : 3,
    particleScale: selectedProperty === 'inseparable' ? (demoActive ? 0.5 : 1) : 1,
    connectionIntensity: demoActive ? 1 : 0.5,
    config: { tension: 100, friction: 20 }
  });

  const NonlocalDemo = () => (
    <>
      <animated.group position={particleDistance.to((d: number) => [-d/2, 0, 0])}>
        <EntangledQubit
          oneProbability={0.5}
          radius={0.8}
          label="지구의 입자"
          isSpinning={demoActive}
        />
        <Text
          position={[0, -2, 0]}
          fontSize={0.2}
          color="#64ffda"
          anchorX="center"
        >
          🌍 지구
        </Text>
      </animated.group>

      <animated.group position={particleDistance.to((d: number) => [d/2, 0, 0])}>
        <EntangledQubit
          oneProbability={0.5}
          radius={0.8}
          label="달의 입자"
          isSpinning={demoActive}
        />
        <Text
          position={[0, -2, 0]}
          fontSize={0.2}
          color="#64ffda"
          anchorX="center"
        >
          🌙 달
        </Text>
      </animated.group>      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 1, 32]} />
        <animated.meshLambertMaterial 
          color="#64ffda" 
          transparent 
          opacity={connectionIntensity}
        />
      </mesh>
    </>
  );

  const InseparableDemo = () => (
    <>
      <animated.group 
        position={[-1.5, 0, 0]} 
        scale={particleScale}
      >
        <EntangledQubit
          oneProbability={0.5}
          radius={0.8}
          label="입자 A"
          isSpinning={demoActive}
        />
      </animated.group>

      <animated.group 
        position={[1.5, 0, 0]} 
        scale={particleScale}
      >
        <EntangledQubit
          oneProbability={0.5}
          radius={0.8}
          label="입자 B"
          isSpinning={demoActive}
        />
      </animated.group>      {/* Merged state visualization */}
      {demoActive && (
        <animated.mesh scale={connectionIntensity}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <animated.meshLambertMaterial 
            color="#9c27b0" 
            transparent 
            opacity={connectionIntensity.to((val: number) => val * 0.3)}
            wireframe={true}
          />
        </animated.mesh>
      )}
    </>
  );

  const CollapseDemo = () => (
    <>
      <group position={[-2, 0, 0]}>
        <EntangledQubit
          oneProbability={demoActive ? 1 : 0.5}
          radius={0.8}
          label="측정 전"
          isSpinning={!demoActive}
        />
      </group>

      <group position={[2, 0, 0]}>
        <EntangledQubit
          oneProbability={demoActive ? 0 : 0.5}
          radius={0.8}
          label="측정 후"
          isSpinning={false}
        />
      </group>

      {/* Measurement beam */}
      {demoActive && (
        <mesh position={[-1, 1, 0]} rotation={[0, 0, -Math.PI/4]}>
          <cylinderGeometry args={[0.1, 0.1, 2, 32]} />
          <meshLambertMaterial 
            color="#ffeb3b"
            emissive="#ffeb3b"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </>
  );

  const CorrelationDemo = () => (
    <>
      <group position={[-2, 0, 0]}>
        <EntangledQubit
          oneProbability={0.5}
          radius={0.8}
          label="50% 랜덤"
          isSpinning={demoActive}
        />
      </group>

      <group position={[2, 0, 0]}>
        <EntangledQubit
          oneProbability={0.5}
          radius={0.8}
          label="50% 랜덤"
          isSpinning={demoActive}
        />
      </group>

      <Text
        position={[0, 0, 0]}
        fontSize={0.4}
        color="#ff6b6b"
        anchorX="center"
      >
        +
      </Text>

      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#4caf50"
        anchorX="center"
      >
        = 100% 상관관계!
      </Text>
    </>
  );

  const renderDemo = () => {
    switch (selectedProperty) {
      case 'nonlocal': return <NonlocalDemo />;
      case 'inseparable': return <InseparableDemo />;
      case 'collapse': return <CollapseDemo />;
      case 'correlation': return <CorrelationDemo />;
      default: return <NonlocalDemo />;
    }
  };

  return (
    <div className="properties-3d-demo">
      <Scene3D>
        {/* Title */}
        <Text
          position={[0, 4, 0]}
          fontSize={0.6}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {currentProperty.title}
        </Text>

        <Text
          position={[0, 3.3, 0]}
          fontSize={0.3}
          color="#64ffda"
          anchorX="center"
          anchorY="middle"
        >
          {currentProperty.description}
        </Text>

        {/* Demo content */}
        {renderDemo()}
      </Scene3D>

      <div className="controls-3d">
        <div className="property-selector-3d">
          {Object.entries(propertyInfo).map(([key, info]) => (
            <button
              key={key}
              className={`property-btn-3d ${selectedProperty === key ? 'active' : ''}`}
              onClick={() => setSelectedProperty(key as any)}
            >
              {info.title}
            </button>
          ))}
        </div>
        
        <button onClick={runDemo} className="demo-btn-3d">
          데모 실행
        </button>
      </div>
    </div>
  );
}

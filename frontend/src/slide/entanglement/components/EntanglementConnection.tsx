import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';

interface EntanglementConnectionProps {
  particleA: THREE.Vector3;
  particleB: THREE.Vector3;
  isActive: boolean;
  connectionType: 'wave' | 'lightning' | 'particles';
}

export default function EntanglementConnection({
  particleA,
  particleB,
  isActive,
  connectionType = 'wave'
}: EntanglementConnectionProps) {
  const connectionRef = useRef<THREE.Group>(null);
  
  const { opacity, scale } = useSpring({
    opacity: isActive ? 1 : 0.3,
    scale: isActive ? 1 : 0.8,
    config: { tension: 200, friction: 20 }
  });

  useFrame((state) => {
    if (connectionRef.current) {
      connectionRef.current.rotation.z += 0.01;
    }
  });

  const midpoint = new THREE.Vector3()
    .addVectors(particleA, particleB)
    .multiplyScalar(0.5);
  
  const distance = particleA.distanceTo(particleB);
  const direction = new THREE.Vector3()
    .subVectors(particleB, particleA)
    .normalize();

  const ConnectionWave = () => {
    const points = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (t - 0.5) * distance;
      const y = Math.sin(t * Math.PI * 4) * 0.2;
      const z = 0;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 40, 0.05, 8, false);

    return (
      <animated.mesh geometry={tubeGeometry} scale={scale}>
        <animated.meshLambertMaterial
          color="#64ffda"
          transparent
          opacity={opacity}
          emissive="#004d40"
          emissiveIntensity={0.2}
        />
      </animated.mesh>
    );
  };

  const ConnectionLightning = () => {
    const points = [];
    const segments = 15;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (t - 0.5) * distance;
      const y = (Math.random() - 0.5) * 0.3;
      const z = (Math.random() - 0.5) * 0.1;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 30, 0.03, 8, false);

    return (
      <animated.mesh geometry={tubeGeometry} scale={scale}>
        <animated.meshLambertMaterial
          color="#ff6b6b"
          transparent
          opacity={opacity}
          emissive="#d32f2f"
          emissiveIntensity={0.3}
        />
      </animated.mesh>
    );
  };

  const ConnectionParticles = () => {
    const particles = [];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1);
      const x = (t - 0.5) * distance;
      const y = Math.sin(t * Math.PI * 2) * 0.1;
      const z = 0;
      
      particles.push(
        <animated.mesh
          key={i}
          position={[x, y, z]}
          scale={scale}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <animated.meshLambertMaterial
            color="#9c27b0"
            transparent
            opacity={opacity}
            emissive="#6a1b9a"
            emissiveIntensity={0.2}
          />
        </animated.mesh>
      );
    }
    
    return <>{particles}</>;
  };

  // Calculate rotation to align with particle positions
  const euler = new THREE.Euler().setFromQuaternion(
    new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(1, 0, 0),
      direction
    )
  );

  return (
    <group
      ref={connectionRef}
      position={midpoint}
      rotation={euler}
    >
      {connectionType === 'wave' && <ConnectionWave />}
      {connectionType === 'lightning' && <ConnectionLightning />}
      {connectionType === 'particles' && <ConnectionParticles />}
      
      {/* Connection label */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        rotation={[0, 0, 0]}
      >
        양자 얽힘
      </Text>
    </group>
  );
}

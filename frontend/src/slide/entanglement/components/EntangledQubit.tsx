import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { animated } from '@react-spring/three';

interface EntangledQubitProps {
  oneProbability: number;
  radius: number;
  label: string;
  color?: string;
  isSpinning?: boolean;
}

export default function EntangledQubit({
    oneProbability,
  radius,
  label,
  color,
  isSpinning = false,
  ...props
}: EntangledQubitProps & React.ComponentProps<'mesh'>) {
  const meshRef = useRef<THREE.Mesh>(null);
  const offset = -(oneProbability * 1.4 - 0.7);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color(color || "#fa5252"), // red for |1⟩
      },
      color2: {
        value: new THREE.Color("#364fc7"), // blue for |0⟩
      },
      offset: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float offset;
      varying vec2 vUv;
      
      void main() {
        gl_FragColor = vec4(mix(color1, color2, vUv.y + offset), 1.0);
      }
    `,
  });

  useFrame((state) => {
    if (material && material.uniforms) {
      material.uniforms.offset.value = offset;
    }
    if (isSpinning && meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh
      ref={meshRef}
      castShadow
      material={material}
      rotation={[0, -Math.PI / 4, Math.PI / 2]}
      {...props}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      
      {/* Qubit labels */}
      <group
        position={[radius * 0.6, 0, radius]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <Text fontSize={radius * 1.2} renderOrder={-1} color="white">
          <animated.meshBasicMaterial
            color="white"
            opacity={1 - oneProbability}
            transparent
          />
          |0⟩
        </Text>
        <Text
          position={[0, 0, 0.05]}
          fontSize={radius * 1.2}
          renderOrder={-1}
          color="white"
        >
          <animated.meshBasicMaterial 
            color="white" 
            opacity={oneProbability}
            transparent
          />
          |1⟩
        </Text>
      </group>

      {/* Particle label */}
      <Text
        position={[0, -radius * 1.5, 0]}
        fontSize={radius * 0.8}
        color="white"
        rotation={[0, Math.PI / 4, -Math.PI / 2]}
      >
        {label}
      </Text>
    </mesh>
  );
}

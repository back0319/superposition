import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';

interface Scene3DProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
}

export default function Scene3D({ 
  children, 
  cameraPosition = [0, 0, 8]
}: Scene3DProps) {
  return (
    <Canvas
      style={{ width: '100%', height: '400px' }}
      shadows
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={50}
        />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <pointLight 
          position={[10, 10, 5]} 
          intensity={0.8} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-10, 10, 5]}
          intensity={0.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Environment */}
        <Environment preset="city" />
          {/* Ground plane */}
        <mesh 
          receiveShadow 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -3, 0]}
        >
          <planeGeometry args={[20, 20]} />
          <meshLambertMaterial 
            color="#263238" 
            transparent 
            opacity={0.3} 
          />
        </mesh>
        
        {children}
      </Suspense>
    </Canvas>
  );
}

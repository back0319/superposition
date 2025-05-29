import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface BlochSphereProps {
  radius: number;
  theta: number;
  phi: number;
  color?: string;
  showVector?: boolean;
}

function AxisArrow({
  dir,
  radius,
  color,
}: {
  dir: THREE.Vector3;
  radius: number;
  color?: string;
}) {
  return (
    <arrowHelper
      args={[
        dir,
        new THREE.Vector3(0, 0, 0),
        radius,
        color || "#868e96",
        radius * 0.1,
        radius * 0.07,
      ]}
    />
  );
}

export default function BlochSphere({
  radius,
  phi,
  theta,
  color = "#f8f9fa",
  showVector = true,
  ...props
}: BlochSphereProps & React.ComponentProps<'mesh'>) {
  return (
    <mesh {...props}>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI]} castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshLambertMaterial color={color} transparent opacity={0.2} />

        {/* Equator circle */}
        <mesh>
          <torusGeometry args={[radius, 0.02, 64, 64]} />
          <meshLambertMaterial color="#adb5bd" />
        </mesh>

        {/* X axis */}
        <AxisArrow dir={new THREE.Vector3(1, 0, 0)} radius={radius * 1.4} />
        <Text
          fontSize={radius * 0.25}
          position={[radius * 1.6, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#adb5bd"
        >
          X
        </Text>

        {/* Y axis */}
        <AxisArrow dir={new THREE.Vector3(0, 1, 0)} radius={radius * 1.4} />
        <Text
          fontSize={radius * 0.25}
          position={[0, radius * 1.6, 0]}
          rotation={[Math.PI / 2, -Math.PI / 2, 0]}
          color="#adb5bd"
        >
          Y
        </Text>

        {/* Z axis */}
        <AxisArrow dir={new THREE.Vector3(0, 0, 1)} radius={radius * 1.4} />
        <Text
          fontSize={radius * 0.25}
          position={[0, 0, radius * 1.6]}
          rotation={[Math.PI / 2, Math.PI / 2, 0]}
          color="#adb5bd"
        >
          Z
        </Text>

        {/* |0⟩ state label */}
        <Text
          fontSize={radius * 0.3}
          position={[0, radius * 0.25, radius * 1.3]}
          rotation={[Math.PI / 2, Math.PI / 2, 0]}
          color="#4CAF50"
        >
          |0⟩
        </Text>

        {/* |1⟩ state label */}
        <Text
          fontSize={radius * 0.3}
          position={[0, 0, -radius * 1.2]}
          rotation={[Math.PI / 2, Math.PI / 2, 0]}
          color="#F44336"
        >
          |1⟩
        </Text>

        {/* State vector */}
        {showVector && (
          <group rotation={[phi, theta, 0]}>
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0, radius / 2 - 0.1]}
            >
              <cylinderGeometry args={[0.06, 0.06, radius - 0.2, 32, 32]} />
              <meshLambertMaterial color="#2196F3" />

              <mesh position={[0, radius / 2, 0]}>
                <cylinderGeometry args={[0, 0.1, 0.2, 32, 32]} />
                <meshLambertMaterial color="#2196F3" />
              </mesh>
            </mesh>

            <mesh position={[0, 0, radius]}>
              <sphereGeometry args={[radius / 10, 16, 16]} />
              <meshLambertMaterial color="#2196F3" />
            </mesh>
          </group>
        )}
      </mesh>
    </mesh>
  );
}

'use client';

import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';

interface RoomProps {
  onPlaceNote?: (position: [number, number, number], rotation: [number, number, number]) => void;
}

export function Room({ onPlaceNote }: RoomProps) {

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!onPlaceNote) return;

    // Get normal in world space
    const normal = e.face?.normal.clone();
    if (!normal) return;

    // Transform normal to world space
    // e.object.matrixWorld handles rotation/scale/position of the object
    // transformDirection ignores translation, handles rotation
    normal.transformDirection(e.object.matrixWorld).normalize();

    // Calculate rotation to align Z-axis with normal
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    const euler = new THREE.Euler();
    euler.setFromQuaternion(quaternion);

    const rotation: [number, number, number] = [euler.x, euler.y, euler.z];

    // Offset position slightly by normal to avoid z-fighting
    const position: [number, number, number] = [
      e.point.x + normal.x * 0.01,
      e.point.y + normal.y * 0.01,
      e.point.z + normal.z * 0.01
    ];

    onPlaceNote(position, rotation);
  };

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
        onClick={handleClick}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 8, 0]}
        onClick={handleClick}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Walls */}
      <mesh
        position={[0, 3, -10]}
        receiveShadow
        onClick={handleClick}
      >
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      <mesh
        position={[0, 3, 10]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        onClick={handleClick}
      >
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      <mesh
        position={[-10, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        onClick={handleClick}
      >
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      <mesh
        position={[10, 3, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        onClick={handleClick}
      >
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* Grid Helper on floor for reference */}
      <gridHelper args={[20, 20, 0xcccccc, 0xeeeeee]} position={[0, -1.99, 0]} />
    </group>
  );
}

'use client';

import { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMindHouseStore, Note as NoteType } from '@/lib/mindhouse-store';
import * as THREE from 'three';

interface NoteProps {
  note: NoteType;
}

export function Note({ note }: NoteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setEditing, isEditing } = useMindHouseStore();
  const [hovered, setHover] = useState(false);

  // Simple animation on hover
  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation(); // Prevent placing a new note behind this one
    if (!isEditing) {
      setEditing(true, note.id);
    }
  };

  return (
    <group position={note.position} rotation={note.rotation}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial
          color={note.color}
          roughness={0.8}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Note Content */}
      <Text
        position={[0, 0, 0.01]} // Slightly in front of the note
        fontSize={0.1}
        color="#333333"
        maxWidth={1.3}
        lineHeight={1.2}
        textAlign="left"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff" // Use a standard font or similar
      >
        {note.content || "Empty Note"}
      </Text>
    </group>
  );
}

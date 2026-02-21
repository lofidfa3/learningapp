'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense } from 'react';
import { Environment, Stars } from '@react-three/drei';
import { Room } from './Room';
import { Note } from './Note';
import { Player } from './Player';
import { useMindHouseStore } from '@/lib/mindhouse-store';

function RaycasterCenter() {
  useFrame(({ pointer }) => {
    // Force raycaster to always use center of screen
    pointer.x = 0;
    pointer.y = 0;
  });
  return null;
}

export function Scene() {
  const { notes, addNote, setEditing, setLocked, isLocked } = useMindHouseStore();

  const handlePlaceNote = (position: [number, number, number], rotation: [number, number, number]) => {
    if (!isLocked) return; // Only place notes when locked (playing)
    const id = addNote(position, rotation);
    setEditing(true, id);
    setLocked(false); // Unlock cursor to edit note
  };

  return (
    <div className="w-full h-full absolute inset-0 bg-black">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 75 }}>
        <RaycasterCenter />
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />

          <Player />

          <Room onPlaceNote={handlePlaceNote} />

          {notes.map((note) => (
            <Note key={note.id} note={note} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}

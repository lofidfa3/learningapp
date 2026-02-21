'use client';

import { useEffect, useRef } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useMindHouseStore } from '@/lib/mindhouse-store';

export function Player() {
  const { camera } = useThree();
  const { isLocked, setLocked } = useMindHouseStore();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (isLocked && controlsRef.current) {
      controlsRef.current.lock();
    } else if (!isLocked && controlsRef.current) {
      controlsRef.current.unlock();
    }
  }, [isLocked]);

  return (
    <PointerLockControls
      ref={controlsRef}
      onUnlock={() => setLocked(false)}
      onLock={() => setLocked(true)}
      pointerSpeed={0.8}
    />
  );
}

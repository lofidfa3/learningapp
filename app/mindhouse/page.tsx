'use client';

import { Scene } from '@/components/mindhouse/Scene';
import { UI } from '@/components/mindhouse/UI';

export default function MindHousePage() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <Scene />
      <UI />
    </div>
  );
}

export function Crosshair() {
  return (
    <div className="fixed top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 pointer-events-none z-50">
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -ml-0.75 -mt-0.75 bg-white/80 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.5)]" />
    </div>
  );
}

export function Crosshair() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
    </div>
  )
}
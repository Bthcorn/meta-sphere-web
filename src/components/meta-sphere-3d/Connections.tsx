import { AVATARS, ACCENT } from './constants';

// Precompute once at module level — no render involvement
const CONNECTION_POINTS = (() => {
  const pts: number[] = [];
  const n = AVATARS.length;
  for (let i = 0; i < n; i++) {
    const a = AVATARS[i].position;
    const b = AVATARS[(i + 1) % n].position;
    pts.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  }
  return new Float32Array(pts);
})();

export function Connections() {
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' args={[CONNECTION_POINTS, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={ACCENT} transparent opacity={0.18} />
    </lineSegments>
  );
}

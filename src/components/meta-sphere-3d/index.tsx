import { Canvas, useFrame } from '@react-three/fiber';
import { WorkTable } from './WorkTable';
import { Avatar } from './Avatar';
import { FloatingScreen } from './FloatingScreen';
import { Connections } from './Connections';
import { FloatingParticles } from './FloatingParticles';
import { PRIMARY, ACCENT, GLOW, AVATARS, SCREENS } from './constants';

function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (pointer.y * 0.8 + 2.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0.5, 0);
  });
  return null;
}

function FloorGlow() {
  return (
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[5.5, 48]} />
      <meshBasicMaterial color={PRIMARY} transparent opacity={0.04} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 4, 0]} intensity={2} color={GLOW} />
      <pointLight position={[4, 2, 4]} intensity={1.5} color={PRIMARY} />
      <pointLight position={[-4, 2, -4]} intensity={1} color={ACCENT} />

      <CameraRig />
      <WorkTable />
      {AVATARS.map((cfg, i) => (
        <Avatar key={i} {...cfg} />
      ))}
      {SCREENS.map((cfg, i) => (
        <FloatingScreen key={i} {...cfg} />
      ))}
      <Connections />
      <FloatingParticles />
      <FloorGlow />
    </>
  );
}

export function MetaSphere3D() {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 7], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  );
}

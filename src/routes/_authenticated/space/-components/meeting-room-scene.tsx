import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

import { Player } from '@/components/space/player';
import { RemotePlayers } from '@/components/space/remote-player';
import { MeetingFurniture } from '@/components/space/meeting-room/meeting-furniture';

const ROOM_WIDTH = 8.5;
const ROOM_DEPTH = 15;
const WALL_H = 7;
const WALL_T = 0.5;

// Spawn near the front wall, clear of the table and chairs
const SPAWN: [number, number, number] = [0, 1, 5.5];

function RoomGeometry() {
  const solid = <meshStandardMaterial color='#4b5563' />;

  return (
    <RigidBody type='fixed' colliders='cuboid'>
      {/* Floor */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[ROOM_WIDTH, 0.1, ROOM_DEPTH]} />
        <meshStandardMaterial color='#3b82f6' />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, WALL_H / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, WALL_H, WALL_T]} />
        {solid}
      </mesh>

      {/* Left wall */}
      <mesh position={[-ROOM_WIDTH / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_T, WALL_H, ROOM_DEPTH]} />
        {solid}
      </mesh>

      {/* Right wall */}
      <mesh position={[ROOM_WIDTH / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_T, WALL_H, ROOM_DEPTH]} />
        {solid}
      </mesh>

      {/* Front wall — solid, no door */}
      <mesh position={[0, WALL_H / 2, ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, WALL_H, WALL_T]} />
        {solid}
      </mesh>
    </RigidBody>
  );
}

export function MeetingRoomScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
        });
      }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 12, 8]} intensity={1.1} castShadow />
      <Sky sunPosition={[100, 20, 100]} />

      <Physics>
        {/* Safety floor so the player never falls into the void */}
        <RigidBody type='fixed'>
          <mesh position={[0, -0.15, 0]} visible={false}>
            <boxGeometry args={[60, 0.1, 60]} />
            <meshStandardMaterial />
          </mesh>
        </RigidBody>

        <RoomGeometry />
        <MeetingFurniture position={[0, 0, 0]} scale={0.85} />

        <Player position={SPAWN} />
        <RemotePlayers />
      </Physics>
    </Canvas>
  );
}

import { SafeCanvas } from '@/components/space/safe-canvas';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

import { Player } from '@/components/space/player';
import { RemotePlayers } from '@/components/space/remote-player';
import { MeetingFurniture } from '@/components/space/meeting-room/meeting-furniture';
import { MeetingFloorTiles } from '@/components/space/meeting-room/meeting-floor-tiles';
import {
  MEETING_ROOM_DEPTH,
  MEETING_ROOM_WIDTH,
  MEETING_WALL_HEIGHT,
  MEETING_WALL_THICKNESS,
} from '@/components/space/meeting-room/meeting-room';
// Spawn near the front wall, clear of the table and chairs
const SPAWN: [number, number, number] = [0, 1, 5.5];

function RoomGeometry() {
  const solid = <meshStandardMaterial color='#4b5563' />;

  return (
    <>
      {/* Same tiled floor as `Meeting` (4×7 grid, Meeting_floor model). */}
      <MeetingFloorTiles width={MEETING_ROOM_WIDTH} depth={MEETING_ROOM_DEPTH} />

      <RigidBody type='fixed' colliders='cuboid'>
        {/* Invisible physics floor — top at y = 0, matches `Meeting` */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[MEETING_ROOM_WIDTH, 0.1, MEETING_ROOM_DEPTH]} />
          <meshStandardMaterial color='#111111' transparent opacity={0} />
        </mesh>

        {/* Back wall */}
        <mesh position={[0, MEETING_WALL_HEIGHT / 2, -MEETING_ROOM_DEPTH / 2]}>
          <boxGeometry args={[MEETING_ROOM_WIDTH, MEETING_WALL_HEIGHT, MEETING_WALL_THICKNESS]} />
          {solid}
        </mesh>

        {/* Left wall */}
        <mesh position={[-MEETING_ROOM_WIDTH / 2, MEETING_WALL_HEIGHT / 2, 0]}>
          <boxGeometry args={[MEETING_WALL_THICKNESS, MEETING_WALL_HEIGHT, MEETING_ROOM_DEPTH]} />
          {solid}
        </mesh>

        {/* Right wall */}
        <mesh position={[MEETING_ROOM_WIDTH / 2, MEETING_WALL_HEIGHT / 2, 0]}>
          <boxGeometry args={[MEETING_WALL_THICKNESS, MEETING_WALL_HEIGHT, MEETING_ROOM_DEPTH]} />
          {solid}
        </mesh>

        {/* Front wall — solid, no door */}
        <mesh position={[0, MEETING_WALL_HEIGHT / 2, MEETING_ROOM_DEPTH / 2]}>
          <boxGeometry args={[MEETING_ROOM_WIDTH, MEETING_WALL_HEIGHT, MEETING_WALL_THICKNESS]} />
          {solid}
        </mesh>
      </RigidBody>
    </>
  );
}

interface Props {
  lockEnabled?: boolean;
}

export function MeetingRoomScene({ lockEnabled = true }: Props) {
  return (
    <SafeCanvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'default' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 30, 20]} intensity={1} />
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

        <Player position={SPAWN} lockEnabled={lockEnabled} />
        <RemotePlayers />
      </Physics>
    </SafeCanvas>
  );
}

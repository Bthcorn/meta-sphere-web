import { SafeCanvas } from '@/components/space/safe-canvas';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

import { Player } from '@/components/space/player';
import { RemotePlayers } from '@/components/space/remote-player';
import { MeetingFurniture } from '@/components/space/meeting-room/meeting-furniture';

// 1. IMPORT YOUR DETAILED ROOM HERE
import { Meeting } from './meeting';

const ROOM_WIDTH = 8.5;
const ROOM_DEPTH = 15;

// Spawn near the front wall, clear of the table and chairs
const SPAWN: [number, number, number] = [0, 1, 5.5];

interface Props {
  lockEnabled?: boolean;
}

export function MeetingRoomScene({ lockEnabled = true }: Props) {
  return (
    <SafeCanvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'default' }}>
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

        {/* 2. RENDER YOUR DETAILED ROOM HERE! */}
        {/* This replaces the old, boring RoomGeometry box */}
        <Meeting width={ROOM_WIDTH} depth={ROOM_DEPTH} />

        <MeetingFurniture position={[0, 0, 0]} scale={0.85} />

        <Player position={SPAWN} lockEnabled={lockEnabled} />
        <RemotePlayers />
      </Physics>
    </SafeCanvas>
  );
}

import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

import { SafeCanvas } from '@/components/space/safe-canvas';
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

// Spawn near the front wall
const SPAWN: [number, number, number] = [0, 1, 5.5];

function RoomGeometry() {
  const colorMeeting = '#EDEADE'; // Alabaster
  const solid = <meshStandardMaterial color={colorMeeting} />;

  /**
   * HIGH-FIDELITY GLASS
   * Uses MeshPhysicalMaterial for realistic transmission and refraction.
   */
  const glass = (
    <meshPhysicalMaterial
      color='#e0f2fe'
      transmission={1} // Allow light to pass through
      roughness={0.05} // Very smooth
      thickness={0.2} // Physical thickness for refraction
      ior={1.5} // Index of Refraction for glass
      reflectivity={0.5}
      metalness={0}
      clearcoat={1} // Extra glossy layer
      transparent={true}
      opacity={0.3}
    />
  );

  // --- VERTICAL WINDOW DIMENSIONS ---
  const bottomWallHeight = 0.5;
  const glassHeight = 5.5;
  const topWallHeight = MEETING_WALL_HEIGHT - bottomWallHeight - glassHeight; // 1.0

  const bottomWallY = bottomWallHeight / 2;
  const glassY = bottomWallHeight + glassHeight / 2;
  const topWallY = bottomWallHeight + glassHeight + topWallHeight / 2;

  // --- HORIZONTAL EXTERNAL WALL PATTERN ---
  const solidEndDepth = 2.5;
  const whiteboardCenterDepth = 4.0;
  const windowDepth = (MEETING_ROOM_DEPTH - 2 * solidEndDepth - whiteboardCenterDepth) / 2;

  const segment1Z_FrontSolid = MEETING_ROOM_DEPTH / 2 - solidEndDepth / 2;
  const segment2Z_FrontWindow = MEETING_ROOM_DEPTH / 2 - solidEndDepth - windowDepth / 2;
  const segment3Z_CenterWhiteboard = 0;
  const segment4Z_BackWindow = -MEETING_ROOM_DEPTH / 2 + solidEndDepth + windowDepth / 2;
  const segment5Z_BackSolid = -MEETING_ROOM_DEPTH / 2 + solidEndDepth / 2;

  const innerLeftX = -MEETING_ROOM_WIDTH / 2;
  const innerRightX = MEETING_ROOM_WIDTH / 2;

  const outerWallThickness = 1.0;
  const outerLeftX = -MEETING_ROOM_WIDTH / 2 - 0.5;
  const outerRightX = MEETING_ROOM_WIDTH / 2 + 0.5;

  return (
    <>
      <MeetingFloorTiles width={MEETING_ROOM_WIDTH} depth={MEETING_ROOM_DEPTH} />

      {/* --- WINDOW LIGHTS (Left Side Only) --- */}
      {[innerLeftX].map((xPos) =>
        [segment2Z_FrontWindow, segment4Z_BackWindow].map((zPos) => (
          <pointLight
            key={`light-${xPos}-${zPos}`}
            position={[xPos - 0.5, 1.5, zPos]}
            intensity={30}
            distance={6}
            decay={2}
            color='#fed7aa'
          />
        ))
      )}

      <RigidBody type='fixed' colliders='cuboid'>
        {/* Floor Physics */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[MEETING_ROOM_WIDTH, 0.1, MEETING_ROOM_DEPTH]} />
          <meshStandardMaterial color='#111111' transparent opacity={0} />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, MEETING_WALL_HEIGHT, 0]}>
          <boxGeometry args={[MEETING_ROOM_WIDTH + 2, 0.1, MEETING_ROOM_DEPTH + 1]} />
          {solid}
        </mesh>

        {/* Back and Front walls */}
        <mesh position={[0, MEETING_WALL_HEIGHT / 2, -MEETING_ROOM_DEPTH / 2]}>
          <boxGeometry args={[MEETING_ROOM_WIDTH, MEETING_WALL_HEIGHT, MEETING_WALL_THICKNESS]} />
          {solid}
        </mesh>
        <mesh position={[0, MEETING_WALL_HEIGHT / 2, MEETING_ROOM_DEPTH / 2]}>
          <boxGeometry args={[MEETING_ROOM_WIDTH, MEETING_WALL_HEIGHT, MEETING_WALL_THICKNESS]} />
          {solid}
        </mesh>

        {/* --- LEFT SIDE (Inner & Outer) --- */}
        <group>
          <mesh position={[innerLeftX, MEETING_WALL_HEIGHT / 2, segment1Z_FrontSolid]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, MEETING_WALL_HEIGHT, solidEndDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerLeftX, bottomWallY, segment2Z_FrontWindow]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, bottomWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerLeftX, glassY, segment2Z_FrontWindow]}>
            <boxGeometry args={[0.2, glassHeight, windowDepth]} />
            {glass}
          </mesh>
          <mesh position={[innerLeftX, topWallY, segment2Z_FrontWindow]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, topWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerLeftX, MEETING_WALL_HEIGHT / 2, segment3Z_CenterWhiteboard]}>
            <boxGeometry
              args={[MEETING_WALL_THICKNESS, MEETING_WALL_HEIGHT, whiteboardCenterDepth]}
            />
            {solid}
          </mesh>
          <mesh position={[innerLeftX, bottomWallY, segment4Z_BackWindow]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, bottomWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerLeftX, glassY, segment4Z_BackWindow]}>
            <boxGeometry args={[0.2, glassHeight, windowDepth]} />
            {glass}
          </mesh>
          <mesh position={[innerLeftX, topWallY, segment4Z_BackWindow]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, topWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerLeftX, MEETING_WALL_HEIGHT / 2, segment5Z_BackSolid]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, MEETING_WALL_HEIGHT, solidEndDepth]} />
            {solid}
          </mesh>

          {/* Outer Wall */}
          <mesh position={[outerLeftX, MEETING_WALL_HEIGHT / 2, segment1Z_FrontSolid]}>
            <boxGeometry args={[outerWallThickness, MEETING_WALL_HEIGHT, solidEndDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerLeftX, bottomWallY, segment2Z_FrontWindow]}>
            <boxGeometry args={[outerWallThickness, bottomWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerLeftX, topWallY, segment2Z_FrontWindow]}>
            <boxGeometry args={[outerWallThickness, topWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerLeftX, MEETING_WALL_HEIGHT / 2, segment3Z_CenterWhiteboard]}>
            <boxGeometry args={[outerWallThickness, MEETING_WALL_HEIGHT, whiteboardCenterDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerLeftX, bottomWallY, segment4Z_BackWindow]}>
            <boxGeometry args={[outerWallThickness, bottomWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerLeftX, topWallY, segment4Z_BackWindow]}>
            <boxGeometry args={[outerWallThickness, topWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerLeftX, MEETING_WALL_HEIGHT / 2, segment5Z_BackSolid]}>
            <boxGeometry args={[outerWallThickness, MEETING_WALL_HEIGHT, solidEndDepth]} />
            {solid}
          </mesh>
        </group>

        {/* --- RIGHT SIDE (Inner & Outer) --- */}
        <group>
          <mesh position={[innerRightX, MEETING_WALL_HEIGHT / 2, segment1Z_FrontSolid]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, MEETING_WALL_HEIGHT, solidEndDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerRightX, bottomWallY, segment2Z_FrontWindow]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, bottomWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerRightX, glassY, segment2Z_FrontWindow]}>
            <boxGeometry args={[0.2, glassHeight, windowDepth]} />
            {glass}
          </mesh>
          <mesh position={[innerRightX, topWallY, segment2Z_FrontWindow]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, topWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerRightX, MEETING_WALL_HEIGHT / 2, segment3Z_CenterWhiteboard]}>
            <boxGeometry
              args={[MEETING_WALL_THICKNESS, MEETING_WALL_HEIGHT, whiteboardCenterDepth]}
            />
            {solid}
          </mesh>
          <mesh position={[innerRightX, bottomWallY, segment4Z_BackWindow]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, bottomWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerRightX, glassY, segment4Z_BackWindow]}>
            <boxGeometry args={[0.2, glassHeight, windowDepth]} />
            {glass}
          </mesh>
          <mesh position={[innerRightX, topWallY, segment4Z_BackWindow]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, topWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[innerRightX, MEETING_WALL_HEIGHT / 2, segment5Z_BackSolid]}>
            <boxGeometry args={[MEETING_WALL_THICKNESS, MEETING_WALL_HEIGHT, solidEndDepth]} />
            {solid}
          </mesh>

          {/* Outer Wall */}
          <mesh position={[outerRightX, MEETING_WALL_HEIGHT / 2, segment1Z_FrontSolid]}>
            <boxGeometry args={[outerWallThickness, MEETING_WALL_HEIGHT, solidEndDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerRightX, bottomWallY, segment2Z_FrontWindow]}>
            <boxGeometry args={[outerWallThickness, bottomWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerRightX, topWallY, segment2Z_FrontWindow]}>
            <boxGeometry args={[outerWallThickness, topWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerRightX, MEETING_WALL_HEIGHT / 2, segment3Z_CenterWhiteboard]}>
            <boxGeometry args={[outerWallThickness, MEETING_WALL_HEIGHT, whiteboardCenterDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerRightX, bottomWallY, segment4Z_BackWindow]}>
            <boxGeometry args={[outerWallThickness, bottomWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerRightX, topWallY, segment4Z_BackWindow]}>
            <boxGeometry args={[outerWallThickness, topWallHeight, windowDepth]} />
            {solid}
          </mesh>
          <mesh position={[outerRightX, MEETING_WALL_HEIGHT / 2, segment5Z_BackSolid]}>
            <boxGeometry args={[outerWallThickness, MEETING_WALL_HEIGHT, solidEndDepth]} />
            {solid}
          </mesh>
        </group>
      </RigidBody>
    </>
  );
}

interface Props {
  lockEnabled?: boolean;
}

export function MeetingRoomScene({ lockEnabled = true }: Props) {
  return (
    <SafeCanvas shadows dpr={[1, 2]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <ambientLight intensity={0.3} />

      <directionalLight
        position={[-40, 30, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[40, 30, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Sky sunPosition={[-100, 20, 100]} />

      <Physics>
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

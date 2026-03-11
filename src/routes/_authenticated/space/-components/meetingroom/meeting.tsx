import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

import { MeetingRoom } from './-components/meetingroom';

type MeetingAreaProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Meeting({ width, depth, ...props }: MeetingAreaProps) {
  const wallThickness = 0.5;
  const glassThickness = 0.2;
  const wallHeight = 7;

  // Main Entrance Math
  const mainDoorWidth = 3;
  const mainDoorHeight = 6;
  const frontSideWidth = (width - mainDoorWidth) / 2;

  // Corridor Math
  const corridorWidth = 3;
  const roomWidth = (width - corridorWidth) / 2;

  // Asymmetrical Glass Door Math
  const roomDoorWidth = 2.5;
  const roomDoorHeight = 6;

  const doorDistanceFromFront = 1;
  const frontSegmentDepth = doorDistanceFromFront;
  const backSegmentDepth = depth - roomDoorWidth - frontSegmentDepth;

  // Calculating exact Z coordinates
  const frontSegmentZ = depth / 2 - frontSegmentDepth / 2;
  const doorZ = depth / 2 - frontSegmentDepth - roomDoorWidth / 2;
  const backSegmentZ = -depth / 2 + backSegmentDepth / 2;

  // Flattened X offsets for the glass walls
  const leftGlassX = -corridorWidth / 2;
  const rightGlassX = corridorWidth / 2;

  const solidWallMaterial = <meshStandardMaterial color='#4b5563' />;
  const glassMaterial = (
    <meshPhysicalMaterial
      color='#e0f2fe'
      transmission={0.9}
      opacity={1}
      transparent
      roughness={0.1}
    />
  );

  return (
    <group {...props}>
      <Text
        position={[0, wallHeight + 1, depth / 2]}
        fontSize={1.5}
        color='white'
        rotation={[0, Math.PI, 0]}
      >
        Meeting Area
      </Text>

      {/* --- ALL ARCHITECTURE & WALLS --- */}
      <RigidBody type='fixed' colliders='cuboid'>
        {/* Floor */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#3b82f6' />
        </mesh>

        {/* Outer Solid Walls */}
        <mesh position={[0, wallHeight / 2, -depth / 2]}>
          <boxGeometry args={[width, wallHeight, wallThickness]} />
          {solidWallMaterial}
        </mesh>
        <mesh position={[-width / 2, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, depth]} />
          {solidWallMaterial}
        </mesh>
        <mesh position={[width / 2, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, depth]} />
          {solidWallMaterial}
        </mesh>

        {/* Front Solid Wall (Group flattened so Rapier reads it correctly) */}
        <mesh position={[-(width / 2) + frontSideWidth / 2, wallHeight / 2, depth / 2]}>
          <boxGeometry args={[frontSideWidth, wallHeight, wallThickness]} />
          {solidWallMaterial}
        </mesh>
        <mesh position={[width / 2 - frontSideWidth / 2, wallHeight / 2, depth / 2]}>
          <boxGeometry args={[frontSideWidth, wallHeight, wallThickness]} />
          {solidWallMaterial}
        </mesh>
        <mesh position={[0, mainDoorHeight + 0.5, depth / 2]}>
          <boxGeometry args={[mainDoorWidth, 1.0, wallThickness]} />
          {solidWallMaterial}
        </mesh>

        {/* Inner Glass Wall Left (Group flattened) */}
        <mesh position={[leftGlassX, wallHeight / 2, backSegmentZ]}>
          <boxGeometry args={[glassThickness, wallHeight, backSegmentDepth]} />
          {glassMaterial}
        </mesh>
        <mesh position={[leftGlassX, wallHeight / 2, frontSegmentZ]}>
          <boxGeometry args={[glassThickness, wallHeight, frontSegmentDepth]} />
          {glassMaterial}
        </mesh>
        <mesh position={[leftGlassX, roomDoorHeight + 0.5, doorZ]}>
          <boxGeometry args={[glassThickness, 1.0, roomDoorWidth]} />
          {glassMaterial}
        </mesh>

        {/* Inner Glass Wall Right (Group flattened) */}
        <mesh position={[rightGlassX, wallHeight / 2, backSegmentZ]}>
          <boxGeometry args={[glassThickness, wallHeight, backSegmentDepth]} />
          {glassMaterial}
        </mesh>
        <mesh position={[rightGlassX, wallHeight / 2, frontSegmentZ]}>
          <boxGeometry args={[glassThickness, wallHeight, frontSegmentDepth]} />
          {glassMaterial}
        </mesh>
        <mesh position={[rightGlassX, roomDoorHeight + 0.5, doorZ]}>
          <boxGeometry args={[glassThickness, 1.0, roomDoorWidth]} />
          {glassMaterial}
        </mesh>
      </RigidBody>

      {/* --- CORRIDOR LABELS --- */}
      <Text
        position={[leftGlassX + 0.2, roomDoorHeight + 0.4, doorZ]}
        fontSize={0.8}
        color='white'
        rotation={[0, Math.PI / 2, 0]}
      >
        Room A
      </Text>
      <Text
        position={[rightGlassX - 0.2, roomDoorHeight + 0.4, doorZ]}
        fontSize={0.8}
        color='white'
        rotation={[0, -Math.PI / 2, 0]}
      >
        Room B
      </Text>

      {/* --- THE INTERIORS --- */}
      <MeetingRoom
        position={[-(corridorWidth / 2 + roomWidth / 2), 0, 0]}
        width={roomWidth}
        depth={depth}
      />
      <MeetingRoom
        position={[corridorWidth / 2 + roomWidth / 2, 0, 0]}
        width={roomWidth}
        depth={depth}
      />
    </group>
  );
}

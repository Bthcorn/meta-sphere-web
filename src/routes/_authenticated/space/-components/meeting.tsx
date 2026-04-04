import { useMemo } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

import { MeetingRoom } from '@/components/space/meeting-room/meeting-room';

// --- IMPORT YOUR DARK GREY FLOOR ---
// Make sure this path matches wherever you saved the dark grey floor component!
import { Model as MeetingFloor } from '@/components/space/meeting-room/Meeting_floor';

type MeetingAreaProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Meeting({ width, depth, ...props }: MeetingAreaProps) {
  const wallThickness = 0.5;
  const glassThickness = 0.2;
  const wallHeight = 7;

  const mainDoorWidth = 3;
  const mainDoorHeight = 6;
  const frontSideWidth = (width - mainDoorWidth) / 2;

  const corridorWidth = 3;
  const roomWidth = (width - corridorWidth) / 2;

  const roomDoorWidth = 2.5;
  const roomDoorHeight = 6;

  const doorDistanceFromFront = 1;
  const frontSegmentDepth = doorDistanceFromFront;
  const backSegmentDepth = depth - roomDoorWidth - frontSegmentDepth;

  const frontSegmentZ = depth / 2 - frontSegmentDepth / 2;
  const doorZ = depth / 2 - frontSegmentDepth - roomDoorWidth / 2;
  const backSegmentZ = -depth / 2 + backSegmentDepth / 2;

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

  // --- NEW FLOOR TILING LOGIC ---
  const columns = 4;
  const rows = 7;
  const scaleX = width / columns / 3.5;
  const scaleZ = depth / rows / 3.5;

  const tileData = useMemo(() => {
    const tiles = [];
    const tileW = width / columns;
    const tileD = depth / rows;

    for (let x = 0; x < columns; x++) {
      for (let z = 0; z < rows; z++) {
        const posX = x * tileW - width / 2 + tileW / 2;
        const posZ = z * tileD - depth / 2 + tileD / 2;

        tiles.push({
          id: `${x}-${z}`,
          position: [posX, 0.01, posZ] as [number, number, number],
        });
      }
    }
    return tiles;
  }, [width, depth]);

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

      {/* --- NEW VISUAL TILED FLOOR --- */}
      <group>
        {tileData.map((tile) => (
          <MeetingFloor key={tile.id} position={tile.position} scale={[scaleX, 1, scaleZ]} />
        ))}
      </group>

      <RigidBody type='fixed' colliders='cuboid'>
        {/* Invisible Base Physics Floor (Replaces the old solid blue one!) */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#111111' transparent opacity={0} />
        </mesh>

        {/* --- BACK WALL (Restored to solid) --- */}
        <mesh position={[0, wallHeight / 2, -depth / 2]}>
          <boxGeometry args={[width, wallHeight, wallThickness]} />
          {solidWallMaterial}
        </mesh>

        {/* Outer Solid Side Walls */}
        <mesh position={[-width / 2, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, depth]} />
          {solidWallMaterial}
        </mesh>
        <mesh position={[width / 2, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, depth]} />
          {solidWallMaterial}
        </mesh>

        {/* Front Solid Wall */}
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

        {/* Inner Glass Wall Left */}
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

        {/* Inner Glass Wall Right */}
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

      {/* --- PASSED ROOM A PROP --- */}
      <MeetingRoom
        position={[-(corridorWidth / 2 + roomWidth / 2), 0, 0]}
        width={roomWidth}
        depth={depth}
        zoneKey='zone_meeting_a'
        room='A'
      />

      {/* --- PASSED ROOM B PROP --- */}
      <MeetingRoom
        position={[corridorWidth / 2 + roomWidth / 2, 0, 0]}
        width={roomWidth}
        depth={depth}
        zoneKey='zone_meeting_b'
        room='B'
      />
    </group>
  );
}

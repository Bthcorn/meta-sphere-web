import type { ThreeElements } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

import { MeetingRoom } from '@/components/space/meeting-room/meeting-room';
import { MeetingFloorTiles } from '@/components/space/meeting-room/meeting-floor-tiles';

type MeetingAreaProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

const colorCommon = '#4b5563'; // Dark Gray (Exterior)
const colorMeeting = '#EDEADE'; // Alabaster (Interior / Side with the clock)

/**
 * Helper to render a wall with different colors for inside/outside faces.
 */
function TwoToneWall({
  args,
  position,
  orientation,
}: {
  args: [number, number, number];
  position: [number, number, number];
  orientation: 'left' | 'right' | 'front' | 'back';
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial attach='material-0' color={colorCommon} />
      <meshStandardMaterial attach='material-1' color={colorCommon} />
      <meshStandardMaterial attach='material-2' color={colorCommon} />
      <meshStandardMaterial attach='material-3' color={colorCommon} />
      <meshStandardMaterial attach='material-4' color={colorCommon} />
      <meshStandardMaterial attach='material-5' color={colorCommon} />

      {orientation === 'left' && <meshStandardMaterial attach='material-0' color={colorMeeting} />}
      {orientation === 'right' && <meshStandardMaterial attach='material-1' color={colorMeeting} />}
      {orientation === 'front' && <meshStandardMaterial attach='material-5' color={colorMeeting} />}
      {orientation === 'back' && <meshStandardMaterial attach='material-4' color={colorMeeting} />}
    </mesh>
  );
}

export function Meeting({ width, depth, ...props }: MeetingAreaProps) {
  // --- Standard Dimensions ---
  const wallThickness = 0.5;
  const glassThickness = 0.2;
  const wallHeight = 7;

  const bottomWallHeight = 0.5;
  const glassHeight = 5.5;
  const topWallHeight = 1.0;

  const bottomWallY = bottomWallHeight / 2;
  const glassY = bottomWallHeight + glassHeight / 2;
  const topWallY = bottomWallHeight + glassHeight + topWallHeight / 2;

  const corridorWidth = 3;
  const roomWidth = (width - corridorWidth) / 2;

  const roomDoorWidth = 2.5;
  const roomDoorHeight = 6;
  const doorDistanceFromFront = 1;
  const frontSegmentDepth = doorDistanceFromFront;
  const backSegmentDepth = depth - roomDoorWidth - frontSegmentDepth;

  const innerFrontZ = depth / 2 - frontSegmentDepth / 2;
  const innerDoorZ = depth / 2 - frontSegmentDepth - roomDoorWidth / 2;
  const innerBackZ = -depth / 2 + backSegmentDepth / 2;

  const leftInnerX = -corridorWidth / 2;
  const rightInnerX = corridorWidth / 2;

  const solidEndDepth = 2.5;
  const whiteboardCenterDepth = 4.0;
  const remainingDepthForWindows = depth - 2 * solidEndDepth - whiteboardCenterDepth;
  const windowDepth = remainingDepthForWindows / 2;

  const segment1Z_FrontSolid = depth / 2 - solidEndDepth / 2;
  const segment2Z_FrontWindow = depth / 2 - solidEndDepth - windowDepth / 2;
  const segment3Z_CenterWhiteboard = 0;
  const segment4Z_BackWindow = -depth / 2 + solidEndDepth + windowDepth / 2;
  const segment5Z_BackSolid = -depth / 2 + solidEndDepth / 2;

  // --- Materials ---
  const alabasterMaterial = <meshStandardMaterial color={colorMeeting} />;

  // Optimized Glass: meshStandardMaterial is much cheaper than meshPhysicalMaterial
  const glassMaterial = (
    <meshStandardMaterial
      color='#e0f2fe'
      transparent
      opacity={0.2}
      roughness={0.1}
      metalness={0.1}
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

      <MeetingFloorTiles width={width} depth={depth} />

      {/* --- WINDOW LIGHTS --- */}
      {[-width / 2, width / 2].map((xPos) =>
        [segment2Z_FrontWindow, segment4Z_BackWindow].map((zPos) => (
          <pointLight
            key={`light-${xPos}-${zPos}`}
            position={[xPos > 0 ? xPos - 0.5 : xPos + 0.5, 2.5, zPos]}
            intensity={20}
            distance={5}
            decay={2}
            color='#fed7aa'
          />
        ))
      )}

      <RigidBody type='fixed' colliders='cuboid'>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#111111' transparent opacity={0} />
        </mesh>

        <TwoToneWall
          orientation='back'
          position={[0, wallHeight / 2, -depth / 2]}
          args={[width, wallHeight, wallThickness]}
        />

        {(() => {
          const mainDoorWidth = 3;
          const mainDoorHeight = 6;
          const frontSideWidth = (width - mainDoorWidth) / 2;
          return (
            <group>
              <TwoToneWall
                orientation='front'
                position={[-(width / 2) + frontSideWidth / 2, wallHeight / 2, depth / 2]}
                args={[frontSideWidth, wallHeight, wallThickness]}
              />
              <TwoToneWall
                orientation='front'
                position={[width / 2 - frontSideWidth / 2, wallHeight / 2, depth / 2]}
                args={[frontSideWidth, wallHeight, wallThickness]}
              />
              <TwoToneWall
                orientation='front'
                position={[0, mainDoorHeight + 0.5, depth / 2]}
                args={[mainDoorWidth, 1.0, wallThickness]}
              />
            </group>
          );
        })()}

        {/* --- LEFT EXTERIOR WALL --- */}
        <group>
          <mesh position={[-width / 2, wallHeight / 2, segment1Z_FrontSolid]}>
            <boxGeometry args={[wallThickness, wallHeight, solidEndDepth]} />
            {alabasterMaterial}
          </mesh>
          <group>
            <mesh position={[-width / 2, bottomWallY, segment2Z_FrontWindow]}>
              <boxGeometry args={[wallThickness, bottomWallHeight, windowDepth]} />
              {alabasterMaterial}
            </mesh>
            <mesh position={[-width / 2, glassY, segment2Z_FrontWindow]}>
              <boxGeometry args={[glassThickness, glassHeight, windowDepth]} />
              {glassMaterial}
            </mesh>
            <mesh position={[-width / 2, topWallY, segment2Z_FrontWindow]}>
              <boxGeometry args={[wallThickness, topWallHeight, windowDepth]} />
              {alabasterMaterial}
            </mesh>
          </group>
          <mesh position={[-width / 2, wallHeight / 2, segment3Z_CenterWhiteboard]}>
            <boxGeometry args={[wallThickness, wallHeight, whiteboardCenterDepth]} />
            {alabasterMaterial}
          </mesh>
          <group>
            <mesh position={[-width / 2, bottomWallY, segment4Z_BackWindow]}>
              <boxGeometry args={[wallThickness, bottomWallHeight, windowDepth]} />
              {alabasterMaterial}
            </mesh>
            <mesh position={[-width / 2, glassY, segment4Z_BackWindow]}>
              <boxGeometry args={[glassThickness, glassHeight, windowDepth]} />
              {glassMaterial}
            </mesh>
            <mesh position={[-width / 2, topWallY, segment4Z_BackWindow]}>
              <boxGeometry args={[wallThickness, topWallHeight, windowDepth]} />
              {alabasterMaterial}
            </mesh>
          </group>
          <mesh position={[-width / 2, wallHeight / 2, segment5Z_BackSolid]}>
            <boxGeometry args={[wallThickness, wallHeight, solidEndDepth]} />
            {alabasterMaterial}
          </mesh>
        </group>

        {/* --- RIGHT EXTERIOR WALL --- */}
        <group>
          <mesh position={[width / 2, wallHeight / 2, segment1Z_FrontSolid]}>
            <boxGeometry args={[wallThickness, wallHeight, solidEndDepth]} />
            {alabasterMaterial}
          </mesh>
          <group>
            <mesh position={[width / 2, bottomWallY, segment2Z_FrontWindow]}>
              <boxGeometry args={[wallThickness, bottomWallHeight, windowDepth]} />
              {alabasterMaterial}
            </mesh>
            <mesh position={[width / 2, glassY, segment2Z_FrontWindow]}>
              <boxGeometry args={[glassThickness, glassHeight, windowDepth]} />
              {glassMaterial}
            </mesh>
            <mesh position={[width / 2, topWallY, segment2Z_FrontWindow]}>
              <boxGeometry args={[wallThickness, topWallHeight, windowDepth]} />
              {alabasterMaterial}
            </mesh>
          </group>
          <mesh position={[width / 2, wallHeight / 2, segment3Z_CenterWhiteboard]}>
            <boxGeometry args={[wallThickness, wallHeight, whiteboardCenterDepth]} />
            {alabasterMaterial}
          </mesh>
          <group>
            <mesh position={[width / 2, bottomWallY, segment4Z_BackWindow]}>
              <boxGeometry args={[wallThickness, bottomWallHeight, windowDepth]} />
              {alabasterMaterial}
            </mesh>
            <mesh position={[width / 2, glassY, segment4Z_BackWindow]}>
              <boxGeometry args={[glassThickness, glassHeight, windowDepth]} />
              {glassMaterial}
            </mesh>
            <mesh position={[width / 2, topWallY, segment4Z_BackWindow]}>
              <boxGeometry args={[wallThickness, topWallHeight, windowDepth]} />
              {alabasterMaterial}
            </mesh>
          </group>
          <mesh position={[width / 2, wallHeight / 2, segment5Z_BackSolid]}>
            <boxGeometry args={[wallThickness, wallHeight, solidEndDepth]} />
            {alabasterMaterial}
          </mesh>
        </group>

        {/* --- Glass Hallway Partitions --- */}
        <mesh position={[leftInnerX, wallHeight / 2, innerBackZ]}>
          <boxGeometry args={[glassThickness, wallHeight, backSegmentDepth]} />
          {glassMaterial}
        </mesh>
        <mesh position={[leftInnerX, wallHeight / 2, innerFrontZ]}>
          <boxGeometry args={[glassThickness, wallHeight, frontSegmentDepth]} />
          {glassMaterial}
        </mesh>
        <mesh position={[leftInnerX, roomDoorHeight + 0.5, innerDoorZ]}>
          <boxGeometry args={[glassThickness, 1.0, roomDoorWidth]} />
          {glassMaterial}
        </mesh>

        <mesh position={[rightInnerX, wallHeight / 2, innerBackZ]}>
          <boxGeometry args={[glassThickness, wallHeight, backSegmentDepth]} />
          {glassMaterial}
        </mesh>
        <mesh position={[rightInnerX, wallHeight / 2, innerFrontZ]}>
          <boxGeometry args={[glassThickness, wallHeight, frontSegmentDepth]} />
          {glassMaterial}
        </mesh>
        <mesh position={[rightInnerX, roomDoorHeight + 0.5, innerDoorZ]}>
          <boxGeometry args={[glassThickness, 1.0, roomDoorWidth]} />
          {glassMaterial}
        </mesh>
      </RigidBody>

      <Text
        position={[leftInnerX + 0.2, roomDoorHeight + 0.4, innerDoorZ]}
        fontSize={0.8}
        color='white'
        rotation={[0, Math.PI / 2, 0]}
      >
        Room A
      </Text>
      <Text
        position={[rightInnerX - 0.2, roomDoorHeight + 0.4, innerDoorZ]}
        fontSize={0.8}
        color='white'
        rotation={[0, -Math.PI / 2, 0]}
      >
        Room B
      </Text>

      <MeetingRoom
        position={[-(corridorWidth / 2 + roomWidth / 2), 0, 0]}
        width={roomWidth}
        depth={depth}
        zoneKey='zone_meeting_a'
        room='A'
      />
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

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ThreeElements } from '@react-three/fiber';
import { MeetingFurniture } from './meeting-furniture';

type MeetingRoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function MeetingRoom({ width, depth, ...props }: MeetingRoomProps) {
  return (
    <group {...props}>
      {/* Furniture is placed in the center of the pocket space */}
      <MeetingFurniture position={[0, 0, 0]} scale={0.85} />
    </group>
  );
}

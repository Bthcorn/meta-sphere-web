import type { ThreeElements } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { MeetingFurniture } from './meeting-furniture';
import { useSessionStore } from '@/store/session.store';
import { ZONE_CONFIG, type ZoneKey } from '@/config/zone-sessions';

/** Matches `Meeting` when area is `width={20}` and `depth={15}` (corridor 3). */
export const MEETING_AREA_WIDTH = 20;
export const MEETING_CORRIDOR_WIDTH = 3;
export const MEETING_AREA_DEPTH = 15;
export const MEETING_ROOM_WIDTH = (MEETING_AREA_WIDTH - MEETING_CORRIDOR_WIDTH) / 2;
export const MEETING_ROOM_DEPTH = MEETING_AREA_DEPTH;
export const MEETING_WALL_HEIGHT = 7;
export const MEETING_WALL_THICKNESS = 0.5;

// --- ADDED THE `room` PROP HERE ---
type MeetingRoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
  zoneKey: ZoneKey;
  room?: 'A' | 'B';
  /** Pass true to skip the internal zone-trigger sensor (e.g. when the room is sealed). */
  noTrigger?: boolean;
};

// --- GRABBED `room` FROM THE PROPS ---
export function MeetingRoom({
  width,
  depth,
  zoneKey,
  noTrigger,
  room = 'A',
  ...props
}: MeetingRoomProps) {
  const { enterZone, exitZone, enterArea, exitArea } = useSessionStore();
  const config = ZONE_CONFIG[zoneKey];

  return (
    <group {...props}>
      {/* --- PASSED `room` DOWN TO THE FURNITURE --- */}
      <MeetingFurniture position={[0, 0, 0]} scale={0.85} room={room} />

      {!noTrigger && (
        <RigidBody
          type='fixed'
          sensor
          onIntersectionEnter={() => {
            enterZone(zoneKey, config);
            enterArea(config);
          }}
          onIntersectionExit={() => {
            exitZone();
            exitArea();
          }}
        >
          <CuboidCollider args={[width / 2 - 0.5, 3, depth / 2 - 0.5]} position={[0, 1.5, 0]} />
        </RigidBody>
      )}
    </group>
  );
}

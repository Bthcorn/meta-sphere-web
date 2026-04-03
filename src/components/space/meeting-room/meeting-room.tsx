import type { ThreeElements } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { MeetingFurniture } from './meeting-furniture';
import { useSessionStore } from '@/store/session.store';
import { ZONE_CONFIG, type ZoneKey } from '@/config/zone-sessions';

type MeetingRoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
  zoneKey: ZoneKey;
  /** Pass true to skip the internal zone-trigger sensor (e.g. when the room is sealed). */
  noTrigger?: boolean;
};

export function MeetingRoom({ width, depth, zoneKey, noTrigger, ...props }: MeetingRoomProps) {
  const { enterZone, exitZone, enterArea, exitArea } = useSessionStore();
  const config = ZONE_CONFIG[zoneKey];

  return (
    <group {...props}>
      <MeetingFurniture position={[0, 0, 0]} scale={0.85} />

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

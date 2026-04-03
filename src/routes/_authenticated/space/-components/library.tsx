import { useMemo } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useSessionStore } from '@/store/session.store';
import { ZONE_CONFIG } from '@/config/zone-sessions';

// Import each component explicitly
import { Bookshelf } from '@/components/space/library/Bookshelf';
import { Couch } from '@/components/space/library/Couch';
import { Lamp } from '@/components/space/library/Lamp';
import { Pillow } from '@/components/space/library/Pillow';
import { Plant } from '@/components/space/library/Plant';
import { Table } from '@/components/space/library/Table';
import { Floor } from '@/components/space/library/Floor';
import { Chess } from '@/components/space/library/Chess';
import { WallLamp } from '@/components/space/library/Wall_lamp';

function BookshelfLabel() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        background: 'rgba(10, 8, 24, 0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#ffffff',
        padding: '5px 13px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='13'
        height='13'
        viewBox='0 0 24 24'
        fill='none'
        stroke='rgba(255,255,255,0.7)'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{ flexShrink: 0 }}
      >
        <path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' />
        <path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' />
      </svg>
      <span style={{ color: 'rgba(255,255,255,0.9)' }}>Library</span>
      <span
        style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 400,
          letterSpacing: '0.02em',
        }}
      >
        Browse &amp; Upload Files
      </span>
    </div>
  );
}

type RoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Library({ width, depth, ...props }: RoomProps) {
  const { enterZone, exitZone, enterArea, exitArea } = useSessionStore();
  const config = ZONE_CONFIG.zone_library;

  const columns = 5;
  const rows = 10;

  const scaleX = width / columns / 100;
  const scaleZ = depth / rows / 100;

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
  }, [width, depth, columns, rows]);

  const tableSetData = useMemo(
    () => [
      { id: 'back-left', x: -width / 5.5, z: -depth / 5.5 },
      { id: 'back-right', x: width / 5.5, z: -depth / 5.5 },
      { id: 'front-left', x: -width / 5.5, z: depth / 5.5 },
      { id: 'front-right', x: width / 5.5, z: depth / 5.5 },
    ],
    [width, depth]
  );

  return (
    <group {...props}>
      {/* Invisible Physics Floor */}
      <RigidBody type='fixed'>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#111111' transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Whole-room area sensor — fires when the player is anywhere in the library.
          Updates the voice bar label and chat context to "Library" immediately. */}
      <RigidBody
        type='fixed'
        sensor
        onIntersectionEnter={() => enterArea(config)}
        onIntersectionExit={() => exitArea()}
      >
        <CuboidCollider args={[width / 2 - 0.2, 3, depth / 2 - 0.2]} position={[0, 1.5, 0]} />
      </RigidBody>

      {/* ── Bookshelf proximity triggers ──────────────────────────────────────
          Each sensor sits in front of a bookshelf row. When the player walks
          within ~1.5 units of any shelf the Library panel opens. exitZone fires
          when they move away from ALL shelf sensors (last-one-out wins because
          Rapier fires onIntersectionExit per sensor, not per overall union). */}

      {/* Back-wall shelf row — player approaches from +Z side */}
      <RigidBody
        type='fixed'
        sensor
        onIntersectionEnter={() => enterZone('zone_library', config)}
        onIntersectionExit={() => exitZone()}
      >
        <CuboidCollider args={[width / 2 - 1, 2, 0.8]} position={[0, 1.5, -depth / 2 + 1.8]} />
      </RigidBody>

      {/* Front-wall shelf row — player approaches from -Z side */}
      <RigidBody
        type='fixed'
        sensor
        onIntersectionEnter={() => enterZone('zone_library', config)}
        onIntersectionExit={() => exitZone()}
      >
        <CuboidCollider args={[width / 2 - 1, 2, 0.8]} position={[0, 1.5, depth / 2 - 1.8]} />
      </RigidBody>

      {/* Right-wall couch-set bookshelf — player approaches from -X side */}
      <RigidBody
        type='fixed'
        sensor
        onIntersectionEnter={() => enterZone('zone_library', config)}
        onIntersectionExit={() => exitZone()}
      >
        <CuboidCollider args={[1.5, 2, 2]} position={[width / 2 - 3, 1.5, 0]} />
      </RigidBody>

      {/* Visual Tiled Floor */}
      <group>
        {tileData.map((tile) => (
          <Floor key={tile.id} position={tile.position} scale={[scaleX, 0.001, scaleZ]} />
        ))}
      </group>

      {/* --- BOOKSHELVES (Rows of 3) --- */}
      <Bookshelf position={[-width / 4, 0.1, -depth / 2 + 0.5]} scale={1} />
      <Bookshelf position={[0, 0.1, -depth / 2 + 0.5]} scale={1} />
      <Bookshelf position={[width / 4, 0.1, -depth / 2 + 0.5]} scale={1} />

      <Bookshelf
        position={[-width / 4, 0.1, depth / 2 - 0.5]}
        rotation={[0, Math.PI, 0]}
        scale={1}
      />
      <Bookshelf position={[0, 0.1, depth / 2 - 0.5]} rotation={[0, Math.PI, 0]} scale={1} />
      <Bookshelf
        position={[width / 4, 0.1, depth / 2 - 0.5]}
        rotation={[0, Math.PI, 0]}
        scale={1}
      />

      {/* --- WALL LAMPS --- */}
      <WallLamp
        position={[-width / 8, 3.5, -depth / 2 + 0.1]}
        rotation={[0, Math.PI, 0]}
        scale={1.5}
      />
      <WallLamp
        position={[width / 8, 3.5, -depth / 2 + 0.1]}
        rotation={[0, Math.PI, 0]}
        scale={1.5}
      />
      <WallLamp position={[-width / 8, 3.5, depth / 2 - 0.1]} scale={1.5} />
      <WallLamp position={[width / 8, 3.5, depth / 2 - 0.1]} scale={1.5} />

      {/* --- CENTRAL LAMP --- */}
      <Lamp position={[0, 0.1, 0]} scale={0.25} />

      {/* --- BACK WALL: Couch Set --- */}
      <group position={[width / 2 - 1.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Left Couch & Lamp */}
        <Couch position={[-3, 0.5, -0.5]} scale={1} />
        <WallLamp position={[-3, 3.5, -1.1]} rotation={[0, Math.PI, 0]} scale={1.5} />

        {/* Central Bookshelf */}
        <Bookshelf position={[0, 0.1, -0.7]} scale={1} />

        {/* Right Couch & Lamp */}
        <Couch position={[3, 0.5, -0.5]} scale={1} />
        <WallLamp position={[3, 3.5, -1.1]} rotation={[0, Math.PI, 0]} scale={1.5} />
      </group>

      {/* --- 4 CORNER PLANTS --- */}
      <Plant position={[-width / 2 + 1.2, 0.1, -depth / 2 + 1.2]} scale={0.25} />
      <Plant position={[width / 2 - 1.2, 0.1, -depth / 2 + 1.2]} scale={0.25} />
      <Plant position={[-width / 2 + 1.2, 0.1, depth / 2 - 1.2]} scale={0.25} />
      <Plant position={[width / 2 - 1.2, 0.1, depth / 2 - 1.2]} scale={0.25} />

      {/* --- TABLE SETS --- */}
      {tableSetData.map((set) => (
        <group key={set.id} position={[set.x, 0, set.z]}>
          <Table position={[0, 0.1, 0]} scale={2} />
          <Chess position={[0, 1.1, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.7} />
          <Pillow position={[1.2, 0.12, 0]} rotation={[0, (3 * Math.PI) / 2, 0]} scale={0.2} />
          <Pillow position={[-1.2, 0.12, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.2} />
          <Pillow position={[0, 0.12, 1.2]} rotation={[0, 0, 0]} scale={0.2} />
          <Pillow position={[0, 0.12, -1.2]} rotation={[0, Math.PI, 0]} scale={0.2} />
        </group>
      ))}

      {/* --- BOOKSHELF HTML INDICATORS --- */}
      {/* Back wall — floats above the centre shelf, visible from inside the room */}
      <Html position={[0, 3.6, -depth / 2 + 1.4]} center distanceFactor={9} occlude>
        <BookshelfLabel />
      </Html>

      {/* Front wall — faces the opposite direction */}
      <Html position={[0, 3.6, depth / 2 - 1.4]} center distanceFactor={9} occlude>
        <BookshelfLabel />
      </Html>
    </group>
  );
}

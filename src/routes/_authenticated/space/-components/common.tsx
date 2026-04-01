import { useMemo } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

import { Model as CommonFloor } from '@/components/space/common-room/Common_floor';
import { Model as Bass } from '@/components/space/common-room/Bass';
import { Model as CoffeeTable1 } from '@/components/space/common-room/Coffeetable1';
import { Model as CoffeeTable2 } from '@/components/space/common-room/Coffeetable2';
import { Model as CouchSmall } from '@/components/space/common-room/Common_couchsmall';
import { Model as CouchWide } from '@/components/space/common-room/Common_couchwide';
import { Model as Plant } from '@/components/space/common-room/Commonplant';
import { Model as Shelf1 } from '@/components/space/common-room/Shelf1';
import { Model as Shelf2 } from '@/components/space/common-room/Shelf2';
import { Model as Tv } from '@/components/space/common-room/Tv';
import { Model as WallCube } from '@/components/space/common-room/Wallcube';
import { Model as Clock } from '@/components/space/common-room/Clock';
import { Model as Rug } from '@/components/space/common-room/Rug';
import { Model as WallArt } from '@/components/space/common-room/Wall_art';
import { Model as BeanBag } from '@/components/space/common-room/Beanbag';
import { Lamp } from '@/components/space/common-room/Lamp';
import { Model as LampSmall } from '@/components/space/common-room/Lampsmall';

type RoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Common({ width, depth, ...props }: RoomProps) {
  const columns = 5;
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
  }, [width, depth, columns, rows]);

  // Pre-compute world positions so lights and meshes stay in sync
  const lampSmallWorldPos = {
    x: -5.6,
    y: 1.65,
    z: -depth / 2 + 0.5 + 0.2,
  };

  return (
    <group {...props}>
      {/* ── PHYSICS FLOOR ── */}
      <RigidBody type='fixed'>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color='#111111' transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* ── TILED FLOOR ── */}
      <group>
        {tileData.map((tile) => (
          <CommonFloor key={tile.id} position={tile.position} scale={[scaleX, 1, scaleZ]} />
        ))}
      </group>

      {/* ══════════════════════════════════════════════
          LIGHTS — placed in world space, no parent scale
         ══════════════════════════════════════════════ */}

      {/* 📺 TV bias lights */}
      <pointLight
        position={[-width / 2 + 0.5 + -0.2, 3, 4 + 0]}
        intensity={150}
        distance={3}
        decay={5}
        color='#ff1a1a'
      />
      <pointLight
        position={[-width / 2 + 0.5 + -0.2, 3, 4 + 1]}
        intensity={150}
        distance={3}
        decay={5}
        color='#ff1a1a'
      />
      <pointLight
        position={[-width / 2 + 0.5 + -0.2, 3, 4 + -1]}
        intensity={150}
        distance={3}
        decay={5}
        color='#ff1a1a'
      />

      {/* 🕯️ Small shelf lamp — world position, unaffected by scale */}
      <pointLight
        position={[lampSmallWorldPos.x, lampSmallWorldPos.y, lampSmallWorldPos.z]}
        intensity={5}
        distance={2}
        decay={2}
        color='#ff9900'
      />

      {/* ══════════════════════════════════════════════
          FURNITURE
         ══════════════════════════════════════════════ */}

      {/* --- MAIN TV & LOUNGE AREA --- */}
      <group position={[-width / 2 + 0.5, 0, 4]}>
        <Shelf2 position={[0, 0, 0]} scale={2} rotation={[0, Math.PI / 2, 0]} />
        <Tv position={[-0.2, 3, 0]} scale={2} rotation={[0, Math.PI / 2, 0]} />
        <Rug position={[10, 0.02, -3]} scale={3} rotation={[0, Math.PI / 2, 0]} color='#2f4f4f' />
        <CoffeeTable1 position={[3, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={1.5} />
        <CouchWide position={[6, 0.6, 0]} scale={3} rotation={[0, Math.PI / 2, 0]} />
        <CouchSmall position={[3, 0, -4]} scale={0.8} rotation={[0, 0, 0]} />
      </group>

      {/* --- BACK WALL STORAGE, CORNER NOOK & DECOR --- */}
      <group position={[0, 0, -depth / 2 + 0.5]}>
        <Shelf1 position={[-9.6, 1.7, 2.4]} scale={2} rotation={[0, 0, 0]} />
        <Shelf1 position={[-7.4, 1.7, 0.2]} scale={2} rotation={[0, Math.PI / 2, 0]} />
        {/* Mesh only — light is above in world space */}
        <LampSmall position={[-5.6, 1.65, 0.2]} scale={170} rotation={[Math.PI / 2, Math.PI, 0]} />
        <BeanBag
          position={[-7, 0.1, 2.7]}
          scale={2}
          rotation={[0, Math.PI / 5.5, 0]}
          color='#b8860b'
        />
        <Clock position={[-9.9, 4, 5]} scale={0.03} rotation={[0, 0, 0]} />
        <WallArt position={[5.5, 3, -0.2]} scale={3} rotation={[0, -Math.PI, 0]} />
      </group>

      {/* --- SECONDARY HANGOUT AREA --- */}
      <group position={[width / 4, 0, 0]}>
        <CoffeeTable2 position={[0, 0, 2.5]} scale={2} />
        <CouchSmall position={[0, 0, -0.5]} scale={0.8} rotation={[0, 0, 0]} />
        <CouchSmall position={[0, 0, 5.5]} scale={0.8} rotation={[0, Math.PI, 0]} />
        <CouchSmall position={[3.5, 0, 2.5]} scale={0.8} rotation={[0, -Math.PI / 2, 0]} />
        {/* Mesh only — light is above in world space */}
        <Lamp position={[2, 0.1, 5]} scale={0.25} rotation={[0, -Math.PI / 2, 0]} />
      </group>

      {/* --- MUSIC CORNER --- */}
      <group position={[-width / 2 + 1.5, 0, depth / 2 - 1.5]}>
        <Bass position={[-1, 0.5, 1]} scale={0.1} rotation={[0.2, Math.PI / 4, 0]} />
        <WallCube position={[2, 3, 1.5]} scale={1.2} rotation={[0, Math.PI, 0]} />
      </group>

      {/* --- PLANTS --- */}
      <Plant position={[-width / 2 + 0.7, 0, 1]} scale={1.2} />
      <Plant position={[width / 2 - 1.5, 0, 6.8]} scale={1.2} />
    </group>
  );
}

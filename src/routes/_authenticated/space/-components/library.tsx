import { useMemo } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

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

type RoomProps = ThreeElements['group'] & {
  width: number;
  depth: number;
};

export function Library({ width, depth, ...props }: RoomProps) {
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
    </group>
  );
}

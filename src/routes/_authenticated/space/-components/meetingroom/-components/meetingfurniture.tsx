import type { ThreeElements } from '@react-three/fiber';
import { Chair } from './chair';
import { Table } from './table';
import { Laptop } from './laptop';
import { Screen } from './screen'; // 1. Import your new Screen!

type MeetingFurnitureProps = ThreeElements['group'];

export function MeetingFurniture(props: MeetingFurnitureProps) {
  const s = 0.15;

  const centerX = -0.13;
  const centerZ = -3.81;

  const getPos = (x: number, y: number, z: number): [number, number, number] => [
    x * s + centerX,
    y * s,
    z * s + centerZ,
  ];

  return (
    <group {...props}>
      {/* --- NEW PRESENTATION SCREEN --- */}
      {/* Mounted perfectly on the back wall */}
      <Screen position={[0, 4.5, -8.5]} />

      {/* Table */}
      <Table position={[centerX, 0, centerZ]} scale={s} />

      {/* Chairs */}
      <Chair position={getPos(1.1, 0, 43.9)} rotation={[-Math.PI / 2, 0, -Math.PI]} scale={s} />
      <Chair
        position={getPos(-11.0, 0, 35.0)}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        scale={s}
      />
      <Chair
        position={getPos(-11.0, 0, 25.8)}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        scale={s}
      />
      <Chair
        position={getPos(-11.0, 0, 16.9)}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        scale={s}
      />
      <Chair
        position={getPos(13.2, 0, 25.7)}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        scale={s}
      />
      <Chair
        position={getPos(13.2, 0, 34.8)}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        scale={s}
      />
      <Chair
        position={getPos(13.2, 0, 16.7)}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        scale={s}
      />

      {/* Laptops */}
      <Laptop
        variant={0}
        position={getPos(5.0, 2.5, 29.1)}
        rotation={[0, -Math.PI / 2, 0]}
        scale={s}
      />
      <Laptop
        variant={1}
        position={getPos(5.0, 2.5, 37.9)}
        rotation={[0, -Math.PI / 2, 0]}
        scale={s}
      />
      <Laptop
        variant={2}
        position={getPos(5.0, 2.5, 46.9)}
        rotation={[0, -Math.PI / 2, 0]}
        scale={s}
      />
      <Laptop
        variant={3}
        position={getPos(-2.5, 2.5, 21.9)}
        rotation={[0, Math.PI / 2, 0]}
        scale={s}
      />
      <Laptop
        variant={4}
        position={getPos(-2.5, 2.5, 12.7)}
        rotation={[0, Math.PI / 2, 0]}
        scale={s}
      />
      <Laptop
        variant={5}
        position={getPos(-2.5, 2.5, 3.9)}
        rotation={[0, Math.PI / 2, 0]}
        scale={s}
      />
      <Laptop
        variant={6}
        position={getPos(-11.5, 2.5, 36.5)}
        rotation={[-Math.PI, 0, -Math.PI]}
        scale={s}
      />
    </group>
  );
}

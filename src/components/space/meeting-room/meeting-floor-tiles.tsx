import { useMemo } from 'react';
import { Model as MeetingFloor } from './Meeting_floor';

/** Same grid and scale as `Meeting` (4×7 tiles, model scale 3.5). */
export function MeetingFloorTiles({ width, depth }: { width: number; depth: number }) {
  const columns = 4;
  const rows = 7;
  const scaleX = width / columns / 3.5;
  const scaleZ = depth / rows / 3.5;

  const tileData = useMemo(() => {
    const tiles: { id: string; position: [number, number, number] }[] = [];
    const tileW = width / columns;
    const tileD = depth / rows;

    for (let x = 0; x < columns; x++) {
      for (let z = 0; z < rows; z++) {
        const posX = x * tileW - width / 2 + tileW / 2;
        const posZ = z * tileD - depth / 2 + tileD / 2;

        tiles.push({
          id: `${x}-${z}`,
          position: [posX, 0.01, posZ],
        });
      }
    }
    return tiles;
  }, [width, depth]);

  return (
    <group>
      {tileData.map((tile) => (
        <MeetingFloor key={tile.id} position={tile.position} scale={[scaleX, 1, scaleZ]} />
      ))}
    </group>
  );
}

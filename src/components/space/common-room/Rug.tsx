import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

// We extend the props to accept an optional custom color
type RugProps = ThreeElements['group'] & {
  color?: string;
};

type GLTFResult = GLTF & {
  nodes: {
    Cube002: THREE.Mesh;
  };
  materials: {
    phong1SG: THREE.MeshStandardMaterial;
  };
};

export function Model({ color, ...props }: RugProps) {
  const { nodes, materials } = useGLTF('/rug.glb') as unknown as GLTFResult;

  // Clone the material so we safely apply the color without breaking the cached GLB
  const customMaterial = useMemo(() => {
    const mat = materials.phong1SG.clone();

    // If you pass a color prop, it will tint the rug's material!
    if (color) {
      mat.color.set(color);
    }

    return mat;
  }, [materials.phong1SG, color]);

  return (
    <group {...props} dispose={null}>
      {/* If the player trips on the rug, change colliders='hull' to colliders={false} */}
      <mesh geometry={nodes.Cube002.geometry} material={customMaterial} />
    </group>
  );
}

useGLTF.preload('/rug.glb');

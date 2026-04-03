import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

// Extend the props to accept our custom color string
type BeanbagProps = ThreeElements['group'] & {
  color?: string;
};

type GLTFResult = GLTF & {
  nodes: {
    Cube_Cube007: THREE.Mesh;
  };
  materials: {
    BeanBag: THREE.MeshStandardMaterial;
  };
};

export function Model({ color, ...props }: BeanbagProps) {
  const { nodes, materials } = useGLTF('/beanbag.glb') as unknown as GLTFResult;

  // Clone the material so we safely apply the color without breaking the original asset
  const customMaterial = useMemo(() => {
    const mat = materials.BeanBag.clone();

    // If a color is passed in via props, paint the beanbag!
    if (color) {
      mat.color.set(color);
    }

    return mat;
  }, [materials.BeanBag, color]);

  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh geometry={nodes.Cube_Cube007.geometry} material={customMaterial} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/beanbag.glb');

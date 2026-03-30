import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    crate_lid: THREE.Mesh;
  };
  materials: {
    restaurant: THREE.MeshStandardMaterial;
  };
};

export function Floor(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/floor.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.crate_lid.geometry} material={materials.restaurant} scale={6000} />
    </group>
  );
}

useGLTF.preload('/floor.glb');

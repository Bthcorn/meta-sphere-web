import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Table_large_circular: THREE.Mesh;
  };
  materials: {
    Material: THREE.MeshStandardMaterial;
  };
};

export function Table(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/table.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      {/* Trimesh is perfect for circular tables. 
        It ensures the player can walk smoothly around the curved edge 
        without bumping into invisible square corners.
      */}
      <RigidBody type='fixed' colliders='trimesh'>
        <mesh
          geometry={nodes.Table_large_circular.geometry}
          material={materials.Material}
          scale={100}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/table.glb');

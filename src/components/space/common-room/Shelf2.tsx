import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Shelf_Small1: THREE.Mesh;
  };
  materials: {
    White: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/shelf2.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh
          geometry={nodes.Shelf_Small1.geometry}
          material={materials.White}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/shelf2.glb');

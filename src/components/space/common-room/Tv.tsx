import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Tv1: THREE.Mesh;
  };
  materials: {
    Tv1: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/tv.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh
          geometry={nodes.Tv1.geometry}
          material={materials.Tv1}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/tv.glb');

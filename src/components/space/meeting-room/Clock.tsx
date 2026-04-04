import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Analog_Cock: THREE.Mesh;
  };
  materials: {
    Mat: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/clock.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh geometry={nodes.Analog_Cock.geometry} material={materials.Mat} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/clock.glb');

import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Couch_Small2_1: THREE.Mesh;
    Couch_Small2_2: THREE.Mesh;
  };
  materials: {
    Couch_BeigeDark: THREE.MeshStandardMaterial;
    Couch_Beige: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/common_couchsmall.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Couch_Small2_1.geometry} material={materials.Couch_BeigeDark} />
          <mesh geometry={nodes.Couch_Small2_2.geometry} material={materials.Couch_Beige} />
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/common_couchsmall.glb');

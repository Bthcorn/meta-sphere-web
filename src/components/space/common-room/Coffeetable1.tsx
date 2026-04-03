import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    ['Node-Mesh']: THREE.Mesh;
    ['Node-Mesh_1']: THREE.Mesh;
  };
  materials: {
    mat23: THREE.MeshStandardMaterial;
    mat24: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/coffeetable1.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh geometry={nodes['Node-Mesh'].geometry} material={materials.mat23} />
        <mesh geometry={nodes['Node-Mesh_1'].geometry} material={materials.mat24} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/coffeetable1.glb');

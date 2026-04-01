import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    ['Node-Mesh']: THREE.Mesh;
    ['Node-Mesh_1']: THREE.Mesh;
    ['Node-Mesh_2']: THREE.Mesh;
    ['Node-Mesh_3']: THREE.Mesh;
  };
  materials: {
    mat23: THREE.MeshStandardMaterial;
    mat17: THREE.MeshStandardMaterial;
    mat16: THREE.MeshStandardMaterial;
    mat20: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/common_couchwide.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh geometry={nodes['Node-Mesh'].geometry} material={materials.mat23} />
        <mesh geometry={nodes['Node-Mesh_1'].geometry} material={materials.mat17} />
        <mesh geometry={nodes['Node-Mesh_2'].geometry} material={materials.mat16} />
        <mesh geometry={nodes['Node-Mesh_3'].geometry} material={materials.mat20} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/common_couchwide.glb');

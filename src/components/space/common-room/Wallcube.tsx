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
    mat8: THREE.MeshStandardMaterial;
    mat21: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/wallcube.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh geometry={nodes['Node-Mesh'].geometry} material={materials.mat8} />
        <mesh geometry={nodes['Node-Mesh_1'].geometry} material={materials.mat21} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/wallcube.glb');

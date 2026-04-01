import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Electric_Guitar_Cube035_1: THREE.Mesh;
    Electric_Guitar_Cube035_1_1: THREE.Mesh;
    Electric_Guitar_Cube035_1_2: THREE.Mesh;
    Electric_Guitar_Cube035_1_3: THREE.Mesh;
  };
  materials: {
    F44336: THREE.MeshStandardMaterial;
    ['795548']: THREE.MeshStandardMaterial;
    ['455A64']: THREE.MeshStandardMaterial;
    FFFFFF: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/bass.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh geometry={nodes.Electric_Guitar_Cube035_1.geometry} material={materials.F44336} />
        <mesh
          geometry={nodes.Electric_Guitar_Cube035_1_1.geometry}
          material={materials['795548']}
        />
        <mesh
          geometry={nodes.Electric_Guitar_Cube035_1_2.geometry}
          material={materials['455A64']}
        />
        <mesh geometry={nodes.Electric_Guitar_Cube035_1_3.geometry} material={materials.FFFFFF} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/bass.glb');

import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Houseplant_6_1: THREE.Mesh;
    Houseplant_6_2: THREE.Mesh;
    Houseplant_6_3: THREE.Mesh;
  };
  materials: {
    Grey: THREE.MeshStandardMaterial;
    Brown: THREE.MeshStandardMaterial;
    Plant_Green: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/commonplant.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Houseplant_6_1.geometry} material={materials.Grey} />
          <mesh geometry={nodes.Houseplant_6_2.geometry} material={materials.Brown} />
          <mesh geometry={nodes.Houseplant_6_3.geometry} material={materials.Plant_Green} />
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/commonplant.glb');

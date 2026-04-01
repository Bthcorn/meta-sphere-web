import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    group252943910: THREE.Mesh;
    group530080379: THREE.Mesh;
    group921275821: THREE.Mesh;
    group431821521: THREE.Mesh;
    group659176328: THREE.Mesh;
    group1808194429: THREE.Mesh;
    group174979704: THREE.Mesh;
    group890327909: THREE.Mesh;
    group1082046218: THREE.Mesh;
    group555946532: THREE.Mesh;
    group1813242810: THREE.Mesh;
    group1750653242: THREE.Mesh;
    group807391238: THREE.Mesh;
  };
  materials: {
    mat23: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/shelf1.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh geometry={nodes.group252943910.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group530080379.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group921275821.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group431821521.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group659176328.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group1808194429.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group174979704.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group890327909.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group1082046218.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group555946532.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group1813242810.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group1750653242.geometry} material={materials.mat23} />
        <mesh geometry={nodes.group807391238.geometry} material={materials.mat23} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/shelf1.glb');

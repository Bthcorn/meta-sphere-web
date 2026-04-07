import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    mesh2124208635: THREE.Mesh;
    mesh2124208635_1: THREE.Mesh;
    mesh1395910603: THREE.Mesh;
    mesh1395910603_1: THREE.Mesh;
    mesh428381769: THREE.Mesh;
    mesh428381769_1: THREE.Mesh;
    mesh1941367129: THREE.Mesh;
    mesh1941367129_1: THREE.Mesh;
    mesh586405494: THREE.Mesh;
    mesh586405494_1: THREE.Mesh;
    mesh1205836072: THREE.Mesh;
    mesh1205836072_1: THREE.Mesh;
    mesh1697498613: THREE.Mesh;
    mesh1697498613_1: THREE.Mesh;
    mesh326288606: THREE.Mesh;
    mesh326288606_1: THREE.Mesh;
    mesh176244983: THREE.Mesh;
    mesh176244983_1: THREE.Mesh;
    mesh1745354410: THREE.Mesh;
    mesh1745354410_1: THREE.Mesh;
    mesh156735920: THREE.Mesh;
    mesh156735920_1: THREE.Mesh;
  };
  materials: {
    mat19: THREE.MeshStandardMaterial;
    mat20: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/common_floor.glb') as unknown as GLTFResult;

  // Clone materials to safely alter colors to Dark Grey
  const darkGreyMat19 = useMemo(() => {
    const mat = materials.mat19.clone();
    mat.color.set('#2b2b2b'); // Lighter dark grey
    return mat;
  }, [materials.mat19]);

  const darkGreyMat20 = useMemo(() => {
    const mat = materials.mat20.clone();
    mat.color.set('#1a1a1a'); // Darker grey for contrast
    return mat;
  }, [materials.mat20]);

  return (
    <group {...props} dispose={null}>
      {/* colliders={false} removes the bumpiness while keeping it in the engine */}
      <RigidBody type='fixed' colliders={false}>
        <group>
          <mesh geometry={nodes.mesh2124208635.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh2124208635_1.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh1395910603.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh1395910603_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh428381769.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh428381769_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh1941367129.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh1941367129_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh586405494.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh586405494_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh1205836072.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh1205836072_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh1697498613.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh1697498613_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh326288606.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh326288606_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh176244983.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh176244983_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh1745354410.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh1745354410_1.geometry} material={darkGreyMat19} />
          <mesh geometry={nodes.mesh156735920.geometry} material={darkGreyMat20} />
          <mesh geometry={nodes.mesh156735920_1.geometry} material={darkGreyMat19} />
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/common_floor.glb');

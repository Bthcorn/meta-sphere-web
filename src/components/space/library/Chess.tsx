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
    mat21: THREE.MeshStandardMaterial;
    mat23: THREE.MeshStandardMaterial;
  };
};

export function Chess(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/chess.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      {/* Using "cuboid" for a chess board is usually more efficient than trimesh 
        since boards are flat squares, but you can use "trimesh" if the pieces 
        are part of the same mesh and you want detailed collision.
      */}
      <RigidBody type='fixed' colliders='cuboid'>
        <mesh geometry={nodes['Node-Mesh'].geometry} material={materials.mat21} />
        <mesh geometry={nodes['Node-Mesh_1'].geometry} material={materials.mat23} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/chess.glb');

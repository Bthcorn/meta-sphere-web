import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Cube_1: THREE.Mesh;
    Cube_2: THREE.Mesh;
    Cube_3: THREE.Mesh;
    Cube_4: THREE.Mesh;
    Cube_5: THREE.Mesh;
    Cube_6: THREE.Mesh;
    Cube_7: THREE.Mesh;
    Cube_8: THREE.Mesh;
    Cube_9: THREE.Mesh;
  };
  materials: {
    Material: THREE.MeshStandardMaterial;
    ['Material.008']: THREE.MeshStandardMaterial;
    ['Material.006']: THREE.MeshStandardMaterial;
    ['Material.005']: THREE.MeshStandardMaterial;
    ['Material.007']: THREE.MeshStandardMaterial;
    ['Material.002']: THREE.MeshStandardMaterial;
    ['Material.001']: THREE.MeshStandardMaterial;
    ['Material.003']: THREE.MeshStandardMaterial;
    ['Material.004']: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/whiteboard.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      {/* Added RigidBody with trimesh colliders. 
          This makes the board a physical solid object in the room.
      */}
      <RigidBody type='fixed' colliders='trimesh'>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={[60, 80, 0.1]}>
          <mesh geometry={nodes.Cube_1.geometry} material={materials.Material} />
          <mesh geometry={nodes.Cube_2.geometry} material={materials['Material.008']} />
          <mesh geometry={nodes.Cube_3.geometry} material={materials['Material.006']} />
          <mesh geometry={nodes.Cube_4.geometry} material={materials['Material.005']} />
          <mesh geometry={nodes.Cube_5.geometry} material={materials['Material.007']} />
          <mesh geometry={nodes.Cube_6.geometry} material={materials['Material.002']} />
          <mesh geometry={nodes.Cube_7.geometry} material={materials['Material.001']} />
          <mesh geometry={nodes.Cube_8.geometry} material={materials['Material.003']} />
          <mesh geometry={nodes.Cube_9.geometry} material={materials['Material.004']} />
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/whiteboard.glb');

import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    pCube74_Table_0: THREE.Mesh;
    pCube77_Table_0: THREE.Mesh;
    pCube78_Table_0: THREE.Mesh;
  };
  materials: {
    Table: THREE.MeshStandardMaterial;
  };
};

type TableProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

export function Table({ position, rotation, scale = 1 }: TableProps) {
  const { nodes, materials } = useGLTF('/meeting_room.glb') as unknown as GLTFResult;

  return (
    <RigidBody
      type='fixed'
      position={position}
      rotation={rotation}
      scale={scale}
      colliders='cuboid'
    >
      <group>
        {/* --- THE TABLE TOP --- */}
        {/* Re-added the hardcoded baked position and scale from the GLB */}
        <mesh
          geometry={nodes.pCube74_Table_0.geometry}
          material={materials.Table}
          position={[1.446, 4.94, 26.146]}
          scale={[15.939, 6.326, 27.756]}
        />

        {/* --- THE LEGS --- */}
        <mesh
          geometry={nodes.pCube77_Table_0.geometry}
          material={materials.Table}
          position={[1.182, 7.482, 36.735]}
          scale={0.598}
        />
        <mesh
          geometry={nodes.pCube78_Table_0.geometry}
          material={materials.Table}
          position={[1.182, 7.482, 15.429]}
          scale={0.598}
        />
      </group>
    </RigidBody>
  );
}

useGLTF.preload('/meeting_room.glb');

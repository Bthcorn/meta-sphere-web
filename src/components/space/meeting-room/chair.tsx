import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    weaving3DAlanaOfficeChairFabricMesh001_chair_0: THREE.Mesh;
    weaving3DAlanaOfficeChairFabricSeater001_weaving3DFabric001_0: THREE.Mesh;
    weaving3DAlanaOfficeChairPlastic001_AlanaOfficeChairPlastic_0: THREE.Mesh;
    weaving3DAlanaOfficeChairMetal001_AlanaOfficeChairMetal001_0: THREE.Mesh;
  };
  materials: {
    chair: THREE.MeshStandardMaterial;
    weaving3DFabric001: THREE.MeshStandardMaterial;
    AlanaOfficeChairPlastic: THREE.MeshStandardMaterial;
    AlanaOfficeChairMetal001: THREE.MeshStandardMaterial;
  };
};

type ChairProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

export function Chair({ position, rotation, scale = 1 }: ChairProps) {
  const { nodes, materials } = useGLTF('/meeting_room.glb') as unknown as GLTFResult;
  return (
    <RigidBody
      type='fixed'
      position={position}
      rotation={rotation}
      scale={scale} // Applied to physics
      colliders='cuboid'
    >
      <group scale={0.112}>
        <mesh
          geometry={nodes.weaving3DAlanaOfficeChairFabricMesh001_chair_0.geometry}
          material={materials.chair}
        />
        <mesh
          geometry={nodes.weaving3DAlanaOfficeChairFabricSeater001_weaving3DFabric001_0.geometry}
          material={materials.weaving3DFabric001}
        />
        <mesh
          geometry={nodes.weaving3DAlanaOfficeChairPlastic001_AlanaOfficeChairPlastic_0.geometry}
          material={materials.AlanaOfficeChairPlastic}
        />
        <mesh
          geometry={nodes.weaving3DAlanaOfficeChairMetal001_AlanaOfficeChairMetal001_0.geometry}
          material={materials.AlanaOfficeChairMetal001}
        />
      </group>
    </RigidBody>
  );
}

useGLTF.preload('/meeting_room.glb');

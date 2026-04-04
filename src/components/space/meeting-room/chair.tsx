import * as THREE from 'three';
import { useMemo } from 'react';
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

  // Clone the fabric seat material
  const darkGreyFabric = useMemo(() => {
    const mat = materials.weaving3DFabric001.clone();
    mat.color.set('#333333'); // Dark Grey
    return mat;
  }, [materials.weaving3DFabric001]);

  // Clone the fabric backrest/mesh material
  const darkGreyMesh = useMemo(() => {
    const mat = materials.chair.clone();
    mat.color.set('#333333'); // Dark Grey
    return mat;
  }, [materials.chair]);

  return (
    <RigidBody
      type='fixed'
      position={position}
      rotation={rotation}
      scale={scale} // Applied to physics
      colliders='cuboid'
    >
      <group scale={0.112}>
        {/* Fabric Backrest updated to Dark Grey */}
        <mesh
          geometry={nodes.weaving3DAlanaOfficeChairFabricMesh001_chair_0.geometry}
          material={darkGreyMesh}
        />
        {/* Fabric Seat updated to Dark Grey */}
        <mesh
          geometry={nodes.weaving3DAlanaOfficeChairFabricSeater001_weaving3DFabric001_0.geometry}
          material={darkGreyFabric}
        />
        {/* Plastic and Metal left exactly as they were */}
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

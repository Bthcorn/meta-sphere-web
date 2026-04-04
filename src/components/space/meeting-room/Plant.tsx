import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    RubberFigPottedPlant_mesh: THREE.Mesh;
  };
  materials: {
    RubberFigPottedPlant_mat: THREE.MeshStandardMaterial;
  };
};

export function Plant(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/plant.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      {/* Using trimesh for the plant ensures the collision fits the pot 
        and the leaves perfectly. This prevents that "walking on air" 
        feeling when moving past organic shapes.
      */}
      <RigidBody type='fixed' colliders='trimesh'>
        <mesh
          geometry={nodes.RubberFigPottedPlant_mesh.geometry}
          material={materials.RubberFigPottedPlant_mat}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/plant.glb');

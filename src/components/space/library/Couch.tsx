import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    ThreeSeaterCouch1: THREE.Mesh;
    Pad4ThreeSeaterCouch1: THREE.Mesh;
    Pad5ThreeSeaterCouch1: THREE.Mesh;
    Pad6ThreeSeaterCouch1: THREE.Mesh;
    Pad1ThreeSeaterCouch1: THREE.Mesh;
    Pad2ThreeSeaterCouch1: THREE.Mesh;
    Pad3ThreeSeaterCouch1: THREE.Mesh;
  };
  materials: {
    ThreeSeaterCouch1: THREE.MeshStandardMaterial;
    Pad4ThreeSeaterCouch1: THREE.MeshStandardMaterial;
    Pad5ThreeSeaterCouch1: THREE.MeshStandardMaterial;
    Pad6ThreeSeaterCouch1: THREE.MeshStandardMaterial;
    Pad1ThreeSeaterCouch1: THREE.MeshStandardMaterial;
    Pad2ThreeSeaterCouch1: THREE.MeshStandardMaterial;
    Pad3ThreeSeaterCouch1: THREE.MeshStandardMaterial;
  };
};

export function Couch(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/couch.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      {/* Wrapping all couch parts in a single trimesh RigidBody.
        This allows the player to walk on/sit on the cushions accurately.
      */}
      <RigidBody type='fixed' colliders='trimesh'>
        <mesh
          geometry={nodes.ThreeSeaterCouch1.geometry}
          material={materials.ThreeSeaterCouch1}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Pad4ThreeSeaterCouch1.geometry}
          material={materials.Pad4ThreeSeaterCouch1}
          position={[-0.701, -0.094, 0.153]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Pad5ThreeSeaterCouch1.geometry}
          material={materials.Pad5ThreeSeaterCouch1}
          position={[0.005, -0.094, 0.153]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Pad6ThreeSeaterCouch1.geometry}
          material={materials.Pad6ThreeSeaterCouch1}
          position={[0.718, -0.094, 0.153]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Pad1ThreeSeaterCouch1.geometry}
          material={materials.Pad1ThreeSeaterCouch1}
          position={[-0.696, 0.317, -0.233]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Pad2ThreeSeaterCouch1.geometry}
          material={materials.Pad2ThreeSeaterCouch1}
          position={[0.002, 0.317, -0.233]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          geometry={nodes.Pad3ThreeSeaterCouch1.geometry}
          material={materials.Pad3ThreeSeaterCouch1}
          position={[0.715, 0.317, -0.233]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/couch.glb');

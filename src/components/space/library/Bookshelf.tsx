import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    BookCase_Single_1: THREE.Mesh;
    BookCase_Single_2: THREE.Mesh;
    BookCase_Single_3: THREE.Mesh;
    BookCase_Single_4: THREE.Mesh;
    BookCase_Single_5: THREE.Mesh;
    BookCase_Single_6: THREE.Mesh;
    BookCase_Single_7: THREE.Mesh;
    BookCase_Single_8: THREE.Mesh;
    BookCase_Single_9: THREE.Mesh;
    BookCase_Single_10: THREE.Mesh;
    BookCase_RightDoor_1: THREE.Mesh;
    BookCase_RightDoor_2: THREE.Mesh;
    BookCase_LeftDoor_1: THREE.Mesh;
    BookCase_LeftDoor_2: THREE.Mesh;
  };
  materials: {
    Wood1: THREE.MeshStandardMaterial;
    Wood2: THREE.MeshStandardMaterial;
    DarkWood: THREE.MeshStandardMaterial;
    Cover1: THREE.MeshStandardMaterial;
    Pages: THREE.MeshStandardMaterial;
    Cover6: THREE.MeshStandardMaterial;
    Cover2: THREE.MeshStandardMaterial;
    Cover3: THREE.MeshStandardMaterial;
    Cover4: THREE.MeshStandardMaterial;
    Cover5: THREE.MeshStandardMaterial;
    Metal: THREE.MeshStandardMaterial;
  };
};

export function Bookshelf(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/bookshelf.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      {/* Main bookcase body — trimesh for accurate shelf/wall shape */}
      <RigidBody type='fixed' colliders='trimesh'>
        <group position={[0.004, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.BookCase_Single_1.geometry} material={materials.Wood1} />
          <mesh geometry={nodes.BookCase_Single_2.geometry} material={materials.Wood2} />
          <mesh geometry={nodes.BookCase_Single_3.geometry} material={materials.DarkWood} />
          <mesh geometry={nodes.BookCase_Single_4.geometry} material={materials.Cover1} />
          <mesh geometry={nodes.BookCase_Single_5.geometry} material={materials.Pages} />
          <mesh geometry={nodes.BookCase_Single_6.geometry} material={materials.Cover6} />
          <mesh geometry={nodes.BookCase_Single_7.geometry} material={materials.Cover2} />
          <mesh geometry={nodes.BookCase_Single_8.geometry} material={materials.Cover3} />
          <mesh geometry={nodes.BookCase_Single_9.geometry} material={materials.Cover4} />
          <mesh geometry={nodes.BookCase_Single_10.geometry} material={materials.Cover5} />
        </group>
      </RigidBody>

      {/* Right door — separate RigidBody so it can be animated/swung independently */}
      <RigidBody type='fixed' colliders='trimesh'>
        <group position={[0.775, 0.588, 0.299]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.BookCase_RightDoor_1.geometry} material={materials.DarkWood} />
          <mesh geometry={nodes.BookCase_RightDoor_2.geometry} material={materials.Metal} />
        </group>
      </RigidBody>

      {/* Left door — separate RigidBody for the same reason */}
      <RigidBody type='fixed' colliders='trimesh'>
        <group position={[-0.77, 0.588, 0.299]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.BookCase_LeftDoor_1.geometry} material={materials.DarkWood} />
          <mesh geometry={nodes.BookCase_LeftDoor_2.geometry} material={materials.Metal} />
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/bookshelf.glb');

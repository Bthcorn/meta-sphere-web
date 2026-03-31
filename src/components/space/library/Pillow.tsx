import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Node: THREE.Mesh;
  };
  materials: {
    lambert2SG: THREE.MeshStandardMaterial;
  };
};

export function Pillow(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/pillow.glb') as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Node.geometry} material={materials.lambert2SG} />
    </group>
  );
}

useGLTF.preload('/pillow.glb');

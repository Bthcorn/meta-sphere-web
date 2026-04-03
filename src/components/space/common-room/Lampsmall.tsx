import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    BedsideLamp1_1: THREE.Mesh;
    BedsideLamp1_2: THREE.Mesh;
    BedsideLamp1_3: THREE.Mesh;
  };
  materials: {
    ShadeBedsideLamp1: THREE.MeshStandardMaterial;
    LightBedsideLamp1: THREE.MeshStandardMaterial;
    MetalBedsideLamp1: THREE.MeshStandardMaterial;
  };
};

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/lampsmall.glb') as unknown as GLTFResult;

  return (
    <>
      {/* 
        Completely outside the scaled group.
        Inherits world position from wherever the lamp is placed,
        but is NOT affected by scale={0.25} or whatever the caller passes.
        Nudge Y to sit at bulb height in world units.
      */}
      <group {...props}>
        <pointLight position={[0, 0.4, 0]} intensity={60} distance={6} decay={2} color='#ff9900' />
      </group>

      <group {...props} dispose={null}>
        <RigidBody type='fixed' colliders='hull'>
          {/* Shade — light filtering through fabric */}
          <mesh geometry={nodes.BedsideLamp1_1.geometry}>
            <meshStandardMaterial
              {...materials.ShadeBedsideLamp1}
              color='#ffcc88'
              emissive='#ff8800'
              emissiveIntensity={3}
              toneMapped={true}
            />
          </mesh>

          {/* Bulb — bright glowing core */}
          <mesh geometry={nodes.BedsideLamp1_2.geometry}>
            <meshStandardMaterial
              {...materials.LightBedsideLamp1}
              color='#ff8800'
              emissive='#ff8800'
              emissiveIntensity={15}
              toneMapped={true}
            />
          </mesh>

          {/* Metal base — unchanged */}
          <mesh geometry={nodes.BedsideLamp1_3.geometry} material={materials.MetalBedsideLamp1} />
        </RigidBody>
      </group>
    </>
  );
}

useGLTF.preload('/lampsmall.glb');

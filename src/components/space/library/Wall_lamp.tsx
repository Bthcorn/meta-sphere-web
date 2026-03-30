import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    Base_1: THREE.Mesh;
    Base_2: THREE.Mesh;
    Base_3: THREE.Mesh;
    Base_4: THREE.Mesh;
  };
  materials: {
    ['Material.002']: THREE.MeshStandardMaterial;
    ['Material.001']: THREE.MeshStandardMaterial;
    ['Material.003']: THREE.MeshStandardMaterial;
    ['Material.004']: THREE.MeshStandardMaterial;
  };
};

export function WallLamp(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/wall_lamp.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      {/* 
        Lights live here, OUTSIDE the scale={100} group.
        Positions are now in real world-space units.
        Tweak Z to nudge along the lamp's forward axis.
      */}

      {/* Room glow — shines forward away from the wall */}
      <pointLight position={[0, 0, 0.3]} intensity={100} distance={5} decay={7} color='#ff9900' />

      {/* Wall wash — sits just behind the bulb to halo the wall */}
      <pointLight position={[0, 0, -0.1]} intensity={4} distance={5} decay={1} color='#ff9900' />

      <RigidBody type='fixed' colliders='cuboid'>
        <group scale={100}>
          <mesh geometry={nodes.Base_1.geometry} material={materials['Material.002']} />
          <mesh geometry={nodes.Base_2.geometry} material={materials['Material.001']} />
          <mesh geometry={nodes.Base_3.geometry} material={materials['Material.003']} />

          {/* Emissive bulb mesh */}
          <mesh geometry={nodes.Base_4.geometry}>
            <meshStandardMaterial
              {...materials['Material.004']}
              color='#ff8800'
              emissive='#ff8800'
              emissiveIntensity={8}
              toneMapped={true}
            />
          </mesh>
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/wall_lamp.glb');

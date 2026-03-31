import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    ['Standing_lamp_01_Circle003-Mesh']: THREE.Mesh;
    ['Standing_lamp_01_Circle003-Mesh_1']: THREE.Mesh;
    ['Standing_lamp_01_Circle003-Mesh_2']: THREE.Mesh;
    ['Standing_lamp_01_Circle003-Mesh_3']: THREE.Mesh;
  };
  materials: {
    ['795548']: THREE.MeshStandardMaterial;
    DD9944: THREE.MeshStandardMaterial;
    ['455A64']: THREE.MeshStandardMaterial;
    FFEB3B: THREE.MeshStandardMaterial;
  };
};

export function Lamp(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/lamp.glb') as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='trimesh'>
        {/* 💡 THE LIGHT SOURCE */}
        <pointLight position={[0, 2.2, 0]} intensity={10} distance={12} decay={2} color='#ff9900' />

        {/* 1. Likely the Shade or Bulb (Applying the Amber Glow here) */}
        <mesh geometry={nodes['Standing_lamp_01_Circle003-Mesh_1'].geometry}>
          <meshStandardMaterial
            {...materials.DD9944}
            color='#ff8800'
            emissive='#ff8800'
            emissiveIntensity={4}
            toneMapped={true}
          />
        </mesh>

        {/* 2. Base (User confirmed Mesh_3 is the base) */}
        <mesh
          geometry={nodes['Standing_lamp_01_Circle003-Mesh_3'].geometry}
          material={materials.FFEB3B}
        />

        {/* 3. Other components (Pole/Hardware) */}
        <mesh
          geometry={nodes['Standing_lamp_01_Circle003-Mesh'].geometry}
          material={materials['795548']}
        />
        <mesh
          geometry={nodes['Standing_lamp_01_Circle003-Mesh_2'].geometry}
          material={materials['455A64']}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/lamp.glb');

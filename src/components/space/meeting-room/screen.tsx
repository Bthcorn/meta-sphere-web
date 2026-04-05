import { Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF, useVideoTexture, Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { GLTF } from 'three-stdlib';
import type { ThreeElements } from '@react-three/fiber';
import { useScreenShareStore } from '@/store/screen-share.store';

type GLTFResult = GLTF & {
  nodes: {
    Tv1: THREE.Mesh;
  };
  materials: {
    Tv1: THREE.MeshStandardMaterial;
  };
};

function LiveSurface({ stream }: { stream: MediaStream }) {
  const texture = useVideoTexture(stream);
  return (
    <mesh position={[0, 0, 0.01]}>
      <boxGeometry args={[5.8, 3.3, 0.05]} />
      <meshBasicMaterial map={texture} map-flipY={true} map-needsUpdate={true} toneMapped={false} />
    </mesh>
  );
}

function IdleSurface() {
  return (
    <mesh position={[0, 0, 0.01]}>
      <boxGeometry args={[5.8, 3.3, 0.05]} />
      <meshStandardMaterial color='#000000' roughness={0.5} metalness={0.5} />
    </mesh>
  );
}

export function Model(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/tv.glb') as unknown as GLTFResult;
  const { stream, sharerName } = useScreenShareStore();

  return (
    <group {...props} dispose={null}>
      <RigidBody type='fixed' colliders='hull'>
        <mesh
          geometry={nodes.Tv1.geometry}
          material={materials.Tv1}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={300}
        />
      </RigidBody>

      <Suspense fallback={<IdleSurface />}>
        {stream ? <LiveSurface stream={stream} /> : <IdleSurface />}
      </Suspense>

      {sharerName && (
        <Text
          position={[0, -2.1, 0.1]}
          fontSize={0.18}
          color='#60a5fa'
          anchorX='center'
          anchorY='top'
        >
          {`${sharerName} is sharing their screen`}
        </Text>
      )}
    </group>
  );
}

useGLTF.preload('/tv.glb');

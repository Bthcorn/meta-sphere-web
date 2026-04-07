import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

type LaptopProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  variant: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  scale?: number | [number, number, number];
};

export function Laptop({ position, rotation, variant, scale = 1 }: LaptopProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF('/meeting_room.glb') as any;

  // Clone material for the sleek Space Grey aluminum body
  const spaceGreyBody = useMemo(() => {
    const mat = materials.Laptop1.clone();
    mat.color.set('#8a8d91'); // Space Grey
    return mat;
  }, [materials.Laptop1]);

  // Clone material for contrasting Dark Matte keys and touchpad
  const darkKeys = useMemo(() => {
    const mat = materials.Table1.clone();
    mat.color.set('#222222'); // Dark Grey / Almost Black
    return mat;
  }, [materials.Table1]);

  // Clone material for the Black Screen
  const blackScreen = useMemo(() => {
    const mat = materials.lambert3.clone();
    mat.color.set('#050505'); // Deep off-screen black
    return mat;
  }, [materials.lambert3]);

  const getLaptopNodes = (v: number) => {
    if (v === 0) {
      return {
        c1: 'uploads_files_4076593_LowPolyLaptopLaptopConnecter_001_LaptopBody_lambert3_0',
        c2: 'uploads_files_4076593_LowPolyLaptopLaptopConnecter_LaptopBody_lambert3_0',
        m1: 'uploads_files_4076593_LowPolyLaptopLaptopMontor_LaptopScreen_lambert3_0',
        m2: 'uploads_files_4076593_LowPolyLaptopLaptopMontor_LaptopBody_Laptop1_0',
        b1: 'uploads_files_4076593_LowPolyLaptopLaptopBase_LaptopButtons_Table1_0',
        b2: 'uploads_files_4076593_LowPolyLaptopLaptopBase_LaptopLight_lambert3_0',
        b3: 'uploads_files_4076593_LowPolyLaptopLaptopBase_Laptop_TouchPad_Table1_0',
        b4: 'uploads_files_4076593_LowPolyLaptopLaptopBase_LaptopBody_Laptop1_0',
      };
    }
    const suffix = v === 1 ? '_0' : `_0_${v - 1}`;
    return {
      c1: `LaptopConnecter_001_LaptopBody_lambert3${suffix}`,
      c2: `LaptopConnecter_LaptopBody_lambert3${suffix}`,
      m1: `LaptopMontor_LaptopScreen_lambert3${suffix}`,
      m2: `LaptopMontor_LaptopBody_Laptop1${suffix}`,
      b1: `LaptopBase_LaptopButtons_Table1${suffix}`,
      b2: `LaptopBase_LaptopLight_lambert3${suffix}`,
      b3: `LaptopBase_Laptop_TouchPad_Table1${suffix}`,
      b4: `LaptopBase_LaptopBody_Laptop1${suffix}`,
    };
  };

  const l = getLaptopNodes(variant);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group scale={0.741}>
        {/* Connectors */}
        <mesh
          geometry={nodes[l.c1].geometry}
          material={materials.lambert3}
          position={[-1.229, 0, 0]}
        />
        <mesh
          geometry={nodes[l.c2].geometry}
          material={materials.lambert3}
          position={[-1.229, 0, 0]}
        />

        {/* Screen Face (Now Black!) */}
        <mesh geometry={nodes[l.m1].geometry} material={blackScreen} position={[-1.229, 0, 0]} />

        {/* Monitor Body (Space Grey) */}
        <mesh geometry={nodes[l.m2].geometry} material={spaceGreyBody} position={[-1.229, 0, 0]} />

        {/* Keyboard Buttons (Dark Keys) */}
        <mesh geometry={nodes[l.b1].geometry} material={darkKeys} position={[-1.229, 0, 0]} />

        {/* Laptop Light / Indicator */}
        <mesh
          geometry={nodes[l.b2].geometry}
          material={materials.lambert3}
          position={[-1.229, 0, 0]}
        />

        {/* Touchpad (Dark Keys) */}
        <mesh geometry={nodes[l.b3].geometry} material={darkKeys} position={[-1.229, 0, 0]} />

        {/* Base Body (Space Grey) */}
        <mesh geometry={nodes[l.b4].geometry} material={spaceGreyBody} position={[-1.229, 0, 0]} />
      </group>
    </group>
  );
}

useGLTF.preload('/meeting_room.glb');

import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { AVATAR_OPTIONS, useAvatarStore, type AvatarOption } from '@/store/avatar.store';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/avatar-select')({
  component: AvatarSelectPage,
});

function PreviewAvatar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.6;
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.08;
    }
    if (headRef.current) {
      const mat = headRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * 1.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.55, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Glow ring */}
      <mesh position={[0, 0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.36, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function AvatarPreviewCanvas({ color }: { color: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 2.2], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 3, 2]} intensity={2} color={color} />
      <pointLight position={[-2, 1, -1]} intensity={1} color='#c4b5fd' />
      <PreviewAvatar color={color} />
    </Canvas>
  );
}

function AvatarCard({
  option,
  selected,
  onSelect,
}: {
  option: AvatarOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer
        ${
          selected
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-lg'
            : 'border-border bg-card hover:border-[var(--color-primary)]/50 hover:bg-card/80'
        }
      `}
    >
      {/* Color swatch */}
      <div
        className='mb-3 h-10 w-10 rounded-full shadow-md'
        style={{
          backgroundColor: option.color,
          boxShadow: selected ? `0 0 12px ${option.color}` : undefined,
        }}
      />
      <p className='font-semibold text-foreground'>{option.name}</p>
      <p className='text-sm text-muted-foreground'>{option.description}</p>

      {selected && (
        <span className='absolute right-3 top-3 text-xs font-bold uppercase tracking-wide text-primary'>
          Selected
        </span>
      )}
    </button>
  );
}

function AvatarSelectPage() {
  const navigate = useNavigate();
  const setAvatar = useAvatarStore((s) => s.setAvatar);
  const persistedId = useAvatarStore((s) => s.avatarId);

  const [selectedId, setSelectedId] = useState<string>(persistedId ?? AVATAR_OPTIONS[0].id);

  const selectedOption = AVATAR_OPTIONS.find((o) => o.id === selectedId) ?? AVATAR_OPTIONS[0];

  function handleConfirm() {
    setAvatar(selectedId);
    navigate({ to: '/space' });
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      {/* Header */}
      <header className='border-b border-border px-8 py-4'>
        <h1 className='text-lg font-semibold tracking-tight'>Metasphere</h1>
      </header>

      <main className='flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12 lg:flex-row lg:gap-16'>
        {/* Left — 3D preview */}
        <div className='flex flex-col items-center gap-4'>
          <div className='h-64 w-64 overflow-hidden rounded-2xl border border-border bg-card/50 shadow-xl lg:h-80 lg:w-80'>
            <AvatarPreviewCanvas color={selectedOption.color} />
          </div>
          <div className='text-center'>
            <p className='text-xl font-bold' style={{ color: selectedOption.color }}>
              {selectedOption.name}
            </p>
            <p className='text-sm text-muted-foreground'>{selectedOption.description}</p>
          </div>
        </div>

        {/* Right — selection grid */}
        <div className='flex max-w-md flex-col gap-6 w-full'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Choose your avatar</h2>
            <p className='mt-1 text-muted-foreground'>
              This is how others will see you in the space.
            </p>
          </div>

          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {AVATAR_OPTIONS.map((option) => (
              <AvatarCard
                key={option.id}
                option={option}
                selected={selectedId === option.id}
                onSelect={() => setSelectedId(option.id)}
              />
            ))}
          </div>

          <Button onClick={handleConfirm} className='w-full' size='lg'>
            Enter Metasphere
          </Button>
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import {
  AVATAR_OPTIONS,
  GLASSES_OPTIONS,
  HAT_OPTIONS,
  useAvatarStore,
  type AvatarOption,
  type AccessoryOption,
} from '@/store/avatar.store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_authenticated/user/avatar-select')({
  component: AvatarSelectPage,
});

// ── 3D Accessories ─────────────────────────────────────────────────────────────

const GLASSES_Y = 0.42;
const GLASSES_Z = 0.23;

function RoundGlasses({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[-0.085, GLASSES_Y, GLASSES_Z]}>
        <torusGeometry args={[0.038, 0.007, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0.085, GLASSES_Y, GLASSES_Z]}>
        <torusGeometry args={[0.038, 0.007, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, GLASSES_Y, GLASSES_Z]}>
        <boxGeometry args={[0.055, 0.006, 0.006]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

const SQ_W = 0.038;
const SQ_H = 0.028;
const SQ_T = 0.006;

function SquareLensFrame({ ox, color }: { ox: number; color: string }) {
  return (
    <group position={[ox, GLASSES_Y, GLASSES_Z]}>
      <mesh position={[0, SQ_H, 0]}>
        <boxGeometry args={[SQ_W * 2, SQ_T, SQ_T]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      <mesh position={[0, -SQ_H, 0]}>
        <boxGeometry args={[SQ_W * 2, SQ_T, SQ_T]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      <mesh position={[-SQ_W, 0, 0]}>
        <boxGeometry args={[SQ_T, SQ_H * 2, SQ_T]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      <mesh position={[SQ_W, 0, 0]}>
        <boxGeometry args={[SQ_T, SQ_H * 2, SQ_T]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
    </group>
  );
}

function SquareGlasses({ color }: { color: string }) {
  return (
    <group>
      <SquareLensFrame ox={-0.09} color={color} />
      <SquareLensFrame ox={0.09} color={color} />
      <mesh position={[0, GLASSES_Y, GLASSES_Z]}>
        <boxGeometry args={[0.04, 0.006, 0.006]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Sunglasses({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[-0.085, GLASSES_Y, GLASSES_Z]}>
        <torusGeometry args={[0.038, 0.007, 8, 20]} />
        <meshStandardMaterial color='#555' roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[-0.085, GLASSES_Y, GLASSES_Z]}>
        <circleGeometry args={[0.034, 20]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.085, GLASSES_Y, GLASSES_Z]}>
        <torusGeometry args={[0.038, 0.007, 8, 20]} />
        <meshStandardMaterial color='#555' roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0.085, GLASSES_Y, GLASSES_Z]}>
        <circleGeometry args={[0.034, 20]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, GLASSES_Y, GLASSES_Z]}>
        <boxGeometry args={[0.055, 0.006, 0.006]} />
        <meshStandardMaterial color='#555' metalness={0.8} />
      </mesh>
    </group>
  );
}

function Beanie({ color }: { color: string }) {
  return (
    <group position={[0, 0.6, 0]}>
      {/* Main dome */}
      <mesh>
        <sphereGeometry args={[0.19, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Ribbed band */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.195, 0.195, 0.06, 24]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Pom pom */}
      <mesh position={[0, 0.17, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color='white' roughness={1} />
      </mesh>
    </group>
  );
}

function Cap({ color }: { color: string }) {
  return (
    <group position={[0, 0.58, 0]}>
      {/* Crown */}
      <mesh>
        <sphereGeometry args={[0.195, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Brim — forward-tilted */}
      <mesh position={[0, -0.04, 0.14]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.025, 24, 1, false, -Math.PI * 0.4, Math.PI * 0.8]} />
        <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function TopHat({ color }: { color: string }) {
  return (
    <group position={[0, 0.6, 0]}>
      {/* Crown */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.36, 24]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Brim */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.025, 24]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Hat band */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.163, 0.163, 0.04, 24]} />
        <meshStandardMaterial color='#7c5dfa' roughness={0.4} />
      </mesh>
    </group>
  );
}

function GlassesAccessory({ id, color }: { id: string; color: string }) {
  if (id === 'round') return <RoundGlasses color={color} />;
  if (id === 'square') return <SquareGlasses color={color} />;
  if (id === 'sunglasses') return <Sunglasses color={color} />;
  return null;
}

function HatAccessory({ id, color }: { id: string; color: string }) {
  if (id === 'beanie') return <Beanie color={color} />;
  if (id === 'cap') return <Cap color={color} />;
  if (id === 'tophat') return <TopHat color={color} />;
  return null;
}

// ── Preview Avatar ──────────────────────────────────────────────────────────────

interface PreviewAvatarProps {
  color: string;
  glassesId: string;
  glassesColor: string;
  hatId: string;
  hatColor: string;
}

function PreviewAvatar({ color, glassesId, glassesColor, hatId, hatColor }: PreviewAvatarProps) {
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
      {/* Accessories */}
      <GlassesAccessory id={glassesId} color={glassesColor} />
      <HatAccessory id={hatId} color={hatColor} />
    </group>
  );
}

function AvatarPreviewCanvas({
  color,
  glassesId,
  glassesColor,
  hatId,
  hatColor,
}: PreviewAvatarProps) {
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
      <PreviewAvatar
        color={color}
        glassesId={glassesId}
        glassesColor={glassesColor}
        hatId={hatId}
        hatColor={hatColor}
      />
    </Canvas>
  );
}

// ── Option Cards ───────────────────────────────────────────────────────────────

function ColorCard({
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
      className={cn(
        'relative rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer',
        selected
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
      )}
    >
      <div
        className='mb-3 h-10 w-10 rounded-full shadow-md'
        style={{
          backgroundColor: option.color,
          boxShadow: selected ? `0 0 12px ${option.color}` : undefined,
        }}
      />
      <p className='font-semibold text-foreground'>{option.name}</p>
      <p className='text-sm text-muted-foreground'>{option.description}</p>
    </button>
  );
}

function AccessoryCard({
  option,
  selected,
  onSelect,
}: {
  option: AccessoryOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 cursor-pointer',
        selected
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
      )}
    >
      {option.color !== 'transparent' ? (
        <div
          className='h-7 w-7 shrink-0 rounded-full shadow-sm'
          style={{
            backgroundColor: option.color,
            boxShadow: selected ? `0 0 8px ${option.color}` : undefined,
          }}
        />
      ) : (
        <div className='h-7 w-7 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/40' />
      )}
      <p className='font-medium text-foreground'>{option.name}</p>
    </button>
  );
}

// ── Tab Bar ────────────────────────────────────────────────────────────────────

type Tab = 'color' | 'glasses' | 'hat';

const TABS: { id: Tab; label: string }[] = [
  { id: 'color', label: 'Color' },
  { id: 'glasses', label: 'Glasses' },
  { id: 'hat', label: 'Hat' },
];

// ── Page ───────────────────────────────────────────────────────────────────────

function AvatarSelectPage() {
  const navigate = useNavigate();
  const { setAvatar, setGlasses, setHat } = useAvatarStore();
  const persistedId = useAvatarStore((s) => s.avatarId);
  const persistedGlasses = useAvatarStore((s) => s.glassesId);
  const persistedHat = useAvatarStore((s) => s.hatId);

  const [activeTab, setActiveTab] = useState<Tab>('color');
  const [selectedId, setSelectedId] = useState<string>(persistedId ?? AVATAR_OPTIONS[0].id);
  const [selectedGlasses, setSelectedGlasses] = useState<string>(persistedGlasses);
  const [selectedHat, setSelectedHat] = useState<string>(persistedHat);

  const selectedOption = AVATAR_OPTIONS.find((o) => o.id === selectedId) ?? AVATAR_OPTIONS[0];
  const glassesOption = GLASSES_OPTIONS.find((o) => o.id === selectedGlasses) ?? GLASSES_OPTIONS[0];
  const hatOption = HAT_OPTIONS.find((o) => o.id === selectedHat) ?? HAT_OPTIONS[0];

  function handleConfirm() {
    setAvatar(selectedId);
    setGlasses(selectedGlasses);
    setHat(selectedHat);
    navigate({ to: '/space' });
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <header className='flex items-center justify-between border-b border-border px-8 py-4'>
        <h1 className='text-lg font-semibold tracking-tight'>Metasphere</h1>
        <Link
          to='/'
          className='text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          Home
        </Link>
      </header>

      <main className='flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12 lg:flex-row lg:gap-16'>
        {/* Left — 3D preview */}
        <div className='flex flex-col items-center gap-4'>
          <div className='h-64 w-64 overflow-hidden rounded-2xl border border-border bg-card/50 shadow-xl lg:h-80 lg:w-80'>
            <AvatarPreviewCanvas
              color={selectedOption.color}
              glassesId={selectedGlasses}
              glassesColor={glassesOption.color}
              hatId={selectedHat}
              hatColor={hatOption.color}
            />
          </div>
          <div className='text-center'>
            <p className='text-xl font-bold' style={{ color: selectedOption.color }}>
              {selectedOption.name}
            </p>
            <p className='text-sm text-muted-foreground'>
              {[
                selectedOption.description,
                selectedGlasses !== 'none' && glassesOption.name,
                selectedHat !== 'none' && hatOption.name,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        {/* Right — customization panel */}
        <div className='flex w-full max-w-md flex-col gap-6'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Customize your avatar</h2>
            <p className='mt-1 text-muted-foreground'>
              This is how others will see you in the space.
            </p>
          </div>

          {/* Tab bar */}
          <div className='flex gap-1 rounded-xl border border-border bg-muted p-1'>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150',
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'color' && (
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {AVATAR_OPTIONS.map((option) => (
                <ColorCard
                  key={option.id}
                  option={option}
                  selected={selectedId === option.id}
                  onSelect={() => setSelectedId(option.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'glasses' && (
            <div className='grid grid-cols-2 gap-3'>
              {GLASSES_OPTIONS.map((option) => (
                <AccessoryCard
                  key={option.id}
                  option={option}
                  selected={selectedGlasses === option.id}
                  onSelect={() => setSelectedGlasses(option.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'hat' && (
            <div className='grid grid-cols-2 gap-3'>
              {HAT_OPTIONS.map((option) => (
                <AccessoryCard
                  key={option.id}
                  option={option}
                  selected={selectedHat === option.id}
                  onSelect={() => setSelectedHat(option.id)}
                />
              ))}
            </div>
          )}

          <Button onClick={handleConfirm} className='w-full' size='lg'>
            Enter Metasphere
          </Button>
        </div>
      </main>
    </div>
  );
}

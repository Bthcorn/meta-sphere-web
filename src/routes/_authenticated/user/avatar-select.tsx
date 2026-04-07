import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Canvas } from '@react-three/fiber';
import {
  SKIN_OPTIONS,
  SHIRT_COLOR_OPTIONS,
  GLASSES_OPTIONS,
  HAT_OPTIONS,
  SKIN_MAP,
  SHIRT_COLOR_MAP,
  GLASSES_MAP,
  HAT_MAP,
  useAvatarStore,
  type AvatarOption,
  type AccessoryOption,
  type ShirtOption,
} from '@/store/avatar.store';
import { PlayerAvatar } from '@/components/avatar/player-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_authenticated/user/avatar-select')({
  component: AvatarSelectPage,
});

// ── Preview Canvas ─────────────────────────────────────────────────────────

interface PreviewProps {
  skinColor: string;
  shirtColor: string;
  glassesId: string;
  hatId: string;
}

function AvatarPreviewCanvas({ skinColor, shirtColor, glassesId, hatId }: PreviewProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 2.5] as [number, number, number], fov: 46 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 3, 2]} intensity={2} />
      <pointLight position={[-2, 1, -1]} intensity={1} color='#c4b5fd' />
      <PlayerAvatar
        username=''
        color={skinColor}
        shirtColor={shirtColor}
        glassesId={glassesId}
        hatId={hatId}
        showLabel={false}
        enableBob={true}
        bobOffset={0}
        baseY={-0.3}
      />
    </Canvas>
  );
}

// ── Option Cards ───────────────────────────────────────────────────────────

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

function ShirtCard({
  option,
  selected,
  onSelect,
}: {
  option: ShirtOption;
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
      <div
        className='h-7 w-7 shrink-0 rounded shadow-sm'
        style={{
          backgroundColor: option.color,
          boxShadow: selected ? `0 0 8px ${option.color}` : undefined,
        }}
      />
      <p className='font-medium text-foreground'>{option.name}</p>
    </button>
  );
}

// ── Tab Bar ────────────────────────────────────────────────────────────────

type Tab = 'color' | 'glasses' | 'hat';

const TABS: { id: Tab; label: string }[] = [
  { id: 'color', label: 'Color' },
  { id: 'glasses', label: 'Glasses' },
  { id: 'hat', label: 'Hat' },
];

// ── Page ───────────────────────────────────────────────────────────────────

function AvatarSelectPage() {
  const navigate = useNavigate();
  const { setAvatar, setGlasses, setHat, setShirtColor } = useAvatarStore();
  const persistedId = useAvatarStore((s) => s.avatarId);
  const persistedGlasses = useAvatarStore((s) => s.glassesId);
  const persistedHat = useAvatarStore((s) => s.hatId);
  const persistedShirt = useAvatarStore((s) => s.shirtColorId);

  const [activeTab, setActiveTab] = useState<Tab>('color');
  const [selectedId, setSelectedId] = useState<string>(persistedId ?? SKIN_OPTIONS[0].id);
  const [selectedGlasses, setSelectedGlasses] = useState<string>(persistedGlasses);
  const [selectedHat, setSelectedHat] = useState<string>(persistedHat);
  const [selectedShirt, setSelectedShirt] = useState<string>(persistedShirt);

  const selectedSkinOption = SKIN_MAP[selectedId] ?? SKIN_OPTIONS[0];
  const selectedShirtOption = SHIRT_COLOR_MAP[selectedShirt] ?? SHIRT_COLOR_OPTIONS[0];
  const glassesOption = GLASSES_MAP[selectedGlasses] ?? GLASSES_OPTIONS[0];
  const hatOption = HAT_MAP[selectedHat] ?? HAT_OPTIONS[0];

  function handleConfirm() {
    setAvatar(selectedId);
    setGlasses(selectedGlasses);
    setHat(selectedHat);
    setShirtColor(selectedShirt);
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
              skinColor={selectedSkinOption.color}
              shirtColor={selectedShirtOption.color}
              glassesId={selectedGlasses}
              hatId={selectedHat}
            />
          </div>
          <div className='text-center'>
            <p className='text-xl font-bold' style={{ color: selectedSkinOption.color }}>
              {selectedSkinOption.name}
            </p>
            <p className='text-sm text-muted-foreground'>
              {[
                selectedSkinOption.description,
                selectedShirtOption.name,
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
            <div className='flex flex-col gap-5'>
              <div>
                <p className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                  Skin tone
                </p>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                  {SKIN_OPTIONS.map((option) => (
                    <ColorCard
                      key={option.id}
                      option={option}
                      selected={selectedId === option.id}
                      onSelect={() => setSelectedId(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                  Shirt color
                </p>
                <div className='grid grid-cols-2 gap-3'>
                  {SHIRT_COLOR_OPTIONS.map((option) => (
                    <ShirtCard
                      key={option.id}
                      option={option}
                      selected={selectedShirt === option.id}
                      onSelect={() => setSelectedShirt(option.id)}
                    />
                  ))}
                </div>
              </div>
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

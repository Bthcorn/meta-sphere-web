import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Video, BookOpen } from 'lucide-react';
import { MetaSphere3D } from '@/components/meta-sphere-3d';
import { useAuth } from '@/hooks/useAuth';
import { useAvatarStore } from '@/store/avatar.store';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

const features = [
  {
    icon: Users,
    title: 'Co-working Spaces',
    description:
      "Drop into shared spaces with colleagues. See who's around and collaborate in real time.",
  },
  {
    icon: Video,
    title: 'Meeting Rooms',
    description:
      'Dedicated rooms for focused discussions, stand-ups, and team syncs — no scheduling needed.',
  },
  {
    icon: BookOpen,
    title: 'Library & Focus',
    description: 'Quiet zones for deep work. Signal your availability and keep distractions away.',
  },
];

function LandingPage() {
  const { isAuthenticated, logout } = useAuth();
  const hasAvatar = useAvatarStore((s) => s.avatarId !== null);
  const appTo = hasAvatar ? '/space' : '/user/avatar-select';

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      {/* Nav */}
      <header className='fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm'>
        <div className='mx-auto max-w-6xl px-6 h-16 flex items-center justify-between'>
          <span className='text-lg font-bold tracking-tight text-foreground'>Metasphere</span>
          <nav className='flex items-center gap-3'>
            {isAuthenticated ? (
              <>
                <Button variant='ghost' size='sm' asChild>
                  <Link to={appTo}>Enter space</Link>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={logout.isPending}
                  onClick={() => logout.mutate('/')}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant='ghost' size='sm' asChild>
                  <Link to='/auth/login'>Sign in</Link>
                </Button>
                <Button size='sm' asChild>
                  <Link to='/auth/register'>Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className='flex-1 flex flex-col'>
        {/* Hero — two columns */}
        <section className='flex-1 mx-auto w-full max-w-6xl px-6 pt-24 pb-16 flex flex-col lg:flex-row items-center gap-12'>
          {/* Left: text */}
          <div className='flex-1 flex flex-col items-start text-left'>
            <div className='inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground mb-8'>
              <span className='size-1.5 rounded-full bg-primary inline-block' />
              Virtual co-working, reimagined
            </div>

            <h1 className='text-5xl sm:text-6xl font-bold tracking-tight leading-tight'>
              Your team, <span className='text-primary'>together</span> — anywhere
            </h1>

            <p className='mt-6 max-w-md text-lg text-muted-foreground'>
              Metasphere brings the energy of a shared office into a virtual space. See your
              teammates, drop into rooms, and stay in flow.
            </p>

            <div className='mt-10 flex flex-wrap items-center gap-4'>
              {isAuthenticated ? (
                <>
                  <Button size='lg' asChild>
                    <Link to={appTo}>Enter Metasphere</Link>
                  </Button>
                  {/* <Button
                    size='lg'
                    variant='outline'
                    disabled={logout.isPending}
                    onClick={() => logout.mutate('/')}
                  >
                    Log out
                  </Button> */}
                </>
              ) : (
                <>
                  <Button size='lg' asChild>
                    <Link to='/auth/register'>Start for free</Link>
                  </Button>
                  <Button size='lg' variant='outline' asChild>
                    <Link to='/auth/login'>Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right: 3D scene */}
          <div className='w-full lg:flex-1 h-72 sm:h-96 lg:h-130'>
            <MetaSphere3D />
          </div>
        </section>

        {/* Feature cards */}
        <section className='mx-auto w-full max-w-6xl px-6 pb-20'>
          <div className='grid sm:grid-cols-3 gap-6'>
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <div className='size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2'>
                    <Icon className='size-5 text-primary' />
                  </div>
                  <CardTitle className='text-base'>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-border py-6 text-center text-sm text-muted-foreground'>
        © {new Date().getFullYear()} Metasphere. All rights reserved.
      </footer>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-background text-foreground'>
      <h1 className='text-5xl font-bold mb-4 drop-shadow-sm'>Welcome to Metasphere</h1>
      <p className='text-xl text-muted-foreground mb-10'>A Virtual Co-working Platform</p>

      {/* The magic button that routes to /space */}
      <Link to='/space'>
        <Button variant='link' size='lg'>
          Enter Metasphere
        </Button>
      </Link>
    </div>
  );
}

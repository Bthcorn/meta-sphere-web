import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Button } from '@/components/ui/button';

function NotFoundPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground'>
      <p className='text-8xl font-bold text-muted select-none'>404</p>
      <h1 className='mt-4 text-2xl font-semibold text-foreground'>Page not found</h1>
      <p className='mt-2 text-muted-foreground'>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className='mt-8'>
        <Link to='/'>Back to home</Link>
      </Button>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: NotFoundPage,
});

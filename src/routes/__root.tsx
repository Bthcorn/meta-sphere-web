import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Button } from '@/components/ui/button';

function NotFoundPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 text-white'>
      <p className='text-8xl font-bold text-gray-700 select-none'>404</p>
      <h1 className='mt-4 text-2xl font-semibold text-white'>Page not found</h1>
      <p className='mt-2 text-gray-400'>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button
        asChild
        variant='destructive'
        className='mt-8 bg-blue-600 hover:bg-blue-500 text-white!'
      >
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

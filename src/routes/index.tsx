import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white'>
      <h1 className='text-5xl font-bold mb-4 drop-shadow-md'>Welcome to Metasphere</h1>
      <p className='text-xl text-gray-300 mb-10'>A Virtual Co-working Platform</p>

      {/* The magic button that routes to /space */}
      <Link
        to='/space'
        className='px-8 py-4 bg-blue-600 hover:bg-blue-500 !text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all text-lg'
      >
        Enter Metasphere
      </Link>
    </div>
  );
}

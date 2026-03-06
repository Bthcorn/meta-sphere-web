import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data);
  };

  const apiError = login.error instanceof Error ? login.error.message : null;

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-950 px-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight text-white'>Metasphere</h1>
          <p className='mt-1 text-sm text-gray-400'>Your virtual co-working space</p>
        </div>

        <Card className='border-gray-800 bg-gray-900 text-white shadow-2xl'>
          <CardHeader className='space-y-1 pb-4'>
            <CardTitle className='text-xl font-semibold text-white'>Welcome back</CardTitle>
            <CardDescription className='text-gray-400'>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='username' className='text-gray-300'>
                  Username
                </Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='johndoe'
                  autoComplete='username'
                  className='border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                  {...register('username')}
                />
                {errors.username && (
                  <p className='text-xs text-red-400'>{errors.username.message}</p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='password' className='text-gray-300'>
                  Password
                </Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  autoComplete='current-password'
                  className='border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-xs text-red-400'>{errors.password.message}</p>
                )}
              </div>

              {apiError && (
                <div className='rounded-md bg-red-900/40 px-3 py-2 text-sm text-red-400 ring-1 ring-red-800'>
                  {apiError}
                </div>
              )}

              <Button
                type='submit'
                disabled={login.isPending}
                className='w-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors'
              >
                {login.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className='mt-5 text-center text-sm text-gray-500'>
              Don&apos;t have an account?{' '}
              <Link
                to='/auth/register'
                className='font-medium text-blue-400 hover:text-blue-300 transition-colors'
              >
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

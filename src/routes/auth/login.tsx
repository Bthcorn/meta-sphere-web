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
    <div className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>Metasphere</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Your virtual co-working space</p>
        </div>

        <Card className='border-border bg-card text-card-foreground shadow-xl'>
          <CardHeader className='space-y-1 pb-4'>
            <CardTitle className='text-xl font-semibold text-card-foreground'>
              Welcome back
            </CardTitle>
            <CardDescription className='text-muted-foreground'>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='username' className='text-foreground'>
                  Username
                </Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='johndoe'
                  autoComplete='username'
                  className='border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
                  {...register('username')}
                />
                {errors.username && (
                  <p className='text-xs text-destructive'>{errors.username.message}</p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='password' className='text-foreground'>
                  Password
                </Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  autoComplete='current-password'
                  className='border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-xs text-destructive'>{errors.password.message}</p>
                )}
              </div>

              {apiError && (
                <div className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive ring-1 ring-destructive/30'>
                  {apiError}
                </div>
              )}

              <Button
                type='submit'
                disabled={login.isPending}
                className='w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors'
              >
                {login.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className='mt-5 text-center text-sm text-muted-foreground'>
              Don&apos;t have an account?{' '}
              <Link
                to='/auth/register'
                className='font-medium text-primary hover:text-primary/80 transition-colors'
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

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { RegisterRequest } from '@/types/auth';

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerMutation } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePicture: '',
    },
  });

  const onSubmit = (registerData: RegisterFormValues) => {
    const registerRequest: RegisterRequest = {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      profilePicture: registerData.profilePicture || undefined,
    };
    registerMutation.mutate(registerRequest, { onSuccess: () => navigate({ to: '/auth/login' }) });
  };

  const apiError = registerMutation.error instanceof Error ? registerMutation.error.message : null;

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
              Create an account
            </CardTitle>
            <CardDescription className='text-muted-foreground'>
              Join Metasphere and start collaborating
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='firstName' className='text-foreground'>
                    First name
                  </Label>
                  <Input
                    id='firstName'
                    type='text'
                    placeholder='John'
                    autoComplete='given-name'
                    className='border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className='text-xs text-destructive'>{errors.firstName.message}</p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='lastName' className='text-foreground'>
                    Last name
                  </Label>
                  <Input
                    id='lastName'
                    type='text'
                    placeholder='Doe'
                    autoComplete='family-name'
                    className='border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className='text-xs text-destructive'>{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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
                <Label htmlFor='email' className='text-foreground'>
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  autoComplete='email'
                  className='border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
                  {...register('email')}
                />
                {errors.email && <p className='text-xs text-destructive'>{errors.email.message}</p>}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='password' className='text-foreground'>
                  Password
                </Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  autoComplete='new-password'
                  className='border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-xs text-destructive'>{errors.password.message}</p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='confirmPassword' className='text-foreground'>
                  Confirm password
                </Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='••••••••'
                  autoComplete='new-password'
                  className='border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className='text-xs text-destructive'>{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='profilePicture' className='text-foreground'>
                  Profile picture URL <span className='text-muted-foreground'>(optional)</span>
                </Label>
                <Input
                  id='profilePicture'
                  type='url'
                  placeholder='https://example.com/avatar.jpg'
                  className='border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
                  {...register('profilePicture')}
                />
                {errors.profilePicture && (
                  <p className='text-xs text-destructive'>{errors.profilePicture.message}</p>
                )}
              </div>

              {apiError && (
                <div className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive ring-1 ring-destructive/30'>
                  {apiError}
                </div>
              )}

              <Button
                type='submit'
                disabled={registerMutation.isPending}
                className='w-full block items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors'
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                  </>
                )}
              </Button>
            </form>

            <p className='mt-5 text-center text-sm text-muted-foreground'>
              Already have an account?{' '}
              <Link
                to='/auth/login'
                className='font-medium text-primary hover:text-primary/80 transition-colors'
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
    <div className='flex min-h-screen items-center justify-center bg-gray-950 px-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight text-white'>Metasphere</h1>
          <p className='mt-1 text-sm text-gray-400'>Your virtual co-working space</p>
        </div>

        <Card className='border-gray-800 bg-gray-900 text-white shadow-2xl'>
          <CardHeader className='space-y-1 pb-4'>
            <CardTitle className='text-xl font-semibold text-white'>Create an account</CardTitle>
            <CardDescription className='text-gray-400'>
              Join Metasphere and start collaborating
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='firstName' className='text-gray-300'>
                    First name
                  </Label>
                  <Input
                    id='firstName'
                    type='text'
                    placeholder='John'
                    autoComplete='given-name'
                    className='border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className='text-xs text-red-400'>{errors.firstName.message}</p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='lastName' className='text-gray-300'>
                    Last name
                  </Label>
                  <Input
                    id='lastName'
                    type='text'
                    placeholder='Doe'
                    autoComplete='family-name'
                    className='border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className='text-xs text-red-400'>{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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
                <Label htmlFor='email' className='text-gray-300'>
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  autoComplete='email'
                  className='border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                  {...register('email')}
                />
                {errors.email && <p className='text-xs text-red-400'>{errors.email.message}</p>}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='password' className='text-gray-300'>
                  Password
                </Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  autoComplete='new-password'
                  className='border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-xs text-red-400'>{errors.password.message}</p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='confirmPassword' className='text-gray-300'>
                  Confirm password
                </Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='••••••••'
                  autoComplete='new-password'
                  className='border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className='text-xs text-red-400'>{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='profilePicture' className='text-gray-300'>
                  Profile picture URL <span className='text-gray-500'>(optional)</span>
                </Label>
                <Input
                  id='profilePicture'
                  type='url'
                  placeholder='https://example.com/avatar.jpg'
                  className='border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus-visible:ring-blue-500'
                  {...register('profilePicture')}
                />
                {errors.profilePicture && (
                  <p className='text-xs text-red-400'>{errors.profilePicture.message}</p>
                )}
              </div>

              {apiError && (
                <div className='rounded-md bg-red-900/40 px-3 py-2 text-sm text-red-400 ring-1 ring-red-800'>
                  {apiError}
                </div>
              )}

              <Button
                type='submit'
                disabled={registerMutation.isPending}
                className='w-full block items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors'
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

            <p className='mt-5 text-center text-sm text-gray-500'>
              Already have an account?{' '}
              <Link
                to='/auth/login'
                className='font-medium text-blue-400 hover:text-blue-300 transition-colors'
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

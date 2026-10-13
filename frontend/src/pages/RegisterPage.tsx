import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/stores/useAuth';
import { BookOpen, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setErrorMessage(null);
      await registerUser(data);
      // Auto login after registration
      await login({ email: data.email, password: data.password });
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Email might already be taken.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-sm border border-border">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-1">
            <BookOpen className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-text">Create Account</CardTitle>
          <p className="text-sm text-text-secondary">
            Join LectureLens for validated adaptive learning
          </p>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Johnson"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/stores/useAuth';
import { BookOpen, Sparkles, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@example.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMessage(null);
      await login(data);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setErrorMessage(msg);
    }
  };

  const setDemoCredentials = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setValue('email', 'demo@example.com');
      setValue('password', 'password123');
    } else {
      setValue('email', 'admin@example.com');
      setValue('password', 'admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-sm border border-border">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-1">
            <BookOpen className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-text">LectureLens</CardTitle>
          <p className="text-sm text-text-secondary">
            AI-Validated Adaptive Learning Platform
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
              label="Email Address"
              type="email"
              placeholder="student@example.com"
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
              Sign In to Your Workspace
            </Button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
              <span className="flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Demo Fill:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('student')}
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-text font-medium transition"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin')}
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-text font-medium transition"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

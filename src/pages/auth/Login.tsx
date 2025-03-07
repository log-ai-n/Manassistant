import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChefHat, Store, Eye, EyeOff } from 'lucide-react';
import { memberService } from '../../services/memberService';
import clsx from 'clsx';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  restaurantCode: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [restaurantCode, setRestaurantCode] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const formatRestaurantCode = (code: string) => {
    // Remove any existing prefix and spaces
    const cleanCode = code.replace(/^REST-/i, '').replace(/\s+/g, '');
    // Add the prefix back if there's a code
    return cleanCode ? `REST-${cleanCode}` : '';
  };

  const handleRestaurantCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Allow user to type without prefix, but format when leaving the input
    setRestaurantCode(rawValue);
  };

  const handleRestaurantCodeBlur = () => {
    setRestaurantCode(formatRestaurantCode(restaurantCode));
  };

  const handleStaffLogin = async (data: LoginFormValues) => {
    if (!restaurantCode) {
      setError('Restaurant code is required for staff login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format the restaurant code to ensure it has the REST- prefix
      const formattedCode = formatRestaurantCode(restaurantCode);
      
      const { data: member, error: memberError } = await memberService.verifyMemberCredentials(
        formattedCode,
        data.emailOrUsername,
        data.password
      );

      if (memberError) {
        throw memberError;
      }

      if (!member) {
        throw new Error('Invalid credentials');
      }

      // If verification successful, redirect to features page
      navigate('/features/allergenie');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (isStaffLogin) {
      await handleStaffLogin(data);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const { error } = await signIn(data.emailOrUsername, data.password);
      
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <ChefHat className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Manassist Hub
          </h2>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setIsStaffLogin(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                !isStaffLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Owner Login
            </button>
            <button
              onClick={() => setIsStaffLogin(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isStaffLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Staff Login
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            {isStaffLogin && (
              <div>
                <label htmlFor="restaurantCode" className="sr-only">
                  Restaurant Code
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    <Store className="h-4 w-4" />
                  </span>
                  <input
                    id="restaurantCode"
                    type="text"
                    value={restaurantCode}
                    onChange={handleRestaurantCodeChange}
                    onBlur={handleRestaurantCodeBlur}
                    className="appearance-none rounded-none rounded-r-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your restaurant code (e.g., REST-123456)"
                  />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="emailOrUsername" className="sr-only">
                {isStaffLogin ? 'Username' : 'Email or Username'}
              </label>
              <input
                id="emailOrUsername"
                type="text"
                autoComplete={isStaffLogin ? 'username' : 'email username'}
                {...register('emailOrUsername')}
                className={clsx(
                  "appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm",
                  isStaffLogin && "rounded-none"
                )}
                placeholder={isStaffLogin ? 'Username' : 'Email or Username'}
              />
              {errors.emailOrUsername && (
                <p className="mt-1 text-sm text-red-600">{errors.emailOrUsername.message}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          {!isStaffLogin && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Create one
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
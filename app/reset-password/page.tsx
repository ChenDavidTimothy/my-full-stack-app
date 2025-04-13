'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

function ResetPasswordContent() {
  const { supabase } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (email && !success && !isLoading) {
      handleResetPassword();
    }
  }, [email]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResetPassword = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Use the recommended Supabase auth API for password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Specify the exact URL where the user should land after clicking the reset link
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  // Email entry form for when no email is provided in URL
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1120]">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Reset Password</h2>
            <p className="mt-2 text-gray-400">
              Enter your email to receive a password reset link
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const email = formData.get('email') as string;
              window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
            }} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-gray-800"
                  placeholder="Email address"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1120]">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-gray-400">
            Sending reset link to: <span className="font-medium">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 text-red-500 p-4 rounded-lg">
            {error}
            <button
              onClick={handleResetPassword}
              className="ml-2 underline hover:text-red-600"
            >
              Try again
            </button>
          </div>
        )}

        {success ? (
          <div className="bg-green-900/30 text-green-500 p-4 rounded-lg">
            <p>Reset link has been sent to your email address.</p>
            <p className="mt-2">Please check your inbox and spam folders.</p>
            <p className="mt-4 text-sm">
              The link will be valid for the next 24 hours.
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p>Sending reset link...</p>
              </div>
            ) : (
              'Processing your request...'
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const { supabase } = useAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for valid recovery session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Let Supabase handle the auth flow automatically
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Could not verify recovery session. Please request a new password reset link.');
          return;
        }
        
        if (!data.session) {
          // No active session found
          setError('No active recovery session found. Your link may have expired.');
          return;
        }
        
        // Session found - we're good to go
        setError(null);
      } catch (err) {
        console.error('Verification error:', err);
        setError('An error occurred during verification.');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifySession();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Update password
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;
      
      // Success! Show success message
      setSuccess(true);
      
      // Schedule redirect after success
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      console.error('Password update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state during initial session check
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1120]">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Update Password</h2>
            <p className="mt-2 text-gray-400">
              Verifying your recovery session...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form UI
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1120]">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Update Password</h2>
          <p className="mt-2 text-gray-400">
            Please enter your new password
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 text-red-500 p-4 rounded-lg">
            {error}
            <div className="mt-2">
              <button
                onClick={() => router.push('/reset-password?email=')}
                className="text-red-400 underline hover:text-red-300"
              >
                Request a new reset link
              </button>
            </div>
          </div>
        )}

        {success ? (
          <div className="bg-green-900/30 text-green-500 p-4 rounded-lg">
            <p>Password updated successfully!</p>
            <p className="mt-2">Redirecting to login page...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="sr-only">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-hidden focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-gray-800"
                  placeholder="New Password"
                  minLength={6}
                  disabled={!!error}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-hidden focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-gray-800"
                  placeholder="Confirm Password"
                  minLength={6}
                  disabled={!!error}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !!error}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-xs text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
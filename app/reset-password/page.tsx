'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
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
  
  // Using a ref to track if a reset attempt has been made
  // This persists across re-renders without triggering them
  const hasAttemptedResetRef = useRef(false);

  // Improved effect with proper dependencies and reset tracking
  useEffect(() => {
    // Only proceed if: 
    // 1. We have an email
    // 2. We haven't already attempted a reset
    // 3. We're not currently loading
    // 4. We haven't already succeeded
    if (email && !hasAttemptedResetRef.current && !isLoading && !success) {
      // Mark as attempted BEFORE making the async call
      hasAttemptedResetRef.current = true;
      handleResetPassword();
    }
  }, [email, isLoading, success]); // Proper dependency array with all used values

  const handleResetPassword = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password#`,
      });
      
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
      
      // If there was an error, allow the user to try again
      hasAttemptedResetRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Invalid Request</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              No email address provided. Please try the reset password link again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sending reset link to: <span className="font-medium">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-4 rounded-lg">
            {error}
            <button
              onClick={() => {
                hasAttemptedResetRef.current = true; // Set again before retry
                handleResetPassword();
              }}
              className="ml-2 underline hover:text-red-600"
            >
              Try again
            </button>
          </div>
        )}

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-500 p-4 rounded-lg">
            Reset link has been sent to your email address. Please check your inbox.
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-300">
            {isLoading ? 'Sending reset link...' : 'Processing your request...'}
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
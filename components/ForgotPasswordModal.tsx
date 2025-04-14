'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const { supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-app">Reset Password</h2>
        
        {success ? (
          <div className="space-y-4">
            <p className="text-success">
              Reset link has been sent to your email address. Please check your inbox.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 btn-primary rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-app-subtle">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 input-app block w-full"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 text-app-muted hover:text-app"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isLoading || !email}
                className="py-2 px-4 btn-primary rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
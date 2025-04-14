import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function AccountManagement() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Add state for tracking password reset button
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Check if user signed in with OAuth
  const isOAuthUser = user?.app_metadata?.provider === 'google';

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/user/delete?userId=${user.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new handler for password reset with debounce protection
  const handleResetPassword = () => {
    if (isResettingPassword || !user?.email) return;
    
    // Set flag to prevent multiple clicks
    setIsResettingPassword(true);
    
    // Navigate to reset page
    router.push(`/reset-password?email=${encodeURIComponent(user.email)}`);
    
    // Reset the flag after a delay (prevents rapid clicks)
    setTimeout(() => {
      setIsResettingPassword(false);
    }, 3000);
  };

  return (
    <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Account Management</h2>
      
      {/* User Information */}
      <div className="mb-6 space-y-2 text-slate-300">
        <p><span className="font-medium">Email:</span> {user?.email}</p>
        <p><span className="font-medium">Last Sign In:</span> {new Date(user?.last_sign_in_at || '').toLocaleString()}</p>
        <p><span className="font-medium">Account Type:</span> {isOAuthUser ? 'Google Account' : 'Email Account'}</p>
      </div>
      
      <div className="">
        {!isOAuthUser && (
          <button
            onClick={handleResetPassword}
            disabled={isResettingPassword}
            className="block w-full text-left px-4 py-2 bg-slate-700 dark:bg-slate-700 rounded-lg hover:bg-slate-600 dark:hover:bg-slate-600 disabled:opacity-50 text-white"
          >
            {isResettingPassword ? 'Processing Request...' : 'Reset Password'}
          </button>
        )}

        {/* Uncomment if you need the delete account button
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full text-left px-4 py-2 bg-red-600/20 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600/30 dark:hover:bg-red-900/50 mt-4"
        >
          Delete Account
        </button>
        */}
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-white">Delete Account?</h3>
            <p className="text-slate-300 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            {error && (
              <p className="text-red-500 mb-4">{error}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
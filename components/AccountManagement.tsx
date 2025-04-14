import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function AccountManagement() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

  const handleResetPassword = () => {
    if (isResettingPassword || !user?.email) return;
    
    setIsResettingPassword(true);
    
    router.push(`/reset-password?email=${encodeURIComponent(user.email)}`);
    
    setTimeout(() => {
      setIsResettingPassword(false);
    }, 3000);
  };

  return (
    <div className="bg-surface rounded-lg shadow-xs p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-app">Account Management</h2>
      
      <div className="mb-6 space-y-2 text-app-muted">
        <p><span className="font-medium">Email:</span> {user?.email}</p>
        <p><span className="font-medium">Last Sign In:</span> {new Date(user?.last_sign_in_at || '').toLocaleString()}</p>
        <p><span className="font-medium">Account Type:</span> {isOAuthUser ? 'Google Account' : 'Email Account'}</p>
      </div>
      
      <div className="">
        {!isOAuthUser && (
          <button
            onClick={handleResetPassword}
            disabled={isResettingPassword}
            className="block w-full text-left px-4 py-2 bg-app-muted rounded-lg hover:bg-app-subtle disabled:opacity-50 text-app"
          >
            {isResettingPassword ? 'Processing Request...' : 'Reset Password'}
          </button>
        )}

        {/* Uncomment if you need the delete account button
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full text-left px-4 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 mt-4"
        >
          Delete Account
        </button>
        */}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-app">Delete Account?</h3>
            <p className="text-app-muted mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            {error && (
              <p className="text-danger mb-4">{error}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-app-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="px-4 py-2 bg-danger text-white rounded-lg disabled:opacity-50"
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
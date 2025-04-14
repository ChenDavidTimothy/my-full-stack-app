'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { StripeBuyButton } from '@/components/StripeBuyButton';
import { useTrialStatus } from '@/hooks/useTrialStatus';

function ProfileContent() {
  const { user } = useAuth();
  const { subscription, isLoading: isLoadingSubscription, syncWithStripe, fetchSubscription } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isInTrial, trialEndTime } = useTrialStatus();

  // Show payment success message if redirected from successful payment
  useEffect(() => {
    if (paymentStatus === 'success') {
      // Could add a toast notification here
      console.log('Payment successful!');
    }
  }, [paymentStatus]);

  // Add error handling for subscription sync
  useEffect(() => {
    if (subscription?.stripe_subscription_id) {
      try {
        syncWithStripe(subscription.stripe_subscription_id);
        console.log('Subscription synced with Stripe successfully');
      } catch (err: unknown) {
        console.error('Error syncing with Stripe:', err);
        setError('Unable to load subscription details');
      }
    }
  }, [syncWithStripe, subscription?.stripe_subscription_id]);

  // Add loading timeout with auto-refresh
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let refreshAttempts = 0;
    const MAX_REFRESH_ATTEMPTS = 3;
    const REFRESH_INTERVAL = 3000; // 3 seconds
    
    const attemptRefresh = async () => {
      if (refreshAttempts < MAX_REFRESH_ATTEMPTS) {
        refreshAttempts++;
        console.log(`Attempting auto-refresh (${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})`);
        await fetchSubscription();
        
        // If still loading, schedule next attempt
        if (isLoadingSubscription) {
          timeoutId = setTimeout(attemptRefresh, REFRESH_INTERVAL);
        }
      } else {
        setError('Loading subscription is taking longer than expected. Please refresh the page.');
      }
    };

    if (isLoadingSubscription) {
      timeoutId = setTimeout(attemptRefresh, REFRESH_INTERVAL);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoadingSubscription, fetchSubscription]);

  // Add useEffect for auth check
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Add refresh effect
  useEffect(() => {
    if (user?.id) {
      fetchSubscription();
    }
  }, [user?.id, fetchSubscription]);

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;
    
    setIsCancelling(true);
    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId: subscription.stripe_subscription_id 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      setIsCancelModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;
    
    try {
      const response = await fetch('/api/stripe/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId: subscription.stripe_subscription_id 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to reactivate subscription');
      
      router.refresh();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="text-app">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app mb-4 mx-auto"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-danger">
          Failed to load subscription details. Please try refreshing.
        </div>
      }
    >
      <div className="min-h-screen bg-app">
        <div className="w-full max-w-4xl mx-auto p-8">
          {paymentStatus === 'success' && (
            <div className="mb-8 p-4 bg-success/10 rounded-lg">
              <p className="text-success">
                🎉 Thank you for your subscription! Your payment was successful.
              </p>
            </div>
          )}
          
          <h1 className="text-3xl font-bold mb-8 text-app">Profile</h1>
          
          <div className="bg-surface rounded-lg shadow-xs p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-app">Account Management</h2>
            
            {/* User Information */}
            <div className="mb-6 space-y-2 text-app-muted">
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Last Sign In:</span> {new Date(user?.last_sign_in_at || '').toLocaleString()}</p>
              <p><span className="font-medium">Account Type:</span> {user?.app_metadata?.provider === 'google' ? 'Google Account' : 'Email Account'}</p>
            </div>
            
            <div className="">
              {user?.app_metadata?.provider !== 'google' && (
                <button
                  onClick={() => router.push(`/reset-password?email=${encodeURIComponent(user?.email || '')}`)}
                  className="block w-full text-left px-4 py-2 bg-app-muted rounded-lg hover:bg-app-subtle text-app"
                >
                  Reset Password
                </button>
              )}
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-surface rounded-lg shadow-xs p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-app">Subscription Status</h2>
            {error ? (
              <div className="text-danger">{error}</div>
            ) : isLoadingSubscription ? (
              <div className="flex items-center space-x-2 text-app">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Loading subscription details...</span>
              </div>
            ) : subscription ? (
              <div className="space-y-2 text-app-muted">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`${subscription.status === 'active' ? 'text-success' : 'text-warning'}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </p>
                <p><span className="font-medium">Started:</span> {new Date(subscription.created_at).toLocaleDateString()}</p>
                
                {subscription.status === 'canceled' ? (
                  <div className="mt-4">
                    <Link
                      href="/pay"
                      className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-subtle hover:shadow-hover transition-all"
                    >
                      Resubscribe
                    </Link>
                  </div>
                ) : subscription.cancel_at_period_end ? (
                  <div className="mt-4 p-4 bg-warning/10 text-warning rounded-lg">
                    <p className="mb-2">
                      Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                    <button
                      onClick={handleReactivateSubscription}
                      className="bg-success hover:bg-success-light text-white px-4 py-2 rounded-lg"
                    >
                      Resume Subscription
                    </button>
                  </div>
                ) : (subscription.status === 'active' || subscription.status === 'trialing') ? (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="bg-danger hover:bg-danger-light text-white px-4 py-2 rounded-lg mt-4"
                  >
                    Cancel Subscription
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-app">
                {isInTrial ? (
                  <>
                    <p className="text-warning">
                      You are currently in your 48-hour trial period. Your trial will end on {' '}
                      {trialEndTime ? new Date(trialEndTime).toLocaleDateString() : 'soon'}.
                    </p>
                    <p>Subscribe now to continue using the app after the trial ends.</p>
                  </>
                ) : trialEndTime ? (
                  <>
                    <div className="p-4 bg-danger/10 text-danger rounded-lg mb-4">
                      <p>
                        Your trial period ended on {new Date(trialEndTime).toLocaleDateString()}.
                      </p>
                      <p className="mt-2">Subscribe now to regain access to the app.</p>
                    </div>
                  </>
                ) : (
                  <p>Subscribe to unlock the full experience.</p>
                )}
                
                <StripeBuyButton
                  buyButtonId={process.env.NEXT_PUBLIC_STRIPE_BUTTON_ID || ''}
                  publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
                />
              </div>
            )}
          </div>

          {/* Cancel Confirmation Modal */}
          {isCancelModalOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-surface rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4 text-app">Cancel Subscription?</h3>
                <p className="text-app-muted mb-6">
                  You&apos;ll continue to have access until the end of your billing period on {new Date(subscription?.current_period_end || '').toLocaleDateString()}. No refunds are provided for cancellations.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setIsCancelModalOpen(false)}
                    className="px-4 py-2 text-app-muted hover:bg-app-muted rounded-lg"
                    disabled={isCancelling}
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="bg-danger hover:bg-danger-light text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Canceling...
                      </>
                    ) : (
                      'Yes, Cancel'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfileContent />
    </Suspense>
  );
}
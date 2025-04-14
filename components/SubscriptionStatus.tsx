import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';

export function SubscriptionStatus() {
  const { subscription, isLoading, error } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return <div className="animate-pulse text-app-muted">Checking subscription status...</div>;
  }

  if (error) {
    return <div className="text-danger">Error checking subscription: {error}</div>;
  }

  if (subscription?.status === 'active' || subscription?.status === 'trialing') {
    return (
      <div className="text-center space-y-4">
        <div className="status-success">
          You have an active subscription!
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="btn-primary px-6 py-2 rounded-lg"
        >
          View Subscription Details
        </button>
      </div>
    );
  }

  return null;
}
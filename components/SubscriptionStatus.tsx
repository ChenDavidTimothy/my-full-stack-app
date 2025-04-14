import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export function SubscriptionStatus() {
  const { subscription, isLoading, error } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Checking subscription status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Error checking subscription: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (subscription?.status === 'active' || subscription?.status === 'trialing') {
    return (
      <div className="text-center space-y-4">
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Subscription Active</AlertTitle>
          <AlertDescription>
            You have an active subscription!
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/profile')}>
          View Subscription Details
        </Button>
      </div>
    );
  }

  return null;
}
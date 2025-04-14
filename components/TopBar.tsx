'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { BuyMeCoffee } from './BuyMeCoffee';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function TopBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { isInTrial } = useTrialStatus();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setIsLoggingOut(false);
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showSubscriptionButton = !isLoadingSubscription && (!isInTrial) && (
    !subscription || 
    subscription.status === 'canceled' || 
    (subscription.cancel_at_period_end && new Date(subscription.current_period_end) > new Date())
  );

  const showDashboardButton = !isLoadingSubscription && (
    subscription || isInTrial
  ) && pathname !== '/dashboard';

  return (
    <div className="w-full border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        <Link href="/" className="text-md sm:text-lg font-medium flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🎬</span>
          <span className="font-sans">NextTemp</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <ThemeToggle />
          
          {!user ? (
            <>
              <BuyMeCoffee />
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </>
          ) : (
            <>
              {showSubscriptionButton && (
                <Button 
                  onClick={() => router.push('/profile')}
                  className="hidden sm:inline-flex"
                >
                  View Subscription
                </Button>
              )}
              
              <BuyMeCoffee />

              {showDashboardButton && (
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="hidden sm:inline-flex"
                >
                  {isInTrial ? "Start Free Trial" : "Start Building"}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      Profile & Subscription
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-destructive focus:text-destructive"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing Out...
                      </>
                    ) : (
                      'Sign Out'
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
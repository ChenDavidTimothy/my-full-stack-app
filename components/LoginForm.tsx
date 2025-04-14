'use client';

import { useState } from 'react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface LoginFormProps {
  onSubmit: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function LoginForm({ 
  onSubmit, 
  onGoogleSignIn, 
  isLoading, 
  error 
}: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, isSignUp);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">🎬</span>
          <CardTitle className="text-2xl font-medium">
            NextTemp
          </CardTitle>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <Button
          variant="outline"
          onClick={onGoogleSignIn}
          className="w-full"
        >
          <Image
            src="/Google-Logo.png"
            alt="Google Logo"
            width={20}
            height={20}
            className="mr-2"
          />
          Sign in with Google
        </Button>

        <div className="flex items-center">
          <Separator className="flex-grow" />
          <span className="mx-4 text-sm text-muted-foreground">OR</span>
          <Separator className="flex-grow" />
        </div>

        <div className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Create an account' : 'Are you an Email User?'}
          </CardTitle>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="p-0 h-auto"
            >
              Forgot your password?
            </Button>
          </div>

          <ForgotPasswordModal 
            isOpen={isForgotPasswordOpen}
            onClose={() => setIsForgotPasswordOpen(false)}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isSignUp ? 'Sign up' : 'Sign in'} with Email
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </Button>
      </CardFooter>
    </Card>
  );
}
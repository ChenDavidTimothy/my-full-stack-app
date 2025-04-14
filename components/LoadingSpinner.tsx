/**
 * Loading spinner component for Suspense fallback
 * @file components/LoadingSpinner.tsx
 */
import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative h-12 w-12">
        <Skeleton className="absolute inset-0 rounded-full animate-spin" />
      </div>
    </div>
  );
}
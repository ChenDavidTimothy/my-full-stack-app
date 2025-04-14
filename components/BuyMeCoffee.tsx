import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BuyMeCoffee() {
  const COFFEE_URL = 'https://buy.stripe.com/5kA176bA895ggog4gh';

  return (
    <Button
      variant="default"
      className="hidden sm:flex"
      asChild
    >
      <a 
        href={COFFEE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Coffee className="mr-2 h-4 w-4" />
        <span>Buy Me a Coffee</span>
      </a>
    </Button>
  );
}
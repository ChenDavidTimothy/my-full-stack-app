import { ReactNode } from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';

interface MetricCardProps {
  number: string;
  label: string;
  icon: ReactNode;
}

export const MetricCard = ({ number, label, icon }: MetricCardProps) => (
  <Card className="bg-accent">
    <CardContent className="p-4 text-center">
      <div className="flex justify-center mb-2 text-primary">
        {icon}
      </div>
      <div className="text-2xl font-bold">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </CardContent>
  </Card>
);
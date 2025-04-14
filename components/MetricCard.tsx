import { ReactNode } from 'react';

interface MetricCardProps {
  number: string;
  label: string;
  icon: ReactNode;
}

export const MetricCard = ({ number, label, icon }: MetricCardProps) => (
  <div className="bg-app-subtle rounded-lg p-4">
    {/* Center icon */}
    <div className="flex justify-center mb-2 text-primary">
      {icon}
    </div>
    {/* Center number and label */}
    <div className="text-center">
      <div className="text-2xl font-bold text-app">{number}</div>
      <div className="text-sm text-app-muted">{label}</div>
    </div>
  </div>
);
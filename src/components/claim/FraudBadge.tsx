import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, ShieldAlert } from 'lucide-react';

interface FraudBadgeProps {
  risk: 'low' | 'medium' | 'high';
  score: number;
}

const config = {
  low: {
    label: 'Low Risk',
    icon: Shield,
    className: 'bg-success text-success-foreground hover:bg-success/90',
  },
  medium: {
    label: 'Medium Risk',
    icon: AlertTriangle,
    className: 'bg-warning text-warning-foreground hover:bg-warning/90',
  },
  high: {
    label: 'High Risk',
    icon: ShieldAlert,
    className: 'bg-danger text-danger-foreground hover:bg-danger/90',
  },
};

export function FraudBadge({ risk, score }: FraudBadgeProps) {
  const { label, icon: Icon, className } = config[risk];

  return (
    <Badge className={`${className} gap-1.5 px-3 py-1.5 text-sm font-semibold`}>
      <Icon className="h-4 w-4" />
      {label} ({score}/100)
    </Badge>
  );
}

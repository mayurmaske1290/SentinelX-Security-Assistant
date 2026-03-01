import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'danger' | 'warning' | 'safe';
}

const variantStyles = {
  default: 'border-border',
  danger: 'border-danger/30 cyber-border',
  warning: 'border-warning/30',
  safe: 'border-safe/30',
};

const iconVariantStyles = {
  default: 'bg-primary/15 text-primary',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-warning/15 text-warning',
  safe: 'bg-safe/15 text-safe',
};

export function StatCard({ label, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <Card className={`p-5 bg-card ${variantStyles[variant]} transition-all hover:cyber-glow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-display font-bold mt-1">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconVariantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

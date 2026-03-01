import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { BehaviorIndicator } from '@/lib/types';

interface BehaviorPanelProps {
  behaviors: BehaviorIndicator[];
}

const severityIcons = {
  high: <AlertTriangle className="w-4 h-4 text-danger" />,
  medium: <AlertTriangle className="w-4 h-4 text-warning" />,
  low: <AlertTriangle className="w-4 h-4 text-muted-foreground" />,
};

export function BehaviorPanel({ behaviors }: BehaviorPanelProps) {
  const detected = behaviors.filter(b => b.detected);
  const safe = behaviors.filter(b => !b.detected);

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-display font-semibold text-lg mb-4">Behavior Analysis</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {detected.length} of {behaviors.length} suspicious behaviors detected
      </p>

      <div className="space-y-2">
        {detected.map(b => (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-danger/5 border border-danger/20">
            <XCircle className="w-5 h-5 text-danger shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.description}</p>
            </div>
            {severityIcons[b.severity]}
          </div>
        ))}
        {safe.map(b => (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-safe/5 border border-safe/10">
            <CheckCircle2 className="w-5 h-5 text-safe shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{b.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

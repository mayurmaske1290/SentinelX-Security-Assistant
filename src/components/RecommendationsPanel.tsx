import { Card } from '@/components/ui/card';
import type { Recommendation } from '@/lib/types';

const priorityStyles = {
  critical: 'border-danger/30 bg-danger/5',
  high: 'border-warning/30 bg-warning/5',
  medium: 'border-border',
  low: 'border-safe/30 bg-safe/5',
};

const priorityLabels = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

const priorityColors = {
  critical: 'text-danger',
  high: 'text-warning',
  medium: 'text-muted-foreground',
  low: 'text-safe',
};

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-display font-semibold text-lg mb-4">Recommended Actions</h3>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${priorityStyles[rec.priority]}`}>
            <span className="text-xl">{rec.icon}</span>
            <div className="flex-1">
              <p className="text-sm">{rec.action}</p>
            </div>
            <span className={`text-[10px] font-mono font-semibold uppercase ${priorityColors[rec.priority]}`}>
              {priorityLabels[rec.priority]}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RiskLevel } from '@/lib/types';

interface RiskDisplayProps {
  score: number;
  level: RiskLevel;
  confidence: number;
}

const levelConfig = {
  low: { label: 'Low Risk', color: 'bg-safe text-safe-foreground' },
  medium: { label: 'Medium Risk', color: 'bg-warning text-warning-foreground' },
  high: { label: 'High Risk', color: 'bg-danger text-danger-foreground' },
};

const circleColors = {
  low: 'stroke-safe',
  medium: 'stroke-warning',
  high: 'stroke-danger',
};

export function RiskDisplay({ score, level, confidence }: RiskDisplayProps) {
  const config = levelConfig[level];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="p-6 bg-card border-border flex flex-col items-center gap-4">
      <h3 className="font-display font-semibold text-lg">Risk Assessment</h3>

      {/* Circular gauge */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            className={circleColors[level]}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      <Badge className={`${config.color} px-3 py-1 text-sm font-semibold`}>
        {config.label}
      </Badge>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">Confidence</p>
        <p className="text-lg font-mono font-semibold">{confidence}%</p>
      </div>
    </Card>
  );
}

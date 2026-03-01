import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RiskLevelExtended } from '@/lib/aiAnalysis';

interface AnimatedRiskMeterProps {
  score: number;
  level: RiskLevelExtended;
  confidence: number;
  fraudType?: string | null;
  classification?: 'safe' | 'suspicious' | 'fraud';
}

const levelConfig = {
  low: { label: 'Low Risk', color: 'bg-safe text-safe-foreground', glow: 'shadow-[0_0_20px_hsl(var(--safe)/0.3)]' },
  medium: { label: 'Medium Risk', color: 'bg-warning text-warning-foreground', glow: 'shadow-[0_0_20px_hsl(var(--warning)/0.3)]' },
  high: { label: 'High Risk', color: 'bg-danger text-danger-foreground', glow: 'shadow-[0_0_20px_hsl(var(--danger)/0.3)]' },
  critical: { label: 'CRITICAL', color: 'bg-destructive text-destructive-foreground', glow: 'shadow-[0_0_30px_hsl(var(--danger)/0.5)]' },
};

const circleColors = {
  low: 'stroke-safe',
  medium: 'stroke-warning',
  high: 'stroke-danger',
  critical: 'stroke-destructive',
};

const classificationBadge = {
  safe: { label: '✅ SAFE', class: 'bg-safe/20 text-safe border-safe/30' },
  suspicious: { label: '⚠️ SUSPICIOUS', class: 'bg-warning/20 text-warning border-warning/30' },
  fraud: { label: '🚨 FRAUD', class: 'bg-danger/20 text-danger border-danger/30' },
};

export function AnimatedRiskMeter({ score, level, confidence, fraudType, classification }: AnimatedRiskMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = levelConfig[level];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <Card className={`p-6 bg-card border-border flex flex-col items-center gap-4 ${config.glow} transition-shadow duration-1000`}>
      <h3 className="font-display font-semibold text-lg">Risk Assessment</h3>

      {classification && (
        <Badge variant="outline" className={`${classificationBadge[classification].class} text-sm px-3 py-1 font-semibold`}>
          {classificationBadge[classification].label}
        </Badge>
      )}

      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            className={circleColors[level]}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-display font-bold">{animatedScore}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      <Badge className={`${config.color} px-3 py-1 text-sm font-semibold`}>
        {config.label}
      </Badge>

      {fraudType && (
        <Badge variant="outline" className="border-primary/30 text-primary text-xs">
          🎯 {fraudType}
        </Badge>
      )}

      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">AI Confidence</p>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-sm font-mono font-semibold">{confidence}%</span>
        </div>
      </div>
    </Card>
  );
}

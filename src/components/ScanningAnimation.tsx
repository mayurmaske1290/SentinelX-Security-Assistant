import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Brain, Shield, Search, Zap } from 'lucide-react';

const stages = [
  { icon: Search, label: 'Rule-based pattern matching...', color: 'text-primary' },
  { icon: Brain, label: 'AI semantic analysis running...', color: 'text-primary' },
  { icon: Shield, label: 'URL threat intelligence check...', color: 'text-warning' },
  { icon: Zap, label: 'Computing hybrid risk score...', color: 'text-safe' },
];

export function ScanningAnimation() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage(s => (s + 1) % stages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const current = stages[stage];

  return (
    <Card className="p-6 bg-card border-border cyber-border overflow-hidden">
      <div className="flex flex-col items-center gap-4">
        {/* Animated scanner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <current.icon className={`w-8 h-8 ${current.color} transition-all duration-300`} />
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">Analyzing with AI...</p>
          <p className="text-xs text-muted-foreground transition-all duration-300">{current.label}</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {stages.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= stage ? 'bg-primary scale-110' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

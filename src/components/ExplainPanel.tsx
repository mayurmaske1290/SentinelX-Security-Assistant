import { Card } from '@/components/ui/card';
import { Brain, AlertCircle, Info } from 'lucide-react';
import type { Explanation } from '@/lib/types';

interface ExplainPanelProps {
  explanation: Explanation;
}

export function ExplainPanel({ explanation }: ExplainPanelProps) {
  return (
    <Card className="p-6 bg-card border-border cyber-border">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">AI Explainability</h3>
      </div>

      <p className="text-sm leading-relaxed mb-4">{explanation.summary}</p>

      {explanation.malwareCategory && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 mb-4">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm font-medium">Classified as: <span className="text-danger">{explanation.malwareCategory}</span></p>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Why was this flagged?</h4>
        {explanation.reasons.map((reason, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className="text-primary font-mono shrink-0">{String(i + 1).padStart(2, '0')}.</span>
            <p className="text-muted-foreground">{reason}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">{explanation.confidenceReasoning}</p>
      </div>
    </Card>
  );
}

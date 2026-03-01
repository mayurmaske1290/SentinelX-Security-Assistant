import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertCircle, Info, Shield, Zap } from 'lucide-react';
import type { Explanation } from '@/lib/types';
import type { AIAnalysisResult } from '@/lib/aiAnalysis';

interface AIExplainPanelProps {
  explanation: Explanation;
  aiResult?: AIAnalysisResult | null;
}

const tacticIcons: Record<string, string> = {
  urgency: '⏰',
  authority: '👔',
  fear: '😨',
  greed: '💰',
  social_proof: '👥',
  scarcity: '⚡',
};

export function AIExplainPanel({ explanation, aiResult }: AIExplainPanelProps) {
  return (
    <Card className="p-6 bg-card border-border cyber-border">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">AI Explainability</h3>
        {aiResult && (
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] ml-auto">
            <Zap className="w-3 h-3 mr-1" /> AI-Powered
          </Badge>
        )}
      </div>

      {/* AI-generated contextual explanation */}
      {aiResult?.explanation && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
          <p className="text-sm leading-relaxed">{aiResult.explanation}</p>
        </div>
      )}

      {!aiResult?.explanation && (
        <p className="text-sm leading-relaxed mb-4">{explanation.summary}</p>
      )}

      {explanation.malwareCategory && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 mb-4">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm font-medium">Classified as: <span className="text-danger">{explanation.malwareCategory}</span></p>
        </div>
      )}

      {/* Psychological Tactics Detected */}
      {aiResult?.psychologicalTactics && aiResult.psychologicalTactics.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Manipulation Tactics Detected
          </h4>
          <div className="flex flex-wrap gap-2">
            {aiResult.psychologicalTactics.map((tactic, i) => (
              <Badge key={i} variant="outline" className="border-warning/30 text-warning text-xs">
                {tacticIcons[tactic] || '🔍'} {tactic.charAt(0).toUpperCase() + tactic.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Detected Patterns */}
      {aiResult?.detectedPatterns && aiResult.detectedPatterns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Detected Patterns
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {aiResult.detectedPatterns.map((pattern, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {pattern}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* URL Analysis */}
      {aiResult?.urlAnalysis && (aiResult.urlAnalysis.hasHomoglyphAttack || aiResult.urlAnalysis.isShortenedUrl || aiResult.urlAnalysis.suspiciousDomainPattern) && (
        <div className="mb-4 p-3 rounded-lg bg-warning/5 border border-warning/15">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-warning" />
            <h4 className="text-sm font-semibold text-warning">URL Threat Analysis</h4>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            {aiResult.urlAnalysis.hasHomoglyphAttack && (
              <p>⚠️ <strong className="text-foreground">Homoglyph attack detected:</strong> {aiResult.urlAnalysis.homoglyphDetails || 'Lookalike characters used in domain'}</p>
            )}
            {aiResult.urlAnalysis.isShortenedUrl && (
              <p>⚠️ <strong className="text-foreground">Shortened URL detected:</strong> Hides actual destination</p>
            )}
            {aiResult.urlAnalysis.suspiciousDomainPattern && (
              <p>⚠️ <strong className="text-foreground">Suspicious domain:</strong> {aiResult.urlAnalysis.domainRiskReason}</p>
            )}
          </div>
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

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnimatedRiskMeter } from '@/components/AnimatedRiskMeter';
import { AIExplainPanel } from '@/components/AIExplainPanel';
import { RiskBreakdownChart } from '@/components/RiskBreakdownChart';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';
import { FeedbackButtons } from '@/components/FeedbackButtons';
import { DemoMode } from '@/components/DemoMode';
import { ScanningAnimation } from '@/components/ScanningAnimation';
import { MessageSquareWarning, ScanSearch } from 'lucide-react';
import { analyzeSms, calculateSmsRiskScore, generateSmsExplanation, generateSmsRecommendations } from '@/lib/smsScoring';
import { getRiskLevel } from '@/lib/scoring';
import { runAIAnalysis, computeHybridScore, type AIAnalysisResult } from '@/lib/aiAnalysis';
import { saveFraudScan } from '@/lib/fraudStorage';
import type { FraudScanResult } from '@/lib/fraudTypes';
import type { DemoMessage } from '@/lib/demoData';
import { toast } from 'sonner';

export default function SmsScanPage() {
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<FraudScanResult | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [hybridBreakdown, setHybridBreakdown] = useState<{ keyword: number; url: number; behavioral: number; aiModel: number; sender: number } | null>(null);

  const handleScan = async () => {
    if (!message.trim()) return;
    setIsScanning(true);
    setResult(null);
    setAiResult(null);

    const analysis = analyzeSms({ message: message.trim() });
    const { score: ruleScore, confidence: ruleConfidence, breakdown } = calculateSmsRiskScore(analysis);

    let ai: AIAnalysisResult | null = null;
    try {
      ai = await runAIAnalysis('sms', message.trim());
    } catch {
      toast.error('AI analysis unavailable, using rule-based scoring');
    }
    setAiResult(ai);

    const hybrid = computeHybridScore(ruleScore, ruleConfidence, ai);
    setHybridBreakdown(hybrid.breakdown);

    const riskLevel = getRiskLevel(hybrid.finalScore);
    const explanation = generateSmsExplanation(analysis, hybrid.finalScore, hybrid.finalConfidence);
    if (ai?.explanation) explanation.summary = ai.explanation;
    if (ai?.fraudType) explanation.malwareCategory = ai.fraudType;

    const recommendations = generateSmsRecommendations(hybrid.finalScore, riskLevel);

    const scanResult: FraudScanResult = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'sms',
      target: message.trim().slice(0, 80) + (message.length > 80 ? '...' : ''),
      riskScore: hybrid.finalScore,
      riskLevel,
      confidence: hybrid.finalConfidence,
      riskBreakdown: { metadata: breakdown.threats, behavior: breakdown.urgency, urlStructure: breakdown.links, patternMatch: breakdown.reward },
      explanation,
      recommendations,
      rawAnalysis: { ruleAnalysis: analysis, aiAnalysis: ai },
    };

    saveFraudScan(scanResult);
    setResult(scanResult);
    setIsScanning(false);
  };

  const handleDemo = (demo: DemoMessage) => setMessage(demo.body);

  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">SMS Fraud Detector</h1>
          <p className="text-muted-foreground mt-1">AI-powered SMS fraud analysis with contextual intelligence</p>
        </div>

        <DemoMode onSelect={handleDemo} filterType="sms" />

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquareWarning className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">SMS Content</h3>
          </div>
          <div className="space-y-4">
            <Textarea placeholder="Paste the suspicious SMS message here..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="bg-secondary border-border" />
            <Button onClick={handleScan} disabled={!message.trim() || isScanning} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {isScanning ? <><span className="scan-pulse">⟳</span> AI Analyzing...</> : <><ScanSearch className="w-4 h-4" /> Analyze with AI</>}
            </Button>
          </div>
        </Card>

        {isScanning && <ScanningAnimation />}

        {result && (
          <div className="space-y-6 fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnimatedRiskMeter score={result.riskScore} level={result.riskLevel as any} confidence={result.confidence} fraudType={aiResult?.fraudType} classification={aiResult?.classification} />
              <div className="lg:col-span-2">
                <AIExplainPanel explanation={result.explanation} aiResult={aiResult} />
              </div>
            </div>
            {hybridBreakdown && <RiskBreakdownChart breakdown={hybridBreakdown} />}
            <RecommendationsPanel recommendations={result.recommendations} />
            <FeedbackButtons scanId={result.id} scanType="sms" content={message} originalScore={result.riskScore} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

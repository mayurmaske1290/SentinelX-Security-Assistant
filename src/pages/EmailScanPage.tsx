import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnimatedRiskMeter } from '@/components/AnimatedRiskMeter';
import { AIExplainPanel } from '@/components/AIExplainPanel';
import { RiskBreakdownChart } from '@/components/RiskBreakdownChart';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';
import { FeedbackButtons } from '@/components/FeedbackButtons';
import { DemoMode } from '@/components/DemoMode';
import { ScanningAnimation } from '@/components/ScanningAnimation';
import { Mail, ScanSearch } from 'lucide-react';
import { analyzeEmail, calculateEmailRiskScore, generateEmailExplanation, generateEmailRecommendations } from '@/lib/emailScoring';
import { getRiskLevel } from '@/lib/scoring';
import { runAIAnalysis, computeHybridScore, type AIAnalysisResult } from '@/lib/aiAnalysis';
import { saveFraudScan } from '@/lib/fraudStorage';
import type { FraudScanResult } from '@/lib/fraudTypes';
import type { DemoMessage } from '@/lib/demoData';
import { toast } from 'sonner';

export default function EmailScanPage() {
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<FraudScanResult | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [hybridBreakdown, setHybridBreakdown] = useState<{ keyword: number; url: number; behavioral: number; aiModel: number; sender: number } | null>(null);

  const handleScan = async () => {
    if (!senderEmail.trim() || !subject.trim() || !body.trim()) return;
    setIsScanning(true);
    setResult(null);
    setAiResult(null);

    // Run rule-based + AI in parallel
    const analysis = analyzeEmail({ senderEmail: senderEmail.trim(), subject: subject.trim(), body: body.trim() });
    const { score: ruleScore, confidence: ruleConfidence, breakdown } = calculateEmailRiskScore(analysis);

    let ai: AIAnalysisResult | null = null;
    try {
      ai = await runAIAnalysis('email', body.trim(), senderEmail.trim(), subject.trim());
    } catch {
      toast.error('AI analysis unavailable, using rule-based scoring');
    }

    setAiResult(ai);

    const hybrid = computeHybridScore(ruleScore, ruleConfidence, ai);
    setHybridBreakdown(hybrid.breakdown);

    const riskLevel = getRiskLevel(hybrid.finalScore);
    const explanation = generateEmailExplanation(analysis, hybrid.finalScore, hybrid.finalConfidence);

    // Override explanation with AI if available
    if (ai?.explanation) {
      explanation.summary = ai.explanation;
    }
    if (ai?.fraudType) {
      explanation.malwareCategory = ai.fraudType;
    }

    const recommendations = generateEmailRecommendations(hybrid.finalScore, riskLevel);

    const scanResult: FraudScanResult = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'email',
      target: `${senderEmail} — ${subject}`,
      riskScore: hybrid.finalScore,
      riskLevel,
      confidence: hybrid.finalConfidence,
      riskBreakdown: {
        metadata: breakdown.domain,
        behavior: breakdown.urgency,
        urlStructure: breakdown.links,
        patternMatch: breakdown.personalData,
      },
      explanation,
      recommendations,
      rawAnalysis: { ruleAnalysis: analysis, aiAnalysis: ai },
    };

    saveFraudScan(scanResult);
    setResult(scanResult);
    setIsScanning(false);
  };

  const handleDemo = (demo: DemoMessage) => {
    setSenderEmail(demo.senderEmail || '');
    setSubject(demo.subject || '');
    setBody(demo.body);
  };

  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Email Phishing Detector</h1>
          <p className="text-muted-foreground mt-1">AI-powered phishing analysis with semantic understanding</p>
        </div>

        <DemoMode onSelect={handleDemo} filterType="email" />

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Email Details</h3>
          </div>
          <div className="space-y-4">
            <Input placeholder="Sender email address (e.g. support@paypa1.com)" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className="bg-secondary border-border" />
            <Input placeholder="Email subject line" value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-secondary border-border" />
            <Textarea placeholder="Paste the email body content here..." value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="bg-secondary border-border" />
            <Button onClick={handleScan} disabled={!senderEmail.trim() || !subject.trim() || !body.trim() || isScanning} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {isScanning ? <><span className="scan-pulse">⟳</span> AI Analyzing...</> : <><ScanSearch className="w-4 h-4" /> Analyze with AI</>}
            </Button>
          </div>
        </Card>

        {isScanning && <ScanningAnimation />}

        {result && (
          <div className="space-y-6 fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnimatedRiskMeter
                score={result.riskScore}
                level={result.riskLevel as any}
                confidence={result.confidence}
                fraudType={aiResult?.fraudType}
                classification={aiResult?.classification}
              />
              <div className="lg:col-span-2">
                <AIExplainPanel explanation={result.explanation} aiResult={aiResult} />
              </div>
            </div>
            {hybridBreakdown && <RiskBreakdownChart breakdown={hybridBreakdown} />}
            <RecommendationsPanel recommendations={result.recommendations} />
            <FeedbackButtons scanId={result.id} scanType="email" content={`${senderEmail}${subject}${body}`} originalScore={result.riskScore} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

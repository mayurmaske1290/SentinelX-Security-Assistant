import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ScanForm } from '@/components/ScanForm';
import { RiskDisplay } from '@/components/RiskDisplay';
import { BehaviorPanel } from '@/components/BehaviorPanel';
import { ExplainPanel } from '@/components/ExplainPanel';
import { RiskChart } from '@/components/RiskChart';
import { RecommendationsPanel } from '@/components/RecommendationsPanel';
import { ScanLoading } from '@/components/ScanLoading';
import { analyzeFileMetadata, analyzeUrl, computeFileHash, calculateRiskScore, getRiskLevel } from '@/lib/scoring';
import { simulateBehaviorAnalysis, getBehaviorScore } from '@/lib/behavior';
import { generateExplanation, generateRecommendations } from '@/lib/explainability';
import { saveScanResult, getScanById } from '@/lib/storage';
import type { ScanResult } from '@/lib/types';
import { useMemo } from 'react';

export default function NewScan() {
  const { id } = useParams<{ id: string }>();
  const existingScan = useMemo(() => id ? getScanById(id) : null, [id]);

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(existingScan);

  const handleScan = async (data: { type: 'file'; file: File } | { type: 'url'; url: string }) => {
    setIsScanning(true);
    setResult(null);

    // Simulate analysis delay
    await new Promise(r => setTimeout(r, 2000));

    let fileMetadata = undefined;
    let urlAnalysis = undefined;

    if (data.type === 'file') {
      fileMetadata = analyzeFileMetadata(data.file);
      fileMetadata.hash = await computeFileHash(data.file);
    } else {
      urlAnalysis = analyzeUrl(data.url);
    }

    const behaviors = simulateBehaviorAnalysis(fileMetadata, urlAnalysis);
    const behaviorScore = getBehaviorScore(behaviors);
    const { score, breakdown, confidence } = calculateRiskScore(fileMetadata, urlAnalysis, behaviorScore);
    const riskLevel = getRiskLevel(score);

    const scanResult: ScanResult = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: data.type,
      target: data.type === 'file' ? data.file.name : data.url,
      fileMetadata,
      urlAnalysis,
      riskScore: score,
      riskLevel,
      confidence,
      riskBreakdown: breakdown,
      behaviors,
      explanation: { summary: '', reasons: [], malwareCategory: null, confidenceReasoning: '' },
      recommendations: [],
    };

    scanResult.explanation = generateExplanation(scanResult);
    scanResult.recommendations = generateRecommendations(scanResult);

    saveScanResult(scanResult);
    setResult(scanResult);
    setIsScanning(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">{id ? 'Scan Results' : 'New Scan'}</h1>
          <p className="text-muted-foreground mt-1">{id ? 'Detailed analysis report' : 'Upload a file or paste a URL to analyze'}</p>
        </div>

        {!id && <ScanForm onScan={handleScan} isScanning={isScanning} />}

        {isScanning && <ScanLoading />}

        {result && (
          <div className="space-y-6 fade-in">
            {/* File/URL info bar */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
              <span className="text-xs font-mono uppercase text-muted-foreground">{result.type}</span>
              <span className="font-mono text-sm truncate flex-1">{result.target}</span>
              {result.fileMetadata && (
                <>
                  <span className="text-xs text-muted-foreground">{(result.fileMetadata.size / 1024).toFixed(1)} KB</span>
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">SHA256: {result.fileMetadata.hash.slice(0, 12)}...</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RiskDisplay score={result.riskScore} level={result.riskLevel} confidence={result.confidence} />
              <div className="lg:col-span-2">
                <ExplainPanel explanation={result.explanation} />
              </div>
            </div>

            <RiskChart breakdown={result.riskBreakdown} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BehaviorPanel behaviors={result.behaviors} />
              <RecommendationsPanel recommendations={result.recommendations} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

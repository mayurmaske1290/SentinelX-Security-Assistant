import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { getScanHistory } from '@/lib/storage';
import { getFraudHistory } from '@/lib/fraudStorage';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function generateReport(scan: { target: string; type: string; timestamp: string; riskScore: number; riskLevel: string; confidence: number; riskBreakdown: Record<string, number>; explanation: { summary: string; malwareCategory?: string | null; reasons: string[] }; recommendations: { icon: string; priority: string; action: string }[] }) {
  return `
SENTINELX SECURITY REPORT
========================
Generated: ${new Date().toISOString()}

TARGET: ${scan.target}
TYPE: ${scan.type.toUpperCase()}
SCAN DATE: ${new Date(scan.timestamp).toLocaleString()}

RISK ASSESSMENT
--------------
Risk Score: ${scan.riskScore}/100
Risk Level: ${scan.riskLevel.toUpperCase()}
Confidence: ${scan.confidence}%

RISK BREAKDOWN
--------------
${Object.entries(scan.riskBreakdown).map(([k, v]) => `${k}: ${Math.round(v as number)}%`).join('\n')}

AI EXPLANATION
--------------
${scan.explanation.summary}
${scan.explanation.malwareCategory ? `\nClassification: ${scan.explanation.malwareCategory}` : ''}

Reasons:
${scan.explanation.reasons.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

RECOMMENDATIONS
---------------
${scan.recommendations.map((r: { icon: string; priority: string; action: string }) => `${r.icon} [${r.priority.toUpperCase()}] ${r.action}`).join('\n')}
  `.trim();
}

function downloadReport(scan: any) {
  const report = generateReport(scan);
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sentinelx-${scan.type}-report-${scan.id.slice(0, 8)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportList({ scans }: { scans: any[] }) {
  if (scans.length === 0) return (
    <Card className="p-8 bg-card border-border text-center">
      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">No reports available. Run a scan first.</p>
    </Card>
  );

  return (
    <div className="space-y-3">
      {scans.map((scan: any) => (
        <Card key={scan.id} className="p-4 bg-card border-border flex items-center gap-4">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm truncate">{scan.target}</p>
            <p className="text-xs text-muted-foreground">{new Date(scan.timestamp).toLocaleString()}</p>
          </div>
          <Badge variant="outline" className="border-border text-xs uppercase">{scan.type}</Badge>
          <Badge variant="outline" className="border-border text-xs">Score: {scan.riskScore}</Badge>
          <Button variant="outline" size="sm" onClick={() => downloadReport(scan)} className="gap-2 border-border">
            <Download className="w-3 h-3" /> Download
          </Button>
        </Card>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const fileHistory = useMemo(() => getScanHistory(), []);
  const fraudHistory = useMemo(() => getFraudHistory(), []);
  const all = useMemo(() => [...fileHistory, ...fraudHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [fileHistory, fraudHistory]);

  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Download detailed security reports for all scan types</p>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            <TabsTrigger value="file">Files/URLs ({fileHistory.length})</TabsTrigger>
            <TabsTrigger value="fraud">Fraud ({fraudHistory.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all"><ReportList scans={all} /></TabsContent>
          <TabsContent value="file"><ReportList scans={fileHistory} /></TabsContent>
          <TabsContent value="fraud"><ReportList scans={fraudHistory} /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

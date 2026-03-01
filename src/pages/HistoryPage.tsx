import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ScanHistoryTable } from '@/components/ScanHistoryTable';
import { getScanHistory, clearScanHistory } from '@/lib/storage';
import { getFraudHistory, clearFraudHistory } from '@/lib/fraudStorage';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { FraudScanResult } from '@/lib/fraudTypes';

function FraudHistoryTable({ scans }: { scans: FraudScanResult[] }) {
  const navigate = useNavigate();
  if (scans.length === 0) return <Card className="p-8 bg-card border-border text-center"><p className="text-muted-foreground">No scans yet.</p></Card>;

  const levelColor = (l: string) => l === 'high' ? 'text-danger' : l === 'medium' ? 'text-warning' : 'text-safe';

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Target</th>
              <th className="text-left p-3 font-medium">Score</th>
              <th className="text-left p-3 font-medium">Level</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {scans.map(scan => (
              <tr key={scan.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="p-3"><Badge variant="outline" className="border-border text-xs uppercase">{scan.type}</Badge></td>
                <td className="p-3 font-mono text-xs truncate max-w-[250px]">{scan.target}</td>
                <td className="p-3 font-mono font-bold">{scan.riskScore}</td>
                <td className={`p-3 font-semibold uppercase text-xs ${levelColor(scan.riskLevel)}`}>{scan.riskLevel}</td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(scan.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function HistoryPage() {
  const [, setTick] = useState(0);
  const history = useMemo(() => getScanHistory(), []);
  const fraudHistory = useMemo(() => getFraudHistory(), []);
  const emailScans = useMemo(() => fraudHistory.filter(s => s.type === 'email'), [fraudHistory]);
  const smsScans = useMemo(() => fraudHistory.filter(s => s.type === 'sms'), [fraudHistory]);
  const upiScans = useMemo(() => fraudHistory.filter(s => s.type === 'upi'), [fraudHistory]);

  const handleClearAll = () => {
    clearScanHistory();
    clearFraudHistory();
    window.location.reload();
  };

  const total = history.length + fraudHistory.length;

  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Scan History</h1>
            <p className="text-muted-foreground mt-1">{total} scan{total !== 1 ? 's' : ''} recorded</p>
          </div>
          {total > 0 && (
            <Button variant="outline" onClick={handleClearAll} className="gap-2 border-border text-muted-foreground hover:text-destructive hover:border-destructive">
              <Trash2 className="w-4 h-4" /> Clear All
            </Button>
          )}
        </div>

        <Tabs defaultValue="files">
          <TabsList className="bg-secondary">
            <TabsTrigger value="files">Files & URLs ({history.length})</TabsTrigger>
            <TabsTrigger value="email">Email ({emailScans.length})</TabsTrigger>
            <TabsTrigger value="sms">SMS ({smsScans.length})</TabsTrigger>
            <TabsTrigger value="upi">UPI ({upiScans.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="files"><ScanHistoryTable scans={history} /></TabsContent>
          <TabsContent value="email"><FraudHistoryTable scans={emailScans} /></TabsContent>
          <TabsContent value="sms"><FraudHistoryTable scans={smsScans} /></TabsContent>
          <TabsContent value="upi"><FraudHistoryTable scans={upiScans} /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { ScanHistoryTable } from '@/components/ScanHistoryTable';
import { getScanHistory } from '@/lib/storage';
import { getFraudHistory } from '@/lib/fraudStorage';
import { Shield, AlertTriangle, FileSearch, Activity, Mail, MessageSquareWarning, IndianRupee } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const history = useMemo(() => getScanHistory(), []);
  const fraudHistory = useMemo(() => getFraudHistory(), []);
  const allScans = useMemo(() => {
    const combined = [
      ...history.map(s => ({ ...s, source: 'file' as const })),
      ...fraudHistory.map(s => ({ id: s.id, timestamp: s.timestamp, type: s.type, target: s.target, riskScore: s.riskScore, riskLevel: s.riskLevel, confidence: s.confidence, source: 'fraud' as const })),
    ];
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history, fraudHistory]);

  const stats = useMemo(() => {
    const total = allScans.length;
    const highRisk = allScans.filter(s => s.riskLevel === 'high').length;
    const emailScans = fraudHistory.filter(s => s.type === 'email').length;
    const smsScans = fraudHistory.filter(s => s.type === 'sms').length;
    const upiScans = fraudHistory.filter(s => s.type === 'upi').length;
    const avgScore = total > 0 ? Math.round(allScans.reduce((a, s) => a + s.riskScore, 0) / total) : 0;
    return { total, highRisk, emailScans, smsScans, upiScans, avgScore };
  }, [allScans, fraudHistory]);

  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">SentinelX unified threat & fraud intelligence</p>
          </div>
          <Button onClick={() => navigate('/scan')} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <FileSearch className="w-4 h-4" /> New Scan
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Scans" value={stats.total} icon={Shield} />
          <StatCard label="High Risk" value={stats.highRisk} icon={AlertTriangle} variant="danger" />
          <StatCard label="Avg Score" value={stats.avgScore} icon={Activity} variant={stats.avgScore > 60 ? 'danger' : stats.avgScore > 30 ? 'warning' : 'safe'} />
          <StatCard label="Email Scans" value={stats.emailScans} icon={Mail} />
          <StatCard label="SMS Scans" value={stats.smsScans} icon={MessageSquareWarning} />
          <StatCard label="UPI Scans" value={stats.upiScans} icon={IndianRupee} />
        </div>

        <div>
          <h2 className="font-display font-semibold text-xl mb-3">Recent Scans</h2>
          <ScanHistoryTable scans={history} compact />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;

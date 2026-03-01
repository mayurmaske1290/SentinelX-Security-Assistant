import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import type { ScanResult } from '@/lib/types';

const levelBadge = {
  low: 'bg-safe/15 text-safe border-safe/20',
  medium: 'bg-warning/15 text-warning border-warning/20',
  high: 'bg-danger/15 text-danger border-danger/20',
};

interface ScanHistoryTableProps {
  scans: ScanResult[];
  compact?: boolean;
}

export function ScanHistoryTable({ scans, compact }: ScanHistoryTableProps) {
  const navigate = useNavigate();
  const displayScans = compact ? scans.slice(0, 5) : scans;

  if (scans.length === 0) {
    return (
      <Card className="p-8 bg-card border-border text-center">
        <p className="text-muted-foreground">No scans yet. Start by analyzing a file or URL.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Target</TableHead>
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground">Score</TableHead>
            <TableHead className="text-muted-foreground">Risk</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayScans.map(scan => (
            <TableRow
              key={scan.id}
              className="border-border cursor-pointer hover:bg-secondary/50"
              onClick={() => navigate(`/scan/${scan.id}`)}
            >
              <TableCell className="font-mono text-sm max-w-[200px] truncate">{scan.target}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs border-border">{scan.type.toUpperCase()}</Badge>
              </TableCell>
              <TableCell className="font-mono font-semibold">{scan.riskScore}</TableCell>
              <TableCell>
                <Badge className={`${levelBadge[scan.riskLevel]} text-xs border`}>
                  {scan.riskLevel.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(scan.timestamp).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

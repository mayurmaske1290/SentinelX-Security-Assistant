import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface RiskBreakdownChartProps {
  breakdown: {
    keyword: number;
    url: number;
    behavioral: number;
    aiModel: number;
    sender: number;
  };
}

const LABELS: Record<string, string> = {
  keyword: 'Keyword Risk',
  url: 'URL Risk',
  behavioral: 'Behavioral Risk',
  aiModel: 'AI Model Risk',
  sender: 'Sender Risk',
};

const COLORS = [
  'hsl(185, 85%, 48%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 55%)',
  'hsl(150, 70%, 42%)',
  'hsl(270, 60%, 55%)',
];

export function RiskBreakdownChart({ breakdown }: RiskBreakdownChartProps) {
  const [view, setView] = useState<'bar' | 'pie'>('bar');

  const data = Object.entries(breakdown).map(([key, value], i) => ({
    name: LABELS[key] || key,
    value: Math.round(value),
    fill: COLORS[i % COLORS.length],
  }));

  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Risk Breakdown</h3>
        <div className="flex gap-1">
          <Button
            variant={view === 'bar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('bar')}
            className="h-8 w-8 p-0"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'pie' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('pie')}
            className="h-8 w-8 p-0"
          >
            <PieChartIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {view === 'bar' ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(210, 30%, 90%)', fontSize: 12 }} width={80} />
            <Tooltip
              contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: 8, color: 'hsl(210, 30%, 90%)' }}
              formatter={(value: number) => [`${value}%`, 'Risk']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(220, 22%, 10%)"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: 8, color: 'hsl(210, 30%, 90%)' }}
                formatter={(value: number) => [`${Math.round((value / total) * 100)}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 flex-1">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.fill }} />
                <span className="text-muted-foreground flex-1">{d.name}</span>
                <span className="font-mono font-semibold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

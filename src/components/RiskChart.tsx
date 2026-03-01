import { Card } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { RiskBreakdown } from '@/lib/types';

interface RiskChartProps {
  breakdown: RiskBreakdown;
}

export function RiskChart({ breakdown }: RiskChartProps) {
  const radarData = [
    { subject: 'Metadata', value: breakdown.metadata },
    { subject: 'Behavior', value: breakdown.behavior },
    { subject: 'URL Structure', value: breakdown.urlStructure },
    { subject: 'Pattern Match', value: breakdown.patternMatch },
  ];

  const barData = radarData.map(d => ({
    name: d.subject,
    risk: Math.round(d.value),
  }));

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-display font-semibold text-lg mb-4">Risk Breakdown</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(220, 18%, 18%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <Radar dataKey="value" stroke="hsl(185, 85%, 48%)" fill="hsl(185, 85%, 48%)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(220, 22%, 10%)', border: '1px solid hsl(220, 18%, 18%)', borderRadius: '8px', color: 'hsl(210, 30%, 90%)' }}
              />
              <Bar dataKey="risk" fill="hsl(185, 85%, 48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

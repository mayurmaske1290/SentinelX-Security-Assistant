import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Beaker } from 'lucide-react';
import { DEMO_MESSAGES, type DemoMessage } from '@/lib/demoData';

interface DemoModeProps {
  onSelect: (demo: DemoMessage) => void;
  filterType?: 'email' | 'sms' | 'upi';
}

export function DemoMode({ onSelect, filterType }: DemoModeProps) {
  const filtered = filterType
    ? DEMO_MESSAGES.filter(d => d.type === filterType)
    : DEMO_MESSAGES;

  return (
    <Card className="p-4 bg-card border-border border-dashed">
      <div className="flex items-center gap-2 mb-3">
        <Beaker className="w-4 h-4 text-primary" />
        <h4 className="font-display font-semibold text-sm">Demo Mode</h4>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary ml-auto">
          Preloaded Samples
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map((demo, i) => (
          <Button
            key={i}
            variant="ghost"
            onClick={() => onSelect(demo)}
            className="h-auto py-2 px-3 justify-start text-left hover:bg-secondary"
          >
            <span className="text-sm flex-1 truncate">{demo.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}

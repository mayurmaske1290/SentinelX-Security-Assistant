import { Shield } from 'lucide-react';

export function ScanLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 fade-in">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary scan-pulse" />
        </div>
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">Analyzing Target</h3>
      <p className="text-sm text-muted-foreground">Running threat intelligence checks...</p>
    </div>
  );
}

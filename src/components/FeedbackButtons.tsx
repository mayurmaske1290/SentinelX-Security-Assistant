import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { submitFeedback, hashContent } from '@/lib/feedback';
import { toast } from 'sonner';

interface FeedbackButtonsProps {
  scanId: string;
  scanType: string;
  content: string;
  originalScore: number;
}

export function FeedbackButtons({ scanId, scanType, content, originalScore }: FeedbackButtonsProps) {
  const [submitted, setSubmitted] = useState<'safe' | 'fraud' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (verdict: 'safe' | 'fraud') => {
    setLoading(true);
    const contentHash = hashContent(content);
    const success = await submitFeedback(scanId, scanType, contentHash, originalScore, verdict);
    setLoading(false);

    if (success) {
      setSubmitted(verdict);
      toast.success(`Marked as ${verdict}. This helps improve future detection!`);
    } else {
      toast.error('Failed to submit feedback');
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Check className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          Marked as <strong className="text-foreground">{submitted}</strong> — thank you for improving SentinelX!
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
      <span className="text-sm text-muted-foreground flex-1">Was this analysis accurate?</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFeedback('safe')}
        disabled={loading}
        className="gap-1.5 border-safe/30 text-safe hover:bg-safe/10"
      >
        <ThumbsUp className="w-3.5 h-3.5" /> Safe
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFeedback('fraud')}
        disabled={loading}
        className="gap-1.5 border-danger/30 text-danger hover:bg-danger/10"
      >
        <ThumbsDown className="w-3.5 h-3.5" /> Fraud
      </Button>
    </div>
  );
}

import { supabase } from '@/integrations/supabase/client';

export async function submitFeedback(
  scanId: string,
  scanType: string,
  contentHash: string,
  originalScore: number,
  verdict: 'safe' | 'fraud'
) {
  const { error } = await supabase.from('scan_feedback').insert({
    scan_id: scanId,
    scan_type: scanType,
    content_hash: contentHash,
    original_score: originalScore,
    user_verdict: verdict,
  });
  if (error) console.error('Feedback error:', error);
  return !error;
}

export async function getFeedbackAdjustment(contentHash: string): Promise<number> {
  const { data } = await supabase
    .from('scan_feedback')
    .select('user_verdict')
    .eq('content_hash', contentHash);

  if (!data || data.length === 0) return 0;

  const safeCount = data.filter(f => f.user_verdict === 'safe').length;
  const fraudCount = data.filter(f => f.user_verdict === 'fraud').length;

  // Positive = increase risk, negative = decrease risk
  return (fraudCount - safeCount) * 5;
}

export function hashContent(content: string): string {
  // Simple hash for content matching
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const chr = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}


-- Feedback table for learning mode
CREATE TABLE public.scan_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('email', 'sms', 'upi', 'file', 'url')),
  content_hash TEXT NOT NULL,
  original_score INTEGER NOT NULL,
  user_verdict TEXT NOT NULL CHECK (user_verdict IN ('safe', 'fraud')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scan_feedback ENABLE ROW LEVEL SECURITY;

-- Public insert/select (no auth required for hackathon demo)
CREATE POLICY "Anyone can insert feedback" ON public.scan_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read feedback" ON public.scan_feedback FOR SELECT USING (true);

-- Index for lookups
CREATE INDEX idx_scan_feedback_content_hash ON public.scan_feedback (content_hash);
CREATE INDEX idx_scan_feedback_scan_type ON public.scan_feedback (scan_type);

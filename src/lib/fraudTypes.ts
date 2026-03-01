import type { Explanation, Recommendation, RiskLevel, RiskBreakdown } from './types';

export type FraudScanType = 'file' | 'url' | 'email' | 'sms' | 'upi';

export interface FraudScanResult {
  id: string;
  timestamp: string;
  type: FraudScanType;
  target: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  riskBreakdown: RiskBreakdown;
  explanation: Explanation;
  recommendations: Recommendation[];
  // Type-specific raw data stored as JSON
  rawAnalysis?: unknown;
}

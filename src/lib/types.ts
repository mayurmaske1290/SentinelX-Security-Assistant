export type RiskLevel = 'low' | 'medium' | 'high';

export interface FileMetadata {
  name: string;
  size: number;
  extension: string;
  mimeType: string;
  hash: string;
  hasDoubleExtension: boolean;
  isSuspiciousExtension: boolean;
}

export interface UrlAnalysis {
  url: string;
  isHttps: boolean;
  isIpBased: boolean;
  hasSuspiciousKeywords: boolean;
  suspiciousKeywordsFound: string[];
}

export interface BehaviorIndicator {
  id: string;
  label: string;
  description: string;
  detected: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface RiskBreakdown {
  metadata: number;
  behavior: number;
  urlStructure: number;
  patternMatch: number;
}

export interface Explanation {
  summary: string;
  reasons: string[];
  malwareCategory: string | null;
  confidenceReasoning: string;
}

export interface Recommendation {
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  type: 'file' | 'url';
  target: string;
  fileMetadata?: FileMetadata;
  urlAnalysis?: UrlAnalysis;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  riskBreakdown: RiskBreakdown;
  behaviors: BehaviorIndicator[];
  explanation: Explanation;
  recommendations: Recommendation[];
}

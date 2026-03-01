import type { FileMetadata, UrlAnalysis, RiskBreakdown, RiskLevel } from './types';

const SUSPICIOUS_EXTENSIONS = ['exe', 'bat', 'cmd', 'scr', 'pif', 'js', 'vbs', 'wsf', 'ps1', 'msi', 'apk'];
const SUSPICIOUS_URL_KEYWORDS = ['login', 'verify', 'account', 'secure', 'update', 'confirm', 'banking', 'paypal', 'password', 'credential', 'suspend'];

export function analyzeFileMetadata(file: File): FileMetadata {
  const name = file.name;
  const parts = name.split('.');
  const extension = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  const hasDoubleExtension = parts.length > 2 && SUSPICIOUS_EXTENSIONS.includes(parts[parts.length - 1].toLowerCase());
  const isSuspiciousExtension = SUSPICIOUS_EXTENSIONS.includes(extension);

  return {
    name,
    size: file.size,
    extension,
    mimeType: file.type || 'application/octet-stream',
    hash: '', // filled async
    hasDoubleExtension,
    isSuspiciousExtension,
  };
}

export function analyzeUrl(url: string): UrlAnalysis {
  const isHttps = url.startsWith('https://');
  const isIpBased = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
  const lowerUrl = url.toLowerCase();
  const suspiciousKeywordsFound = SUSPICIOUS_URL_KEYWORDS.filter(kw => lowerUrl.includes(kw));

  return {
    url,
    isHttps,
    isIpBased,
    hasSuspiciousKeywords: suspiciousKeywordsFound.length > 0,
    suspiciousKeywordsFound,
  };
}

export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function calculateRiskScore(
  fileMetadata?: FileMetadata,
  urlAnalysis?: UrlAnalysis,
  behaviorScore: number = 0
): { score: number; breakdown: RiskBreakdown; confidence: number } {
  let metadataScore = 0;
  let urlScore = 0;
  let patternScore = 0;

  if (fileMetadata) {
    if (fileMetadata.isSuspiciousExtension) metadataScore += 30;
    if (fileMetadata.hasDoubleExtension) metadataScore += 25;
    if (fileMetadata.size < 1024 || fileMetadata.size > 50 * 1024 * 1024) metadataScore += 10;
  }

  if (urlAnalysis) {
    if (!urlAnalysis.isHttps) urlScore += 20;
    if (urlAnalysis.isIpBased) urlScore += 25;
    if (urlAnalysis.hasSuspiciousKeywords) urlScore += 15;
  }

  // Pattern matching simulation
  if (fileMetadata?.isSuspiciousExtension && fileMetadata?.hasDoubleExtension) patternScore += 20;
  if (urlAnalysis?.isIpBased && !urlAnalysis?.isHttps) patternScore += 15;

  const rawScore = metadataScore + behaviorScore + urlScore + patternScore;
  const score = Math.min(100, rawScore);

  const breakdown: RiskBreakdown = {
    metadata: Math.min(100, metadataScore * 2.5),
    behavior: Math.min(100, behaviorScore * 2.5),
    urlStructure: Math.min(100, urlScore * 2.5),
    patternMatch: Math.min(100, patternScore * 2.5),
  };

  // Confidence based on how many signals we have
  const signalCount = [
    fileMetadata?.isSuspiciousExtension,
    fileMetadata?.hasDoubleExtension,
    urlAnalysis && !urlAnalysis.isHttps,
    urlAnalysis?.isIpBased,
    urlAnalysis?.hasSuspiciousKeywords,
    behaviorScore > 0,
  ].filter(Boolean).length;

  const confidence = Math.min(95, 50 + signalCount * 8);

  return { score, breakdown, confidence };
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'low';
  if (score <= 60) return 'medium';
  return 'high';
}

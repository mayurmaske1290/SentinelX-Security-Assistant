import type { RiskLevel } from './types';

export interface EmailInput {
  senderEmail: string;
  subject: string;
  body: string;
}

export interface EmailAnalysis {
  senderEmail: string;
  subject: string;
  suspiciousDomain: boolean;
  urgencyKeywords: string[];
  requestsPersonalData: boolean;
  suspiciousLinks: string[];
  genericGreeting: boolean;
}

const BRAND_MISSPELLINGS = [
  'paypa1', 'paypall', 'g00gle', 'amaz0n', 'micros0ft', 'faceb00k',
  'app1e', 'netfl1x', 'instagramm', 'linkedinn', 'tw1tter',
  'support-amazon', 'account-google', 'secure-paypal', 'verify-apple',
];

const URGENCY_KEYWORDS = [
  'urgent', 'immediate action', 'account suspended', 'verify now',
  'act now', 'expire', 'within 24 hours', 'immediately', 'suspended',
  'unauthorized', 'confirm your identity', 'limited time', 'action required',
];

const PERSONAL_DATA_PHRASES = [
  'social security', 'ssn', 'credit card', 'bank account', 'password',
  'pin number', 'date of birth', 'mother\'s maiden', 'routing number',
  'account number', 'verify your identity', 'confirm your details',
];

const LINK_PATTERNS = /https?:\/\/(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|rb\.gy|shorturl|tiny\.cc)/gi;

const GENERIC_GREETINGS = ['dear user', 'dear customer', 'dear member', 'dear account holder', 'dear valued'];

export function analyzeEmail(input: EmailInput): EmailAnalysis {
  const lowerEmail = input.senderEmail.toLowerCase();
  const lowerSubject = input.subject.toLowerCase();
  const lowerBody = input.body.toLowerCase();
  const fullText = `${lowerSubject} ${lowerBody}`;

  const suspiciousDomain = BRAND_MISSPELLINGS.some(m => lowerEmail.includes(m));
  const urgencyKeywords = URGENCY_KEYWORDS.filter(kw => fullText.includes(kw));
  const requestsPersonalData = PERSONAL_DATA_PHRASES.some(p => fullText.includes(p));
  const linkMatches = fullText.match(LINK_PATTERNS) || [];
  const genericGreeting = GENERIC_GREETINGS.some(g => fullText.includes(g));

  return {
    senderEmail: input.senderEmail,
    subject: input.subject,
    suspiciousDomain,
    urgencyKeywords,
    requestsPersonalData,
    suspiciousLinks: linkMatches,
    genericGreeting,
  };
}

export function calculateEmailRiskScore(analysis: EmailAnalysis): { score: number; confidence: number; breakdown: Record<string, number> } {
  let score = 0;
  const reasons: boolean[] = [];

  if (analysis.suspiciousDomain) { score += 25; reasons.push(true); }
  if (analysis.urgencyKeywords.length > 0) { score += 20; reasons.push(true); }
  if (analysis.requestsPersonalData) { score += 25; reasons.push(true); }
  if (analysis.suspiciousLinks.length > 0) { score += 20; reasons.push(true); }
  if (analysis.genericGreeting) { score += 10; reasons.push(true); }

  score = Math.min(100, score);
  const confidence = Math.min(95, 50 + reasons.length * 9);

  return {
    score,
    confidence,
    breakdown: {
      domain: analysis.suspiciousDomain ? 62.5 : 0,
      urgency: analysis.urgencyKeywords.length > 0 ? 50 : 0,
      personalData: analysis.requestsPersonalData ? 62.5 : 0,
      links: analysis.suspiciousLinks.length > 0 ? 50 : 0,
      greeting: analysis.genericGreeting ? 25 : 0,
    },
  };
}

export function generateEmailExplanation(analysis: EmailAnalysis, score: number, confidence: number) {
  const reasons: string[] = [];

  if (analysis.suspiciousDomain)
    reasons.push(`The sender's email domain appears to mimic a well-known brand, a common phishing technique to trick recipients.`);
  if (analysis.urgencyKeywords.length > 0)
    reasons.push(`The email uses urgency language ("${analysis.urgencyKeywords.slice(0, 3).join('", "')}") to pressure you into acting quickly without thinking.`);
  if (analysis.requestsPersonalData)
    reasons.push(`The email requests sensitive personal information. Legitimate organizations rarely ask for such data via email.`);
  if (analysis.suspiciousLinks.length > 0)
    reasons.push(`The email contains ${analysis.suspiciousLinks.length} suspicious link(s) using IP addresses or URL shorteners, which can hide malicious destinations.`);
  if (analysis.genericGreeting)
    reasons.push(`The email uses a generic greeting instead of your name, suggesting it was sent as part of a mass phishing campaign.`);

  const level = score > 60 ? 'high' : score > 30 ? 'moderate' : 'low';
  const summary = `This email shows ${level} risk indicators with a phishing score of ${score}/100. ${reasons.length} suspicious pattern${reasons.length !== 1 ? 's were' : ' was'} detected.`;
  const confidenceReasoning = `Confidence is at ${confidence}% based on ${reasons.length} corroborating signals. ${confidence >= 80 ? 'Multiple phishing indicators align.' : confidence >= 60 ? 'Several indicators detected.' : 'Limited signals; verify with caution.'}`;

  return {
    summary,
    reasons,
    malwareCategory: score > 40 ? 'Email Phishing' : null,
    confidenceReasoning,
  };
}

export function generateEmailRecommendations(score: number, riskLevel: RiskLevel) {
  const recs: { action: string; priority: 'critical' | 'high' | 'medium' | 'low'; icon: string }[] = [];

  if (riskLevel === 'high') {
    recs.push({ action: 'Do not click any links or download attachments', priority: 'critical', icon: '🚫' });
    recs.push({ action: 'Mark as spam and delete immediately', priority: 'critical', icon: '🗑️' });
    recs.push({ action: 'Report to your IT security team', priority: 'high', icon: '📞' });
  } else if (riskLevel === 'medium') {
    recs.push({ action: 'Verify the sender through official channels', priority: 'high', icon: '🔍' });
    recs.push({ action: 'Do not provide personal information', priority: 'high', icon: '🛡️' });
  } else {
    recs.push({ action: 'Email appears relatively safe, but stay cautious', priority: 'low', icon: '✅' });
  }

  recs.push({ action: 'Never share passwords or financial details via email', priority: 'medium', icon: '🔒' });
  recs.push({ action: 'Hover over links to verify destinations before clicking', priority: 'medium', icon: '🌐' });

  return recs;
}

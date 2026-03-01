import type { RiskLevel } from './types';

export interface SmsInput {
  message: string;
}

export interface SmsAnalysis {
  message: string;
  urgencyPhrases: string[];
  threatMessages: string[];
  shortenedLinks: string[];
  paymentRequest: boolean;
  rewardScam: boolean;
  scamCategory: string | null;
}

const URGENCY_PHRASES = [
  'act now', 'hurry', 'limited time', 'expire', 'immediately',
  'within 24 hours', 'urgent', 'last chance', 'don\'t delay',
];

const THREAT_PHRASES = [
  'account blocked', 'kyc expired', 'account suspended', 'unauthorized transaction',
  'account will be closed', 'verify immediately', 'security alert', 'unusual activity',
  'account deactivated', 'legal action',
];

const SHORT_LINK_PATTERNS = /(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|rb\.gy|shorturl\.at|tiny\.cc|cutt\.ly|ow\.ly)\/\S+/gi;

const PAYMENT_PHRASES = [
  'send money', 'transfer amount', 'pay now', 'payment of rs',
  'upi', 'bank transfer', 'gpay', 'phonepe', 'paytm',
];

const REWARD_PHRASES = [
  'you won', 'lottery', 'congratulations', 'prize', 'winner',
  'claim your reward', 'free gift', 'you have been selected', 'lucky draw',
];

export function analyzeSms(input: SmsInput): SmsAnalysis {
  const lower = input.message.toLowerCase();

  const urgencyPhrases = URGENCY_PHRASES.filter(p => lower.includes(p));
  const threatMessages = THREAT_PHRASES.filter(p => lower.includes(p));
  const linkMatches = lower.match(SHORT_LINK_PATTERNS) || [];
  const paymentRequest = PAYMENT_PHRASES.some(p => lower.includes(p));
  const rewardScam = REWARD_PHRASES.some(p => lower.includes(p));

  let scamCategory: string | null = null;
  if (rewardScam) scamCategory = 'Reward Scam';
  else if (threatMessages.length > 0) scamCategory = 'Account Threat';
  else if (paymentRequest || linkMatches.length > 0) scamCategory = 'Phishing';

  return {
    message: input.message,
    urgencyPhrases,
    threatMessages,
    shortenedLinks: linkMatches,
    paymentRequest,
    rewardScam,
    scamCategory,
  };
}

export function calculateSmsRiskScore(analysis: SmsAnalysis): { score: number; confidence: number; breakdown: Record<string, number> } {
  let score = 0;
  const signals: boolean[] = [];

  if (analysis.urgencyPhrases.length > 0) { score += 20; signals.push(true); }
  if (analysis.threatMessages.length > 0) { score += 20; signals.push(true); }
  if (analysis.shortenedLinks.length > 0) { score += 25; signals.push(true); }
  if (analysis.paymentRequest) { score += 20; signals.push(true); }
  if (analysis.rewardScam) { score += 20; signals.push(true); }

  score = Math.min(100, score);
  const confidence = Math.min(95, 50 + signals.length * 9);

  return {
    score,
    confidence,
    breakdown: {
      urgency: analysis.urgencyPhrases.length > 0 ? 50 : 0,
      threats: analysis.threatMessages.length > 0 ? 50 : 0,
      links: analysis.shortenedLinks.length > 0 ? 62.5 : 0,
      payment: analysis.paymentRequest ? 50 : 0,
      reward: analysis.rewardScam ? 50 : 0,
    },
  };
}

export function generateSmsExplanation(analysis: SmsAnalysis, score: number, confidence: number) {
  const reasons: string[] = [];

  if (analysis.urgencyPhrases.length > 0)
    reasons.push(`The message creates artificial urgency ("${analysis.urgencyPhrases.slice(0, 2).join('", "')}") to pressure you into acting without thinking.`);
  if (analysis.threatMessages.length > 0)
    reasons.push(`The message contains threatening language ("${analysis.threatMessages.slice(0, 2).join('", "')}") designed to scare you into complying.`);
  if (analysis.shortenedLinks.length > 0)
    reasons.push(`The message contains ${analysis.shortenedLinks.length} shortened URL(s) that hide the actual destination, a common fraud technique.`);
  if (analysis.paymentRequest)
    reasons.push(`The message requests a payment or money transfer, a hallmark of SMS fraud schemes.`);
  if (analysis.rewardScam)
    reasons.push(`The message claims you've won a prize or reward — a classic scam tactic to lure victims.`);

  const level = score > 60 ? 'high' : score > 30 ? 'moderate' : 'low';
  const summary = `This SMS shows ${level} fraud indicators with a score of ${score}/100.${analysis.scamCategory ? ` Classified as: ${analysis.scamCategory}.` : ''} ${reasons.length} suspicious pattern${reasons.length !== 1 ? 's were' : ' was'} detected.`;
  const confidenceReasoning = `Confidence is at ${confidence}% based on ${reasons.length} signals. ${confidence >= 80 ? 'Multiple fraud indicators align.' : confidence >= 60 ? 'Several indicators detected.' : 'Limited signals available.'}`;

  return { summary, reasons, malwareCategory: analysis.scamCategory, confidenceReasoning };
}

export function generateSmsRecommendations(score: number, riskLevel: RiskLevel) {
  const recs: { action: string; priority: 'critical' | 'high' | 'medium' | 'low'; icon: string }[] = [];

  if (riskLevel === 'high') {
    recs.push({ action: 'Do not click any links in the message', priority: 'critical', icon: '🚫' });
    recs.push({ action: 'Block the sender immediately', priority: 'critical', icon: '🛑' });
    recs.push({ action: 'Report to your telecom provider as spam', priority: 'high', icon: '📞' });
  } else if (riskLevel === 'medium') {
    recs.push({ action: 'Verify the claim through official app or website', priority: 'high', icon: '🔍' });
    recs.push({ action: 'Do not share any personal or financial information', priority: 'high', icon: '🛡️' });
  } else {
    recs.push({ action: 'Message appears relatively safe, but stay alert', priority: 'low', icon: '✅' });
  }

  recs.push({ action: 'Never click shortened links from unknown numbers', priority: 'medium', icon: '🔗' });
  recs.push({ action: 'Enable spam filters on your phone', priority: 'medium', icon: '📱' });

  return recs;
}

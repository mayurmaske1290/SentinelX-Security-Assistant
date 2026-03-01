import type { RiskLevel } from './types';

export interface UpiInput {
  message: string;
}

export interface UpiAnalysis {
  message: string;
  collectRequestFraud: boolean;
  fakeBankVerification: boolean;
  qrCodeTrick: boolean;
  immediatePaymentPressure: boolean;
  unknownMerchantLink: boolean;
  fraudType: string | null;
}

const COLLECT_PHRASES = [
  'collect request', 'accept payment', 'receive money by paying',
  'send to receive', 'pay to receive', 'collect money',
];

const FAKE_BANK_PHRASES = [
  'bank verification', 'kyc update', 'account verification',
  'rbi mandate', 'verify bank', 'bank alert', 'update kyc',
  'link aadhaar', 'pan verification',
];

const QR_PHRASES = [
  'scan qr', 'qr code', 'scan to receive', 'scan and pay',
  'scan this code', 'qr payment',
];

const PRESSURE_PHRASES = [
  'pay now', 'immediately', 'within minutes', 'urgent payment',
  'instant transfer', 'right now', 'don\'t delay payment',
  'pay before', 'last chance to pay',
];

const MERCHANT_LINK_PATTERN = /https?:\/\/(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|rb\.gy|shorturl)/gi;

export function analyzeUpi(input: UpiInput): UpiAnalysis {
  const lower = input.message.toLowerCase();

  const collectRequestFraud = COLLECT_PHRASES.some(p => lower.includes(p));
  const fakeBankVerification = FAKE_BANK_PHRASES.some(p => lower.includes(p));
  const qrCodeTrick = QR_PHRASES.some(p => lower.includes(p));
  const immediatePaymentPressure = PRESSURE_PHRASES.some(p => lower.includes(p));
  const linkMatches = lower.match(MERCHANT_LINK_PATTERN) || [];
  const unknownMerchantLink = linkMatches.length > 0;

  let fraudType: string | null = null;
  if (collectRequestFraud) fraudType = 'Collect Request Fraud';
  else if (fakeBankVerification) fraudType = 'Fake Bank Verification';
  else if (qrCodeTrick) fraudType = 'QR Code Payment Scam';
  else if (immediatePaymentPressure) fraudType = 'Payment Pressure Scam';
  else if (unknownMerchantLink) fraudType = 'Suspicious Merchant Link';

  return {
    message: input.message,
    collectRequestFraud,
    fakeBankVerification,
    qrCodeTrick,
    immediatePaymentPressure,
    unknownMerchantLink,
    fraudType,
  };
}

export function calculateUpiRiskScore(analysis: UpiAnalysis): { score: number; confidence: number; breakdown: Record<string, number> } {
  let score = 0;
  const signals: boolean[] = [];

  if (analysis.collectRequestFraud) { score += 30; signals.push(true); }
  if (analysis.fakeBankVerification) { score += 25; signals.push(true); }
  if (analysis.qrCodeTrick) { score += 25; signals.push(true); }
  if (analysis.immediatePaymentPressure) { score += 20; signals.push(true); }
  if (analysis.unknownMerchantLink) { score += 20; signals.push(true); }

  score = Math.min(100, score);
  const confidence = Math.min(95, 50 + signals.length * 9);

  return {
    score,
    confidence,
    breakdown: {
      collectRequest: analysis.collectRequestFraud ? 75 : 0,
      bankVerification: analysis.fakeBankVerification ? 62.5 : 0,
      qrCode: analysis.qrCodeTrick ? 62.5 : 0,
      paymentPressure: analysis.immediatePaymentPressure ? 50 : 0,
      merchantLink: analysis.unknownMerchantLink ? 50 : 0,
    },
  };
}

export function generateUpiExplanation(analysis: UpiAnalysis, score: number, confidence: number) {
  const reasons: string[] = [];

  if (analysis.collectRequestFraud)
    reasons.push(`The message describes a "collect request" scam — you never need to pay money to receive money via UPI.`);
  if (analysis.fakeBankVerification)
    reasons.push(`The message impersonates a bank verification request. Banks never ask for UPI PIN or sensitive details via SMS.`);
  if (analysis.qrCodeTrick)
    reasons.push(`The message involves a QR code payment trick — scanning a QR code is for sending money, not receiving it.`);
  if (analysis.immediatePaymentPressure)
    reasons.push(`The message creates pressure to pay immediately, a common tactic to prevent you from verifying the request.`);
  if (analysis.unknownMerchantLink)
    reasons.push(`The message contains a suspicious link that may lead to a fake payment page designed to steal your credentials.`);

  const level = score > 60 ? 'high' : score > 30 ? 'moderate' : 'low';
  const summary = `This message shows ${level} UPI fraud indicators with a score of ${score}/100.${analysis.fraudType ? ` Classified as: ${analysis.fraudType}.` : ''} ${reasons.length} suspicious pattern${reasons.length !== 1 ? 's were' : ' was'} detected.`;
  const confidenceReasoning = `Confidence is at ${confidence}% based on ${reasons.length} signals. ${confidence >= 80 ? 'Multiple fraud indicators align.' : confidence >= 60 ? 'Several indicators detected.' : 'Limited signals available.'}`;

  return { summary, reasons, malwareCategory: analysis.fraudType, confidenceReasoning };
}

export function generateUpiRecommendations(score: number, riskLevel: RiskLevel) {
  const recs: { action: string; priority: 'critical' | 'high' | 'medium' | 'low'; icon: string }[] = [];

  if (riskLevel === 'high') {
    recs.push({ action: 'Do NOT click any links in the message', priority: 'critical', icon: '🚫' });
    recs.push({ action: 'Do NOT approve any collect request', priority: 'critical', icon: '🛑' });
    recs.push({ action: 'Report to your bank and local cyber cell', priority: 'high', icon: '📞' });
  } else if (riskLevel === 'medium') {
    recs.push({ action: 'Verify the sender through your official banking app', priority: 'high', icon: '🔍' });
    recs.push({ action: 'Do not share UPI PIN with anyone', priority: 'high', icon: '🛡️' });
  } else {
    recs.push({ action: 'Message appears relatively safe, but stay cautious', priority: 'low', icon: '✅' });
  }

  recs.push({ action: 'Never enter UPI PIN to receive money', priority: 'medium', icon: '🔒' });
  recs.push({ action: 'Use only official UPI apps from app stores', priority: 'medium', icon: '📱' });
  recs.push({ action: 'Verify merchant identity before any payment', priority: 'medium', icon: '🏪' });

  return recs;
}

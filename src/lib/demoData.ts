export interface DemoMessage {
  label: string;
  type: 'email' | 'sms' | 'upi';
  senderEmail?: string;
  subject?: string;
  body: string;
  expectedRisk: 'low' | 'medium' | 'high' | 'critical';
}

export const DEMO_MESSAGES: DemoMessage[] = [
  {
    label: '🎣 PayPal Phishing Email',
    type: 'email',
    senderEmail: 'security@paypa1-verify.com',
    subject: 'Urgent: Your account has been suspended',
    body: `Dear Customer,

We have detected unauthorized activity on your PayPal account. Your account has been temporarily suspended.

To restore access, please verify your identity immediately by clicking the link below:

http://192.168.1.100/paypal-verify/login.php

You must complete this verification within 24 hours or your account will be permanently closed.

Regards,
PayPal Security Team`,
    expectedRisk: 'critical',
  },
  {
    label: '📱 KYC SMS Scam',
    type: 'sms',
    body: `URGENT: Your bank KYC has expired. Your account will be blocked within 24 hours. Update KYC now: bit.ly/update-kyc-now. Call 9876543210 for help. Do not ignore this message.`,
    expectedRisk: 'high',
  },
  {
    label: '💰 UPI Collect Request Fraud',
    type: 'upi',
    body: `Hi, I accidentally sent you ₹5000. Please accept this collect request to return the money. You will receive the refund once you enter your UPI PIN. This is urgent, please do it now.`,
    expectedRisk: 'critical',
  },
  {
    label: '🎁 Lottery Reward Scam SMS',
    type: 'sms',
    body: `Congratulations! You won ₹50,00,000 in the Google Lucky Draw 2024! Claim your prize now at tinyurl.com/google-prize. Send ₹500 processing fee to receive your reward. Last chance!`,
    expectedRisk: 'critical',
  },
  {
    label: '🏦 Fake Bank Verification UPI',
    type: 'upi',
    body: `RBI Mandate: Your bank account will be frozen due to incomplete PAN verification. Scan this QR code immediately to verify your identity: bit.ly/rbi-verify. Enter UPI PIN to complete verification.`,
    expectedRisk: 'critical',
  },
  {
    label: '✅ Legitimate Bank Alert',
    type: 'sms',
    body: `Your SBI account XX1234 has been debited with INR 2,500.00 on 28-Feb-2026. Available balance: INR 45,230.50. If not done by you, call 1800-111-111.`,
    expectedRisk: 'low',
  },
  {
    label: '💳 Refund Scam UPI',
    type: 'upi',
    body: `Dear customer, your refund of ₹2,999 from Flipkart is pending. To receive your refund, please accept the collect request and enter your UPI PIN. Refund will be credited instantly.`,
    expectedRisk: 'high',
  },
  {
    label: '📧 Loan Scam Email',
    type: 'email',
    senderEmail: 'loans@instant-approve.in',
    subject: 'Pre-approved loan of ₹10,00,000 - No documents needed!',
    body: `Dear valued customer,

You have been pre-approved for a personal loan of ₹10,00,000 at 0% interest for the first 6 months!

No documents required. No credit check. Instant approval.

Just pay a small processing fee of ₹2,999 and your loan will be disbursed within 1 hour.

Click here to apply: http://instant-loan-apply.com/apply

This offer expires today! Don't miss out.

Best regards,
Quick Loans Team`,
    expectedRisk: 'critical',
  },
];

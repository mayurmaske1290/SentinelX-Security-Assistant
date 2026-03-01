import type { ScanResult, Explanation, Recommendation } from './types';

const MALWARE_CATEGORIES: Record<string, { pattern: (r: ScanResult) => boolean; label: string }> = {
  trojan: {
    pattern: (r) => r.behaviors.some(b => b.id === 'registry' && b.detected) && r.behaviors.some(b => b.id === 'background' && b.detected),
    label: 'Trojan-like behavior',
  },
  ransomware: {
    pattern: (r) => r.behaviors.some(b => b.id === 'encryption' && b.detected),
    label: 'Ransomware-like behavior',
  },
  spyware: {
    pattern: (r) => r.behaviors.some(b => b.id === 'data_exfil' && b.detected) && r.behaviors.some(b => b.id === 'background' && b.detected),
    label: 'Spyware-like behavior',
  },
  phishing: {
    pattern: (r) => r.type === 'url' && (r.urlAnalysis?.hasSuspiciousKeywords || false),
    label: 'Phishing attempt',
  },
  worm: {
    pattern: (r) => r.behaviors.some(b => b.id === 'network' && b.detected) && r.behaviors.some(b => b.id === 'autostart' && b.detected),
    label: 'Worm-like behavior',
  },
};

export function generateExplanation(result: ScanResult): Explanation {
  const reasons: string[] = [];

  if (result.fileMetadata?.isSuspiciousExtension) {
    reasons.push(`The file uses a "${result.fileMetadata.extension}" extension, which is commonly associated with executable or potentially harmful files.`);
  }
  if (result.fileMetadata?.hasDoubleExtension) {
    reasons.push(`The file uses a double extension (e.g., ".pdf.exe"), a common technique to disguise malicious files as safe documents.`);
  }
  if (result.urlAnalysis && !result.urlAnalysis.isHttps) {
    reasons.push(`The URL does not use HTTPS encryption, making data transmission vulnerable to interception.`);
  }
  if (result.urlAnalysis?.isIpBased) {
    reasons.push(`The URL uses a raw IP address instead of a domain name, which is frequently used by malicious actors to evade domain-based blocking.`);
  }
  if (result.urlAnalysis?.hasSuspiciousKeywords) {
    reasons.push(`The URL contains suspicious keywords (${result.urlAnalysis.suspiciousKeywordsFound.join(', ')}) commonly found in phishing attempts.`);
  }

  const detectedBehaviors = result.behaviors.filter(b => b.detected);
  if (detectedBehaviors.length > 0) {
    reasons.push(`Behavior analysis detected ${detectedBehaviors.length} suspicious activities: ${detectedBehaviors.map(b => b.label.toLowerCase()).join(', ')}.`);
  }

  // Determine malware category
  let malwareCategory: string | null = null;
  for (const [, cat] of Object.entries(MALWARE_CATEGORIES)) {
    if (cat.pattern(result)) {
      malwareCategory = cat.label;
      break;
    }
  }

  const levelText = result.riskLevel === 'high' ? 'significant threat indicators' : result.riskLevel === 'medium' ? 'moderate risk indicators' : 'minimal risk indicators';
  const summary = `This ${result.type === 'file' ? 'file' : 'URL'} shows ${levelText} with a risk score of ${result.riskScore}/100.${malwareCategory ? ` The detected patterns are consistent with ${malwareCategory}.` : ''} Our analysis identified ${reasons.length} distinct risk factor${reasons.length !== 1 ? 's' : ''}.`;

  const confidenceReasoning = `Confidence is at ${result.confidence}% based on ${reasons.length} corroborating signals. ${result.confidence >= 80 ? 'Multiple independent indicators align, providing high confidence.' : result.confidence >= 60 ? 'Several indicators were detected, providing moderate confidence.' : 'Limited signals available; results should be verified with additional scanning.'}`;

  return { summary, reasons, malwareCategory, confidenceReasoning };
}

export function generateRecommendations(result: ScanResult): Recommendation[] {
  const recs: Recommendation[] = [];

  if (result.riskLevel === 'high') {
    recs.push({ action: 'Delete this file/avoid this URL immediately', priority: 'critical', icon: '🚫' });
    recs.push({ action: 'Run a full system antivirus scan', priority: 'critical', icon: '🛡️' });
    recs.push({ action: 'Contact your IT administrator', priority: 'high', icon: '📞' });
  }
  if (result.riskLevel === 'medium') {
    recs.push({ action: 'Run in an isolated sandbox environment', priority: 'high', icon: '📦' });
    recs.push({ action: 'Verify the source authenticity before proceeding', priority: 'high', icon: '🔍' });
  }
  if (result.riskLevel === 'low') {
    recs.push({ action: 'File appears relatively safe, but remain cautious', priority: 'low', icon: '✅' });
  }

  recs.push({ action: 'Always verify file sources before downloading', priority: 'medium', icon: '🌐' });
  recs.push({ action: 'Keep your antivirus software up to date', priority: 'medium', icon: '🔄' });

  if (result.urlAnalysis && !result.urlAnalysis.isHttps) {
    recs.push({ action: 'Use HTTPS-only browsing mode', priority: 'high', icon: '🔒' });
  }

  return recs;
}

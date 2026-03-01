import type { BehaviorIndicator, FileMetadata, UrlAnalysis } from './types';

const BEHAVIOR_TEMPLATES: Omit<BehaviorIndicator, 'detected'>[] = [
  { id: 'registry', label: 'Registry Modification', description: 'Attempts to modify Windows registry keys', severity: 'high' },
  { id: 'network', label: 'Network Connection', description: 'Attempts outbound network connections to unknown hosts', severity: 'medium' },
  { id: 'privilege', label: 'Privilege Escalation', description: 'Attempts to gain elevated system privileges', severity: 'high' },
  { id: 'encryption', label: 'File Encryption', description: 'Attempts to encrypt files on the system', severity: 'high' },
  { id: 'background', label: 'Background Process', description: 'Launches hidden background processes', severity: 'medium' },
  { id: 'autostart', label: 'Persistence Mechanism', description: 'Installs autostart entries for persistence', severity: 'high' },
  { id: 'data_exfil', label: 'Data Exfiltration', description: 'Attempts to send data to external servers', severity: 'high' },
  { id: 'obfuscation', label: 'Code Obfuscation', description: 'Contains obfuscated or packed code segments', severity: 'medium' },
];

export function simulateBehaviorAnalysis(
  fileMetadata?: FileMetadata,
  urlAnalysis?: UrlAnalysis
): BehaviorIndicator[] {
  return BEHAVIOR_TEMPLATES.map(template => {
    let detected = false;

    // Deterministic detection based on inputs
    if (fileMetadata) {
      const ext = fileMetadata.extension;
      switch (template.id) {
        case 'registry':
          detected = ['exe', 'bat', 'msi'].includes(ext);
          break;
        case 'network':
          detected = ['exe', 'js', 'ps1'].includes(ext) || !!urlAnalysis?.isIpBased;
          break;
        case 'privilege':
          detected = ['exe', 'bat', 'ps1'].includes(ext) && fileMetadata.hasDoubleExtension;
          break;
        case 'encryption':
          detected = ext === 'exe' && fileMetadata.size > 100000;
          break;
        case 'background':
          detected = ['exe', 'bat', 'vbs', 'ps1'].includes(ext);
          break;
        case 'autostart':
          detected = fileMetadata.hasDoubleExtension;
          break;
        case 'data_exfil':
          detected = !!urlAnalysis?.isIpBased && !urlAnalysis?.isHttps;
          break;
        case 'obfuscation':
          detected = ['js', 'vbs', 'ps1'].includes(ext);
          break;
      }
    }

    if (!fileMetadata && urlAnalysis) {
      switch (template.id) {
        case 'network':
          detected = true;
          break;
        case 'data_exfil':
          detected = !urlAnalysis.isHttps || urlAnalysis.isIpBased;
          break;
        case 'obfuscation':
          detected = urlAnalysis.hasSuspiciousKeywords;
          break;
      }
    }

    return { ...template, detected };
  });
}

export function getBehaviorScore(behaviors: BehaviorIndicator[]): number {
  return behaviors.reduce((score, b) => {
    if (!b.detected) return score;
    switch (b.severity) {
      case 'high': return score + 12;
      case 'medium': return score + 6;
      case 'low': return score + 3;
    }
  }, 0);
}

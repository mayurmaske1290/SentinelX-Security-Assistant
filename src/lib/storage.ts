import type { ScanResult } from './types';

const STORAGE_KEY = 'sentinelx_scan_history';

export function getScanHistory(): ScanResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveScanResult(result: ScanResult): void {
  const history = getScanHistory();
  history.unshift(result);
  // Keep last 50 scans
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function clearScanHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getScanById(id: string): ScanResult | undefined {
  return getScanHistory().find(s => s.id === id);
}

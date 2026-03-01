import type { FraudScanResult } from './fraudTypes';

const FRAUD_STORAGE_KEY = 'sentinelx_fraud_history';

export function getFraudHistory(): FraudScanResult[] {
  try {
    const data = localStorage.getItem(FRAUD_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getFraudHistoryByType(type: string): FraudScanResult[] {
  return getFraudHistory().filter(s => s.type === type);
}

export function saveFraudScan(result: FraudScanResult): void {
  const history = getFraudHistory();
  history.unshift(result);
  localStorage.setItem(FRAUD_STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
}

export function clearFraudHistory(): void {
  localStorage.removeItem(FRAUD_STORAGE_KEY);
}

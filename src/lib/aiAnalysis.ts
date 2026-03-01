import { supabase } from '@/integrations/supabase/client';

export interface AIAnalysisResult {
  classification: 'safe' | 'suspicious' | 'fraud';
  confidence: number;
  fraudType: string | null;
  aiRiskScore: number;
  explanation: string;
  urlAnalysis: {
    hasHomoglyphAttack: boolean;
    homoglyphDetails: string | null;
    isShortenedUrl: boolean;
    suspiciousDomainPattern: boolean;
    domainRiskReason: string | null;
  };
  detectedPatterns: string[];
  psychologicalTactics: string[];
}

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatResult {
  reply: string;
}

export async function runAIAnalysis(
  scanType: string,
  content: string,
  senderEmail?: string,
  subject?: string
): Promise<AIAnalysisResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('fraud-analyze', {
      body: { scanType, content, senderEmail, subject },
    });

    if (error) {
      console.error('AI analysis error:', error);
      return null;
    }

    if (data?.error) {
      console.error('AI analysis returned error:', data.error);
      return null;
    }

    return data as AIAnalysisResult;
  } catch (e) {
    console.error('AI analysis failed:', e);
    return null;
  }
}

export async function runAssistantChat(
  content: string,
  chatHistory: AssistantChatMessage[],
  scanContext?: unknown
): Promise<AssistantChatResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('fraud-analyze', {
      body: { scanType: 'assistant', content, chatHistory, scanContext },
    });

    if (error) {
      console.error('Assistant chat error:', error);
      return null;
    }

    if (data?.error) {
      console.error('Assistant chat returned error:', data.error);
      return null;
    }

    if (!data?.reply || typeof data.reply !== 'string') {
      return null;
    }

    return data as AssistantChatResult;
  } catch (e) {
    console.error('Assistant chat failed:', e);
    return null;
  }
}

export type RiskLevelExtended = 'low' | 'medium' | 'high' | 'critical';

export function computeHybridScore(
  ruleScore: number,
  ruleConfidence: number,
  aiResult: AIAnalysisResult | null
): {
  finalScore: number;
  finalConfidence: number;
  riskLevel: RiskLevelExtended;
  breakdown: {
    keyword: number;
    url: number;
    behavioral: number;
    aiModel: number;
    sender: number;
  };
} {
  if (!aiResult) {
    // Fallback to rule-based only
    return {
      finalScore: ruleScore,
      finalConfidence: ruleConfidence,
      riskLevel: getExtendedRiskLevel(ruleScore),
      breakdown: {
        keyword: ruleScore * 0.4,
        url: ruleScore * 0.2,
        behavioral: ruleScore * 0.15,
        aiModel: 0,
        sender: ruleScore * 0.25,
      },
    };
  }

  // Weighted hybrid scoring
  const weights = {
    rules: 0.3,
    ai: 0.45,
    url: 0.15,
    psychological: 0.10,
  };

  const psychScore = aiResult.psychologicalTactics.length * 15;
  const urlBonus = (aiResult.urlAnalysis.hasHomoglyphAttack ? 30 : 0) +
    (aiResult.urlAnalysis.isShortenedUrl ? 15 : 0) +
    (aiResult.urlAnalysis.suspiciousDomainPattern ? 20 : 0);

  const rawScore =
    ruleScore * weights.rules +
    aiResult.aiRiskScore * weights.ai +
    Math.min(100, urlBonus) * weights.url +
    Math.min(100, psychScore) * weights.psychological;

  const finalScore = Math.min(100, Math.round(rawScore));

  // Weighted confidence
  const finalConfidence = Math.min(
    98,
    Math.round(ruleConfidence * 0.35 + aiResult.confidence * 0.65)
  );

  return {
    finalScore,
    finalConfidence,
    riskLevel: getExtendedRiskLevel(finalScore),
    breakdown: {
      keyword: Math.round(ruleScore * 0.4),
      url: Math.min(100, urlBonus),
      behavioral: Math.round(ruleScore * 0.2),
      aiModel: aiResult.aiRiskScore,
      sender: Math.round(ruleScore * 0.15),
    },
  };
}

function getExtendedRiskLevel(score: number): RiskLevelExtended {
  if (score <= 20) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

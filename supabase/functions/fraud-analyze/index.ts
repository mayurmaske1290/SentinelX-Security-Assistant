import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FRAUD_SYSTEM_PROMPT = `You are SentinelX Fraud Analyzer - an expert AI fraud detection engine. You analyze messages, emails, URLs, and payment requests to detect fraud.

You MUST respond with ONLY a valid JSON object (no markdown, no code fences). The JSON must have this exact structure:
{
  "classification": "safe" | "suspicious" | "fraud",
  "confidence": <number 0-100>,
  "fraudType": <string or null>,
  "aiRiskScore": <number 0-100>,
  "explanation": "<detailed 2-3 sentence explanation of why this is/isn't fraud, mentioning specific psychological manipulation tactics, urgency patterns, authority impersonation, or social engineering techniques detected>",
  "urlAnalysis": {
    "hasHomoglyphAttack": <boolean>,
    "homoglyphDetails": <string or null>,
    "isShortenedUrl": <boolean>,
    "suspiciousDomainPattern": <boolean>,
    "domainRiskReason": <string or null>
  },
  "detectedPatterns": [<array of specific pattern strings detected>],
  "psychologicalTactics": [<array of manipulation tactics like "urgency", "authority", "fear", "greed", "social_proof", "scarcity">]
}

Fraud types to classify: "Phishing", "UPI Scam", "OTP Scam", "Refund Scam", "QR Code Scam", "Loan Scam", "Reward Scam", "Account Threat", "KYC Scam", "Payment Pressure", "Identity Theft", null (if safe)

Analyze for:
- Semantic meaning and context (not just keywords)
- Psychological manipulation patterns (urgency, fear, authority impersonation, greed)
- Social engineering techniques
- URL homoglyph attacks (paypaI vs paypal, g00gle vs google)
- Shortened URL risks
- Domain pattern analysis
- Payment fraud patterns specific to UPI/India
- Vector similarity to known fraud patterns

Be thorough and precise. A low-risk legitimate message should get aiRiskScore < 20.`;

const ASSISTANT_SYSTEM_PROMPT = `You are SentinelX Security Assistant, an advanced cybersecurity and digital safety expert.

You can answer broad user questions, including:
- Cybersecurity best practices
- Phishing, SMS, UPI/payment fraud, malware, unsafe links
- Explaining scan results in simple language
- Step-by-step actions after suspected fraud incidents

Rules:
1. Give practical, accurate, actionable answers.
2. Keep responses concise but complete.
3. If scan context is provided, use it.
4. If uncertain, say what is uncertain and provide the safest next step.
5. Never ask users to share OTP, PIN, passwords, or sensitive banking credentials.
6. Use plain language unless the user asks for technical depth.`;

function buildFraudPrompt(scanType: string, content: string, senderEmail?: string, subject?: string) {
  switch (scanType) {
    case "email":
      return `Analyze this email for phishing/fraud:\nSender: ${senderEmail}\nSubject: ${subject}\nBody: ${content}`;
    case "sms":
      return `Analyze this SMS message for fraud:\n${content}`;
    case "upi":
      return `Analyze this UPI/payment related message for fraud:\n${content}`;
    case "url":
      return `Analyze this URL for phishing/malicious intent:\n${content}`;
    default:
      return `Analyze this content for fraud/threats:\n${content}`;
  }
}

async function callGateway(LOVABLE_API_KEY: string, messages: Array<{ role: string; content: string }>) {
  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
    }),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanType, content, senderEmail, subject, chatHistory, scanContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (scanType === "assistant") {
      const history = Array.isArray(chatHistory)
        ? chatHistory
            .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
            .slice(-12)
        : [];

      const systemContent = scanContext
        ? `${ASSISTANT_SYSTEM_PROMPT}\n\nLatest scan context:\n${JSON.stringify(scanContext, null, 2)}`
        : ASSISTANT_SYSTEM_PROMPT;

      const response = await callGateway(LOVABLE_API_KEY, [
        { role: "system", content: systemContent },
        ...history,
        { role: "user", content: String(content ?? "") },
      ]);

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const t = await response.text();
        console.error("AI gateway assistant error:", response.status, t);
        return new Response(
          JSON.stringify({ error: "AI service error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content?.trim() || "";
      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = buildFraudPrompt(String(scanType || ""), String(content || ""), senderEmail, subject);

    const response = await callGateway(LOVABLE_API_KEY, [
      { role: "system", content: FRAUD_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ]);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway fraud error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    let aiResult;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      aiResult = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      aiResult = {
        classification: "suspicious",
        confidence: 50,
        fraudType: null,
        aiRiskScore: 50,
        explanation: "AI analysis could not be fully parsed. Rule-based analysis will be used as primary.",
        urlAnalysis: {
          hasHomoglyphAttack: false,
          homoglyphDetails: null,
          isShortenedUrl: false,
          suspiciousDomainPattern: false,
          domainRiskReason: null,
        },
        detectedPatterns: [],
        psychologicalTactics: [],
      };
    }

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fraud-analyze error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
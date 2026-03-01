import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are SentinelX Security Assistant — an expert AI cybersecurity advisor built into the SentinelX Digital Threat & Fraud Detection platform.

Your expertise covers:
- **Malware Analysis**: File types (.exe, .apk, .pdf, .js, etc.), threat indicators, behavioral analysis, ransomware, trojans, worms, spyware
- **Phishing & Email Security**: Suspicious domains, urgency tactics, social engineering, spoofing, email header analysis
- **SMS Fraud**: Fake urgency, reward scams, shortened links, account threats, KYC scams
- **UPI/Payment Fraud**: Collect request fraud, fake bank verification, QR code scams, payment pressure tactics
- **Web Security**: URL analysis, HTTPS, domain squatting, IP-based URLs, cross-site scripting, SQL injection
- **General Cybersecurity**: Password hygiene, 2FA, VPNs, data privacy, network security, incident response

Guidelines:
1. Always provide clear, actionable advice
2. Explain threats in simple, non-technical language when possible
3. If the user shares scan context, reference it in your answer
4. Provide specific safety steps and recommendations
5. Be thorough but concise
6. When unsure, say so honestly and suggest where to find authoritative info
7. Cover both technical details and practical safety tips
8. Always warn users to never share OTPs, PINs, or passwords with anyone`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, scanContext, stream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system message with optional scan context
    let systemContent = SYSTEM_PROMPT;
    if (scanContext) {
      systemContent += `\n\nThe user's most recent scan context:\n${JSON.stringify(scanContext, null, 2)}\nReference this scan data when relevant to the user's question.`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          stream: !!stream,
        }),
      }
    );

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
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("security-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { getScanHistory } from '@/lib/storage';
import { getFraudHistory } from '@/lib/fraudStorage';
import { useToast } from '@/hooks/use-toast';
import { runAssistantChat } from '@/lib/aiAnalysis';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function buildLocalSafetyResponse(input: string) {
  const text = input.toLowerCase();
  if (text.includes('upi')) {
    return `For UPI safety:
- Never approve "collect requests" unless you initiated the payment.
- Never share OTP, UPI PIN, or card CVV.
- Do not scan unknown QR codes.
- Verify payee name before every transfer.
- If scammed, call your bank and report on cybercrime.gov.in immediately.`;
  }
  if (text.includes('sms') || text.includes('otp')) {
    return `For SMS/OTP scam safety:
- Never share OTP with anyone.
- Ignore urgency messages asking for immediate action.
- Do not click shortened or unknown links.
- Contact the company using official website/app only.`;
  }
  return `I couldn't reach the advanced assistant service, but here are core safety rules:
- Never share OTP, PIN, or passwords.
- Verify links, sender identity, and payment requests.
- Avoid urgent-pressure actions.
- Report suspicious activity immediately to your bank and cybercrime.gov.in.`;
}

function getLatestScanContext() {
  const history = getScanHistory();
  const fraudHistory = getFraudHistory();
  const all = [...history, ...fraudHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  if (all.length === 0) return null;
  const latest = all[0];
  return {
    type: latest.type,
    target: latest.target,
    riskScore: latest.riskScore,
    riskLevel: latest.riskLevel,
    summary: latest.explanation?.summary,
    reasons: latest.explanation?.reasons,
    recommendations: latest.recommendations,
  };
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Welcome to **SentinelX Security Assistant** 🛡️\n\nI'm your AI-powered cybersecurity expert. I can help with:\n- 🔍 Explaining scan results\n- 🛑 Malware, phishing & fraud analysis\n- 📱 UPI / SMS scam detection advice\n- 🔐 General cybersecurity questions\n\nAsk me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const latest = getLatestScanContext();
      const chatHistory = messages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const ai = await runAssistantChat(trimmed, chatHistory, latest);

      if (ai?.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: ai.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: buildLocalSafetyResponse(trimmed) }]);
        toast({
          title: 'Assistant Limited Mode',
          description: 'AI service unavailable. Showing local safety guidance.',
        });
      }
    } catch (e: any) {
      console.error('Chat error:', e);
      setMessages((prev) => [...prev, { role: 'assistant', content: buildLocalSafetyResponse(trimmed) }]);
      toast({
        title: 'Assistant Limited Mode',
        description: 'Could not reach AI service. Showing local safety guidance.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 fade-in h-[calc(100vh-8rem)] flex flex-col">
        <div>
          <h1 className="text-3xl font-display font-bold">Security Assistant</h1>
          <p className="text-muted-foreground mt-1">AI-powered cybersecurity expert — ask anything</p>
        </div>

        <Card className="flex-1 bg-card border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary text-secondary-foreground p-3 rounded-lg text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about threats, safety tips, or your scan results..."
                className="bg-secondary border-border"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ScanSearch, Brain, Zap, Mail, MessageSquareWarning, IndianRupee, ArrowRight, Lock, Eye, BarChart3, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  { icon: Mail, title: 'Email Scan', desc: 'Detect phishing, spoofing & malicious attachments with hybrid AI.', link: '/email-scan' },
  { icon: MessageSquareWarning, title: 'SMS Scan', desc: 'Identify OTP scams, fake alerts & social engineering in texts.', link: '/sms-scan' },
  { icon: IndianRupee, title: 'UPI Scan', desc: 'Spot fake collect requests, QR scams & refund fraud instantly.', link: '/upi-scan' },
  { icon: ScanSearch, title: 'File & URL Scan', desc: 'Analyze suspicious files and URLs for malware & threats.', link: '/scan' },
  { icon: Brain, title: 'AI Assistant', desc: 'Chat with our cybersecurity AI for expert threat guidance.', link: '/assistant' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Track scan history, trends & risk patterns over time.', link: '/reports' },
];

const stats = [
  { value: '99.2%', label: 'Detection Rate' },
  { value: '<2s', label: 'Avg Scan Time' },
  { value: '6+', label: 'Fraud Types' },
  { value: 'AI', label: 'Powered Engine' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center cyber-glow-sm">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Sentinel<span className="text-primary">X</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Button>
            <Button size="sm" onClick={() => navigate('/scan')} className="gap-1.5">
              Start Scanning <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Animated background grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08)_0%,transparent_60%)]" />
          <motion.div
            animate={{ opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)/0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.05) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5" /> AI-Powered Fraud Intelligence
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
              Detect Fraud Before
              <br />
              <span className="text-primary">It Strikes</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              SentinelX combines hybrid AI models with real-time threat intelligence to detect phishing, UPI scams, and digital fraud — instantly and explainably.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button size="lg" onClick={() => navigate('/scan')} className="gap-2 text-base px-8 cyber-glow">
                <ScanSearch className="w-5 h-5" /> Launch Scanner
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')} className="gap-2 text-base px-8">
                View Dashboard <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i + 4}
                className="p-5 rounded-xl border border-border bg-card/50 backdrop-blur-sm"
              >
                <p className="text-3xl font-display font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Complete Threat <span className="text-primary">Arsenal</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Six specialized scanning engines, one unified platform.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => navigate(f.link)}
                className="group p-6 rounded-xl border border-border bg-card/60 hover:border-primary/30 hover:bg-card cursor-pointer transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5.5 h-5.5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              How <span className="text-primary">It Works</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: ScanSearch, title: 'Submit Content', desc: 'Paste an email, SMS, UPI ID, or upload a file for analysis.' },
              { step: '02', icon: Brain, title: 'AI Analyzes', desc: 'Hybrid engine combines rule-based heuristics with NLP AI models.' },
              { step: '03', icon: Eye, title: 'Get Insights', desc: 'Receive risk scores, fraud classification & human-readable explanations.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="relative mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <s.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center font-mono">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-primary/20 bg-primary/5 cyber-glow"
        >
          <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-3">Ready to Secure Your Digital World?</h2>
          <p className="text-muted-foreground mb-6">Start scanning for threats in under 2 seconds. No signup required.</p>
          <Button size="lg" onClick={() => navigate('/scan')} className="gap-2 text-base px-8">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold">SentinelX</span>
          </div>
          <p>AI-Powered Fraud Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}

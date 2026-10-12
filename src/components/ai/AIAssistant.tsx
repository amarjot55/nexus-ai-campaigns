import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import {
  Sparkles,
  Send,
  Mic,
  X,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CampaignPreview } from "@/components/campaign/CampaignPreview";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  LineChart,
  CartesianGrid,
} from "recharts";
import { createTtsEngine, getTtsEngine, VoiceGender } from "@/lib/tts";
import { createSttEngine, isSttSupported, type SttEngine } from "@/lib/stt";
import { parseIntent, planCampaign, isCampaignBrief, COST } from "@/lib/intent";

type Bubble =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; text?: string; card?: React.ReactNode };

type AIController = {
  open: boolean;
  setOpen: (v: boolean) => void;
  prefill: string;
  setPrefill: (s: string) => void;
  submit: (text: string) => void;
  ttsSpeaking: boolean;
  setTtsSpeaking: (v: boolean) => void;
  ttsEnabled: boolean;
  toggleTts: () => void;
  ttsVoice: string;
  setTtsVoice: (v: string) => void;
  ttsRate: number;
  setTtsRate: (r: number) => void;
};

const Ctx = createContext<AIController | null>(null);

export function useAI(): AIController {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState("");
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsVoice, _setTtsVoice] = useState("");
  const [ttsRate, _setTtsRate] = useState(0.9);
  const submitRef = useRef<(t: string) => void>(() => {});

  // Use ref for stable controller pattern to avoid SSR useMemo
  const controllerRef = useRef({
    open,
    setOpen,
    prefill,
    setPrefill,
    submit: (t: string) => submitRef.current(t),
    ttsSpeaking,
    setTtsSpeaking,
    ttsEnabled,
    toggleTts: () => {
      setTtsEnabled((p) => !p);
      if (ttsEnabled) {
        getTtsEngine()?.stop();
        setTtsSpeaking(false);
      }
    },
    ttsVoice,
    setTtsVoice: _setTtsVoice,
    ttsRate,
    setTtsRate: _setTtsRate,
  });

  const controller = controllerRef.current;
  controller.open = open;
  controller.prefill = prefill;
  controller.ttsSpeaking = ttsSpeaking;
  controller.ttsEnabled = ttsEnabled;
  controller.ttsVoice = ttsVoice;
  controller.ttsRate = ttsRate;

  (controller as any).__submitRef = submitRef;
  return controller;
}

export const AIContext = Ctx;

export function AIProvider({
  controller,
  children,
}: {
  controller: AIController;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={controller}>{children}</Ctx.Provider>;
}

export function useAIPanel() {
  return useContext(Ctx);
}

const SUGGESTIONS = [
  "Send WhatsApp and SMS campaign to users from Delhi who purchased in the last 30 days",
  "Launch an RCS + SMS win-back for Tier 2 users inactive for 60 days with 20% off at 10 PM",
  "Optimize my last campaign for better CTR",
  "Show highest ROI segment this week",
  "Create a segment of users who abandoned cart",
  "Which channel performs best for Tier 2 cities?",
];

let _idCounter = Math.floor(Math.random() * 10000);
const newId = () => `n-${++_idCounter}`;

export function AIAssistant({ controller }: { controller: AIController }) {
  const [messages, setMessages] = useState<Bubble[]>([
    {
      id: newId(),
      role: "ai",
      text: "Hi, I'm Nexus AI. Tell me what campaign you want to run — in plain English or voice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [ttsPopoverOpen, setTtsPopoverOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef("");
  const sttRef = useRef<SttEngine | null>(null);

  // Init TTS + STT
  useEffect(() => {
    const synth = window.speechSynthesis;
    const tts = createTtsEngine();
    (controller as any).__ttsEngine = tts;

    if (synth.getVoices().length === 0) {
      const handler = () => synth.getVoices();
      synth.onvoiceschanged = handler;
    }

    if (isSttSupported()) {
      const stt = createSttEngine((transcript: string) => {
        setInput(transcript);
        setListening(false);
      });
      sttRef.current = stt;
      (controller as any).__sttEngine = stt;
    }

    return () => {
      synth.cancel();
      sttRef.current?.stop();
    };
  }, [controller]);

  // TTS: auto-speak new AI bubbles
  useEffect(() => {
    const last = messages.at(-1);
    if (last?.role !== "ai" || !controller.ttsEnabled) return;
    const text = last.text?.trim();
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    const timer = setTimeout(() => {
      const tts = getTtsEngine();
      if (tts && controller.ttsEnabled) tts.speak(text);
    }, 600);
    return () => clearTimeout(timer);
  }, [messages, controller.ttsEnabled]);

  // Sync TTS speaking state
  useEffect(() => {
    const eng = getTtsEngine();
    if (!eng) return;
    const iv = setInterval(() => controller.setTtsSpeaking(eng.speaking), 250);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (controller.prefill) {
      setInput(controller.prefill);
      controller.setPrefill("");
    }
  }, [controller.prefill]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const addAI = useCallback(
    (b: Omit<Bubble & { role: "ai" }, "id" | "role">, delay = 900) =>
      new Promise<void>((r) =>
        setTimeout(() => {
          setMessages((m) => [...m, { id: newId(), role: "ai", ...b }]);
          r();
        }, delay),
      ),
    [],
  );

  const speakCurrentAI = useCallback(() => {
    const last = messages.at(-1);
    if (last?.role === "ai" && last.text) getTtsEngine()?.speak(last.text);
  }, [messages]);

  const speakAllAI = useCallback(() => {
    const aiMsgs = messages.filter((m) => m.role === "ai" && m.text);
    if (!aiMsgs.length) return;
    getTtsEngine()?.speak(aiMsgs.map((m) => m.text!).join(". "));
  }, [messages]);

  const startListening = useCallback(() => {
    const eng = sttRef.current;
    if (!eng) {
      toast.error("Voice input not supported. Try Chrome or Edge.");
      return;
    }
    if (eng.isListening) {
      eng.stop();
      setListening(false);
      return;
    }
    setListening(true);
    eng.start();
  }, []);

  // --- Scenarios ---

  const runScenarioA = useCallback(async () => {
    setThinking(true);
    await addAI({
      card: (
        <StepCard icon={<Zap className="h-4 w-4" />} title="Intent parsed">
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="secondary">Channels: WhatsApp + SMS</Badge>
            <Badge variant="secondary">City = Delhi</Badge>
            <Badge variant="secondary">Last purchase ≤ 30 days</Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Detected multi-channel campaign targeting Delhi users with recent purchases.
          </div>
        </StepCard>
      ),
    });
    await addAI({
      card: (
        <StepCard icon={<Users className="h-4 w-4" />} title="Audience selected">
          <div className="mt-1 text-sm">
            Found <span className="font-semibold text-foreground">8,420</span> matching users
          </div>
          <div className="mt-2 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { n: "Delhi", v: 4200 },
                  { n: "Gurgaon", v: 2100 },
                  { n: "Noida", v: 1420 },
                  { n: "Faridabad", v: 700 },
                ]}
              >
                <XAxis dataKey="n" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Bar dataKey="v" fill="var(--ai)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Delhi 4200 · Gurgaon 2100 · Noida 1420 · Faridabad 700
          </div>
        </StepCard>
      ),
    });
    await addAI({
      card: (
        <StepCard icon={<MessageSquare className="h-4 w-4" />} title="Template recommendation">
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-muted/40 p-2 text-xs">
              <div className="font-semibold">Diwali — Bold</div>
              <div className="mt-1 text-muted-foreground">"Hi {"{name}"}, flat 40% off…"</div>
              <Badge className="mt-2 bg-success/20 text-success">Best · 22% CTR</Badge>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2 text-xs">
              <div className="font-semibold">Diwali — Warm</div>
              <div className="mt-1 text-muted-foreground">"Namaste {"{name}"}, festive picks…"</div>
              <div className="mt-2 text-muted-foreground">18.4% CTR</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Selected Diwali Bold — highest CTR on Delhi repeat-buyers.
          </div>
        </StepCard>
      ),
    });
    await addAI({
      card: (
        <StepCard icon={<TrendingUp className="h-4 w-4" />} title="Channel recommendation">
          <div className="mt-1 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-success font-semibold">WhatsApp</span> — Primary · 14.1% CTR
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              SMS — Fallback for non-WhatsApp users
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            WhatsApp gives 2.4× higher engagement vs SMS for this segment.
          </div>
        </StepCard>
      ),
    });
    await addAI({
      card: (
        <StepCard icon={<Clock className="h-4 w-4" />} title="Optimal send time">
          <div className="mt-1 text-sm">
            Today, <span className="font-semibold text-foreground">6:30 PM IST</span> — based on
            past open-rate patterns.
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            6–8 PM IST has 23% higher open rate for Delhi repeat buyers.
          </div>
        </StepCard>
      ),
    });
    await addAI({
      card: (
        <StepCard icon={<CheckCircle2 className="h-4 w-4" />} title="Ready to preview">
          <div className="mt-2 space-y-2">
            <div className="rounded-lg border border-primary/20 bg-accent/30 p-2 text-xs">
              <div className="font-semibold text-primary">Campaign summary</div>
              <div className="mt-1 text-muted-foreground">
                8,420 users · WhatsApp + SMS · 6:30 PM · ₹3,420 cost
              </div>
            </div>
            <Button
              size="sm"
              className="ai-gradient text-white w-full mt-2"
              onClick={() => setPreviewOpen(true)}
            >
              Open preview & confirm
            </Button>
          </div>
        </StepCard>
      ),
    });
    setThinking(false);
  }, [addAI]);

  const runScenarioB = useCallback(async () => {
    setThinking(true);
    await addAI({
      text: "Sure — let me analyze your last campaign for optimization opportunities.",
    });
    await addAI({
      card: (
        <StepCard icon={<TrendingUp className="h-4 w-4" />} title="Campaign analysis">
          <div className="mt-1 text-sm">
            <span className="font-semibold">Diwali Sale</span> · 14,200 sent · 9.2% CTR · ₹1.2L
            spend
          </div>
        </StepCard>
      ),
    });
    await addAI({
      card: (
        <StepCard icon={<Zap className="h-4 w-4" />} title="Issues detected">
          <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
            <li>• Send time outside peak window (11 AM vs optimal 6:30 PM)</li>
            <li>• Template B underperformed vs A by 11% (7.4% vs 18.6% CTR)</li>
            <li>• SMS fallback only 4% (recommended: 12%)</li>
            <li>• 3.1% had stale consent records</li>
          </ul>
        </StepCard>
      ),
    });
    await addAI({
      card: (
        <StepCard icon={<CheckCircle2 className="h-4 w-4" />} title="Optimization recommendations">
          <ul className="mt-1 space-y-1 text-sm">
            <li>✓ Shift send time to 6:30 PM IST — expected +8% open rate</li>
            <li>✓ Retire Template B, use Template A — expected +11% CTR</li>
            <li>✓ Increase SMS fallback to 12% — +1,420 more users reached</li>
            <li>✓ Refresh 438 stale consent records</li>
          </ul>
          <div className="mt-2 rounded-lg border border-success/30 bg-success/10 p-2 text-xs">
            <span className="font-semibold text-success">
              Expected combined lift: +2.4% CTR · +₹14,000 additional revenue
            </span>
          </div>
          <Button
            size="sm"
            className="ai-gradient text-white mt-3 w-full"
            onClick={() => {
              toast.loading("Applying…", { id: "apply" });
              setTimeout(
                () => toast.success("Applied. Expected CTR lift: +2.4%", { id: "apply" }),
                1400,
              );
            }}
          >
            Apply recommendations
          </Button>
        </StepCard>
      ),
    });
    setThinking(false);
  }, [addAI]);

  const runScenarioC = useCallback(async () => {
    setThinking(true);
    await addAI({ text: "Here's your highest-performing segment rankings this week:" });
    await addAI({
      card: (
        <StepCard icon={<TrendingUp className="h-4 w-4" />} title="ROI leaderboard">
          <div className="mt-2 space-y-1.5 text-sm">
            {[
              "Delhi NCR — repeat buyers",
              "Bengaluru — high AOV",
              "Mumbai — cart recoveries",
              "Tier 2 — reactivated",
            ].map((r, i) => (
              <div
                key={r}
                className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1.5"
              >
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">#{i + 1}</span> {r}
                </span>
                <Badge className="bg-success/20 text-success">
                  {["4.2x", "3.6x", "3.1x", "2.4x"][i]}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Delhi NCR leads with 4.2x ROI · ₹2.4L revenue
          </div>
        </StepCard>
      ),
    });
    await addAI({
      text: "Delhi NCR repeat buyers are your crown jewel. Want me to create a campaign targeting them?",
    });
    setThinking(false);
  }, [addAI]);

  const runScenarioD = useCallback(async () => {
    setThinking(true);
    await addAI({
      text: "I've identified 1,840 users who abandoned their carts in the last 24 hours — high-intent customers!",
    });
    await addAI({
      card: (
        <StepCard icon={<Users className="h-4 w-4" />} title="Cart abandoners — 24h window">
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-semibold text-foreground">1,840 users</span>
            <Badge className="bg-warning/20 text-warning text-[10px]">High value</Badge>
          </div>
          <div className="mt-2 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { n: "Fashion", v: 820 },
                  { n: "Electronics", v: 540 },
                  { n: "Home", v: 320 },
                  { n: "Beauty", v: 160 },
                ]}
              >
                <XAxis dataKey="n" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Bar dataKey="v" fill="var(--warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Avg cart value ₹2,140 · WhatsApp recovery converts at 14.9%
          </div>
          <Button
            size="sm"
            className="ai-gradient text-white mt-2 w-full"
            onClick={() => setPreviewOpen(true)}
          >
            Create recovery campaign
          </Button>
        </StepCard>
      ),
    });
    setThinking(false);
  }, [addAI]);

  const runScenarioE = useCallback(async () => {
    setThinking(true);
    await addAI({ text: "Channel performance breakdown for Tier 2 cities over the last 30 days:" });
    await addAI({
      card: (
        <StepCard icon={<TrendingUp className="h-4 w-4" />} title="Tier 2 city performance">
          <div className="mt-2 space-y-1.5 text-sm">
            {[
              ["WhatsApp", "12.4%", "Best engagement"],
              ["RCS", "9.8%", "Best on Android"],
              ["SMS", "5.1%", "Reliable fallback"],
              ["Google Ads", "3.8%", "Broad reach"],
              ["Meta Ads", "3.2%", "Awareness drive"],
            ].map(([ch, rate, note]) => (
              <div
                key={ch}
                className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1.5"
              >
                <span className="flex items-center gap-2">
                  <span className={cn("font-medium", note.includes("Best") && "text-success")}>
                    {ch}
                  </span>
                  <span className="text-xs text-muted-foreground">{note}</span>
                </span>
                <Badge
                  className={
                    ch === "WhatsApp"
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {rate}
                </Badge>
              </div>
            ))}
          </div>
        </StepCard>
      ),
    });
    setThinking(false);
  }, [addAI]);


  const runPlanner = useCallback(
    async (text: string) => {
      setThinking(true);
      const intent = parseIntent(text);
      const plan = planCampaign(intent);
      const fmt = (n: number) => n.toLocaleString("en-IN");
      const filters = [
        `Channels: ${intent.channels.join(" → ")}`,
        intent.cities.length ? `Cities: ${intent.cities.slice(0, 5).join(", ")}${intent.cities.length > 5 ? ` +${intent.cities.length - 5}` : ""}` : "All India",
        intent.boughtWithinDays !== undefined && `Bought ≤ ${intent.boughtWithinDays}d`,
        intent.inactiveForDays !== undefined && `Inactive ≥ ${intent.inactiveForDays}d`,
        intent.cartAbandoners && "Cart abandoners",
        intent.minAov !== undefined && `AOV ≥ ₹${fmt(intent.minAov)}`,
        intent.discountPct !== undefined && `Offer: ${intent.discountPct}% off`,
        intent.occasion && `Occasion: ${intent.occasion}`,
      ].filter(Boolean) as string[];
      await addAI({
        card: (
          <StepCard icon={<Zap className="h-4 w-4" />} title="Intent parsed">
            <div className="mt-1 flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <Badge key={f} variant="secondary">{f}</Badge>
              ))}
            </div>
            {intent.missing.length > 0 && (
              <div className="mt-2 text-xs text-warning">
                No {intent.missing.join(" or ")} given — using defaults. Add it to your prompt to narrow the plan.
              </div>
            )}
          </StepCard>
        ),
      });
      if (plan.matched === 0) {
        await addAI({ text: "No users match all of those filters. Try widening the time window or adding cities." });
        setThinking(false);
        return;
      }
      await addAI({
        card: (
          <StepCard icon={<Users className="h-4 w-4" />} title="Audience built">
            <div className="mt-1 text-sm">
              <span className="font-semibold text-foreground">{fmt(plan.matched)}</span> users match ·{" "}
              <span className="text-muted-foreground">
                {fmt(plan.excludedConsent)} removed (no consent) · {fmt(plan.excludedDnd)} removed (DND)
              </span>
            </div>
            <div className="mt-2 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plan.byCity}>
                  <XAxis dataKey="n" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="v" fill="var(--ai)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StepCard>
        ),
      });
      await addAI({
        card: (
          <StepCard icon={<TrendingUp className="h-4 w-4" />} title="Channel routing (waterfall)">
            <div className="mt-1 space-y-1 text-sm">
              {intent.channels.map((c) => (
                <div key={c} className="flex items-center justify-between">
                  <span>{c}</span>
                  <span className="text-muted-foreground">
                    {fmt(plan.routed[c])} users · ₹{COST[c].toFixed(2)}/msg
                  </span>
                </div>
              ))}
              {plan.unreachable > 0 && (
                <div className="text-xs text-warning">
                  {fmt(plan.unreachable)} users unreachable on these channels — add SMS as a fallback to reach them.
                </div>
              )}
            </div>
          </StepCard>
        ),
      });
      await addAI({
        card: (
          <StepCard icon={<MessageSquare className="h-4 w-4" />} title="Drafts + compliance checks">
            <div className="mt-2 space-y-2">
              {plan.messages.map((m) => (
                <div key={m.channel} className="rounded-lg border border-border bg-muted/40 p-2 text-xs">
                  <div className="font-semibold">{m.channel}</div>
                  <div className="mt-1 text-muted-foreground">{m.text}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {m.checks.map((c) => (
                      <Badge key={c.label} className={c.ok ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}>
                        {c.ok ? "✓" : "✕"} {c.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </StepCard>
        ),
      });
      await addAI({
        card: (
          <StepCard icon={<Clock className="h-4 w-4" />} title="Send time">
            <div className="mt-1 text-sm">
              Today, <span className="font-semibold text-foreground">{plan.sendTime} IST</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {plan.quietHoursAdjusted
                ? "Requested time falls outside the TRAI promotional window (10 AM–9 PM), so it was moved."
                : "Inside the TRAI promotional window (10 AM–9 PM)."}
            </div>
          </StepCard>
        ),
      });
      await addAI({
        card: (
          <StepCard icon={<CheckCircle2 className="h-4 w-4" />} title="Ready for your approval">
            <div className="mt-2 rounded-lg border border-primary/20 bg-accent/30 p-2 text-xs">
              <div className="font-semibold text-primary">Campaign summary</div>
              <div className="mt-1 text-muted-foreground">
                {fmt(plan.matched - plan.excludedConsent - plan.excludedDnd - plan.unreachable)} users ·{" "}
                {intent.channels.join(" + ")} · {plan.sendTime} · est. ₹{fmt(plan.cost)}
              </div>
            </div>
            <Button size="sm" className="ai-gradient mt-2 w-full text-white" onClick={() => setPreviewOpen(true)}>
              Open preview & confirm
            </Button>
          </StepCard>
        ),
      });
      setThinking(false);
    },
    [addAI],
  );

  const runGeneric = useCallback(
    async (text: string) => {
      setThinking(true);
      await addAI({
        card: (
          <Card className="p-4 border-primary/20 bg-card/60">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary mb-2">
              <Sparkles className="h-4 w-4" />
              Nexus AI Assistant
            </div>
            <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <p>
                • <b className="text-foreground">Campaign creation:</b> Natural language to
                multi-channel campaigns
              </p>
              <p>
                • <b className="text-foreground">Performance optimization:</b> AI-driven CTR and
                delivery improvements
              </p>
              <p>
                • <b className="text-foreground">Analytics:</b> Real-time ROI and segment insights
              </p>
              <p>
                • <b className="text-foreground">Discovery:</b> AI-suggested high-value segments
              </p>
              <p>
                • <b className="text-foreground">Channel intelligence:</b> Cross-channel performance
                benchmarks
              </p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Try the prompt chips below to explore these features!
            </p>
          </Card>
        ),
      });
      setThinking(false);
    },
    [addAI],
  );

  const submit = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      lastSpokenRef.current = "";
      setMessages((m) => [...m, { id: newId(), role: "user", text: t }]);
      setInput("");
      const low = t.toLowerCase();
      setTimeout(() => {
        if (low.includes("optimiz") || low.includes("optimis")) runScenarioB();
        else if (isCampaignBrief(t)) runPlanner(t);
        else if (low.includes("roi") || low.includes("highest") || low.includes("segment"))
          runScenarioC();
        else if (low.includes("abandon") || low.includes("cart")) runScenarioD();
        else if (
          low.includes("tier 2") ||
          low.includes("tier-2") ||
          low.includes("channel") ||
          low.includes("perform")
        )
          runScenarioE();
        else runGeneric(t);
      }, 400);
    },
    [runPlanner, runScenarioB, runScenarioC, runScenarioD, runScenarioE, runGeneric],
  );

  useEffect(() => {
    (controller as any).__submitRef.current = (t: string) => {
      controller.setOpen(true);
      setTimeout(() => submit(t), 250);
    };
  }, [controller, submit]);

  return (
    <>
      {!controller.open && (
        <button
          type="button"
          onClick={() => controller.setOpen(true)}
          className="ai-gradient ai-glow-shadow fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full text-white transition-transform hover:scale-105"
          aria-label="Open Nexus AI"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      <Sheet open={controller.open} onOpenChange={controller.setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          {/* Header */}
          <div className="ai-gradient flex items-center gap-3 px-4 py-3 text-white">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Nexus AI</div>
              <div className="text-xs text-white/80">Your agentic campaign co-pilot</div>
            </div>
            <Popover open={ttsPopoverOpen} onOpenChange={setTtsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "text-white hover:bg-white/15 hover:text-white",
                    controller.ttsSpeaking && "animate-live",
                  )}
                  aria-label="TTS settings"
                >
                  {controller.ttsSpeaking ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-60">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Read aloud</span>
                    <Button
                      type="button"
                      size="sm"
                      variant={controller.ttsEnabled ? "default" : "outline"}
                      className="h-7 text-[11px]"
                      onClick={() => {
                        controller.toggleTts();
                        setTtsPopoverOpen(false);
                      }}
                    >
                      {controller.ttsEnabled ? "On" : "Off"}
                    </Button>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">Voice</div>
                    <Select
                      value={controller.ttsVoice}
                      onValueChange={(v) => {
                        controller.setTtsVoice(v);
                        const eng = getTtsEngine();
                        const voice = (eng?.voices || []).find((vo) => vo.name === v);
                        if (voice) eng?.setVoice(voice);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const eng = getTtsEngine();
                          const voices = eng?.voices || [];
                          if (!voices.length)
                            return <SelectItem value="default">Default</SelectItem>;
                          return voices.slice(0, 14).map((v) => (
                            <SelectItem key={v.name} value={v.name}>
                              {v.name} <span className="text-muted-foreground">({v.lang})</span>
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Speed</span>
                      <span className="text-foreground">
                        {Math.round(controller.ttsRate * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[controller.ttsRate]}
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      onValueChange={([v]) => {
                        controller.setTtsRate(v);
                        getTtsEngine()?.setRate(v);
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-[11px]"
                      onClick={speakCurrentAI}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Replay
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-[11px]"
                      onClick={() => {
                        getTtsEngine()?.stop();
                        setTtsPopoverOpen(false);
                      }}
                    >
                      Stop
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/15 hover:text-white"
              onClick={() => controller.setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="min-h-0 flex-1">
            <div ref={scrollRef} className="flex flex-col gap-3 p-4">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="ml-auto max-w-[85%]">
                    <div className="rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="max-w-[92%]">
                    {m.text && (
                      <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                        {m.text}
                      </div>
                    )}
                    {m.card}
                    {m.text && (
                      <button
                        type="button"
                        onClick={speakCurrentAI}
                        className="ml-1 mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 className="h-3 w-3" /> Read
                      </button>
                    )}
                  </div>
                ),
              )}
              {thinking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="ai-gradient inline-block h-2 w-2 animate-live rounded-full" />
                  Nexus AI is thinking…
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s.length > 42 ? s.slice(0, 42) + "…" : s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Ask Nexus AI…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant={listening ? "default" : "outline"}
                onClick={startListening}
                className={cn(listening && "ai-gradient text-white animate-pulse")}
                aria-label="Voice input"
              >
                {listening ? <Waveform /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button type="submit" size="icon" className="ai-gradient text-white">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <CampaignPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onConfirm={() => {
          setPreviewOpen(false);
          toast.success("Campaign scheduled ✅ · Delhi NCR · 8,420 users · 6:30 PM IST");
          addAI({
            text: "Campaign scheduled. I'll monitor it live and ping you if anything looks off.",
          });
        }}
      />
    </>
  );
}

function StepCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-1 border-primary/20 bg-card/60 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        {icon} {title}
      </div>
      {children}
    </Card>
  );
}

function Waveform() {
  const bars = [0.35, 0.85, 0.55, 1.0, 0.45, 0.75, 0.6, 0.9, 0.4, 0.7, 0.55, 0.8];
  return (
    <div className="flex items-end gap-0.5 h-5">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-0.75 rounded-full bg-white animate-waveform"
          style={{ height: `${h * 18}px`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

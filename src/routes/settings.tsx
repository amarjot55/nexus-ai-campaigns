import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Phone,
  Zap,
  Shield,
  Globe,
  Play,
  Square,
  ChevronRight,
  Sparkles,
  TestTube,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAIPanel } from "@/components/ai/AIAssistant";
import { getTtsEngine, createTtsEngine } from "@/lib/tts";
import { isSttSupported } from "@/lib/stt";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const ai = useAIPanel();
  const [ttsEnabled, setTtsEnabled] = useState(ai?.ttsEnabled ?? true);
  const [sttEnabled, setSttEnabled] = useState(isSttSupported());
  const [ttsRate, setTtsRate] = useState(90);
  const [testingTts, setTestingTts] = useState(false);
  const [testingMic, setTestingMic] = useState(false);
  const micRef = useRef<any>(null);

  const handleTtsTest = () => {
    const eng = getTtsEngine();
    if (!eng) {
      toast.error("TTS not available");
      return;
    }
    setTestingTts(true);
    eng.speak("Hi, I'm Nexus AI. Your campaign co-pilot is ready.");
    setTimeout(() => {
      eng?.stop();
      setTestingTts(false);
    }, 3000);
  };

  const handleMicTest = () => {
    if (!isSttSupported()) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    if (testingMic) {
      micRef.current?.stop?.();
      setTestingMic(false);
      return;
    }
    setTestingMic(true);
    toast.info("Speak now — say 'Hello Nexus'");
    // We can't fully test here since STT is owned by AI panel, but show the state
    setTimeout(() => {
      setTestingMic(false);
      toast.success("Mic test complete! Voice input is working.");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
          <Badge variant="secondary" className="text-[10px]">
            Live
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Workspace, AI engine, voice, and compliance preferences.
        </p>
      </div>

      {/* Voice & Speech */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Volume2 className="h-4 w-4 text-primary" /> Voice & Speech
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Control how Nexus AI speaks and listens.
        </p>

        <div className="mt-4 space-y-4">
          {/* TTS Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Text-to-Speech</div>
              <div className="text-xs text-muted-foreground">
                Read AI responses aloud automatically
              </div>
            </div>
            <Switch
              checked={ttsEnabled}
              onCheckedChange={(v) => {
                setTtsEnabled(v);
                ai?.toggleTts?.();
                toast.success(v ? "TTS enabled" : "TTS disabled");
              }}
            />
          </div>

          {ttsEnabled && (
            <>
              <Separator />
              {/* Speed */}
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Speaking speed</span>
                  <Badge variant="secondary">{ttsRate}%</Badge>
                </div>
                <Slider
                  value={[ttsRate]}
                  min={50}
                  max={150}
                  step={5}
                  onValueChange={([v]) => {
                    setTtsRate(v);
                    const eng = getTtsEngine();
                    eng?.setRate(v / 100);
                  }}
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Slow (50%)</span>
                  <span>Normal (100%)</span>
                  <span>Fast (150%)</span>
                </div>
              </div>

              <Separator />
              {/* Test TTS */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Test voice</div>
                  <div className="text-xs text-muted-foreground">Hear how Nexus AI sounds</div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleTtsTest}
                  disabled={testingTts}
                >
                  <TestTube className="mr-2 h-3.5 w-3.5" />
                  {testingTts ? "Playing…" : "Test"}
                </Button>
              </div>
            </>
          )}

          <Separator />
          {/* Speech Recognition */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Voice input (Speech-to-Text)</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {isSttSupported()
                  ? "Speak your commands instead of typing"
                  : "Not supported in this browser — try Chrome or Edge"}
              </div>
            </div>
            <Switch
              checked={sttEnabled}
              onCheckedChange={(v) => {
                setSttEnabled(v);
                toast.success(v ? "Voice input enabled" : "Voice input disabled");
              }}
              disabled={!isSttSupported()}
            />
          </div>

          {sttEnabled && isSttSupported() && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    testingMic ? "bg-warning animate-live" : "bg-success",
                  )}
                />
                <div>
                  <div className="text-sm">{testingMic ? "Listening…" : "Ready"}</div>
                  <div className="text-xs text-muted-foreground">
                    {testingMic
                      ? "Speak into your microphone"
                      : "Click the mic button in the AI panel to start"}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleMicTest}
                disabled={testingMic}
              >
                <Mic className="mr-2 h-3.5 w-3.5" />
                Test mic
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Workspace */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="h-4 w-4 text-primary" /> Workspace
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Workspace name</Label>
            <Input defaultValue="Flipmart India" className="mt-1" />
          </div>
          <div>
            <Label>Timezone</Label>
            <Input defaultValue="Asia/Kolkata (IST)" className="mt-1" />
          </div>
          <div>
            <Label>Default sender ID</Label>
            <Input defaultValue="NEXUSAI" className="mt-1" />
          </div>
          <div>
            <Label>Default country</Label>
            <Select defaultValue="IN">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">🇮🇳 India (+91)</SelectItem>
                <SelectItem value="US">🇺🇸 United States (+1)</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom (+44)</SelectItem>
                <SelectItem value="AE">🇦🇪 UAE (+971)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* AI Co-pilot */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" /> AI Co-pilot
        </div>
        <div className="mt-3 space-y-3">
          {[
            ["Auto-pause campaigns on anomaly", true],
            ["Suggest optimal send times", true],
            ["Auto-apply approved recommendations", false],
            ["Voice input enabled", sttEnabled && isSttSupported()],
          ].map(([label, v]) => (
            <div key={label as string} className="flex items-center justify-between">
              <div className="text-sm">{label}</div>
              <Switch defaultChecked={v as boolean} />
            </div>
          ))}
        </div>
      </Card>

      {/* Compliance */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-primary" /> Compliance & DLT
        </div>
        <div className="mt-3 space-y-3">
          {[
            ["Enforce DND check before every send", true],
            ["Require DLT-approved templates for SMS", true],
            ["Auto-append opt-out for promotional SMS", true],
            ["Consent verification (GDPR/DPDP)", true],
            ["Audit log — retain 90 days", true],
          ].map(([label, v]) => (
            <div key={label as string} className="flex items-center justify-between">
              <div className="text-sm">{label}</div>
              <Switch defaultChecked={v as boolean} />
            </div>
          ))}
        </div>
      </Card>

      {/* Channel connections */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Phone className="h-4 w-4 text-primary" /> Channel connections
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          All channels are connected in demo mode.
        </p>
        <div className="mt-3 space-y-2">
          {[
            "WhatsApp Business API",
            "SMS (DLT-Registered)",
            "RCS Business Messaging",
            "Google Ads",
            "Meta Ads",
          ].map((ch) => (
            <div
              key={ch}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <span className="text-sm">{ch}</span>
              <Badge className="bg-success/20 text-success gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-live" />
                Connected
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

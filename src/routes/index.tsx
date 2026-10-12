import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowUpRight, ArrowDownRight, Send } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
  CartesianGrid,
  Legend,
} from "recharts";
import { kpis, channelPerf, liveEvents, trendData } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { useAIPanel } from "@/components/ai/AIAssistant";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const ai = useAIPanel();
  const [prompt, setPrompt] = useState("");
  const [feed, setFeed] = useState<{ id: number; text: string; ts: string }[]>(() =>
    liveEvents.slice(0, 4).map((t, i) => ({ id: i, text: t, ts: relTime(i) })),
  );

  useEffect(() => {
    let n = feed.length;
    const iv = setInterval(() => {
      const next = liveEvents[Math.floor(Math.random() * liveEvents.length)];
      setFeed((f) => [{ id: ++n, text: next, ts: "just now" }, ...f].slice(0, 10));
    }, 3500);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    const t = prompt.trim();
    if (!t || !ai) return;
    setPrompt("");
    ai.submit(t);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back. Your campaigns are performing above target this week.
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <span className="h-2 w-2 animate-live rounded-full bg-success" />
            All channels healthy
          </Badge>
        </div>

        <Card className="ai-glow-shadow mt-4 border-primary/30 bg-gradient-to-br from-card to-accent/30 p-4">
          <div className="flex items-center gap-3">
            <div className="ai-gradient grid h-10 w-10 shrink-0 place-items-center rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                Ask Nexus AI
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="mt-1 flex gap-2"
              >
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Send WhatsApp + SMS campaign to users from Delhi who purchased in last 30 days"
                  className="border-primary/20 bg-background/60"
                />
                <Button type="submit" className="ai-gradient shrink-0 text-white">
                  <Send className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Run</span>
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <div className="text-xl font-bold md:text-2xl">{k.value}</div>
              <Badge
                variant="secondary"
                className={
                  k.change >= 0
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                }
              >
                {k.change >= 0 ? (
                  <ArrowUpRight className="mr-0.5 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-0.5 h-3 w-3" />
                )}
                {Math.abs(k.change)}%
              </Badge>
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={k.spark.map((v, i) => ({ i, v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Channel performance</div>
              <div className="text-xs text-muted-foreground">Delivery rate & CTR — last 7 days</div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="channel"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="delivery"
                  name="Delivery %"
                  fill="var(--chart-2)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar dataKey="ctr" name="CTR %" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Live campaign feed</div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-live rounded-full bg-success" /> Live
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
            {feed.map((e) => (
              <div key={e.id} className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs">
                <div>{e.text}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">{e.ts}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Volume by channel — last 7 days (K)</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="whatsapp" stroke="var(--chart-2)" strokeWidth={2} />
              <Line type="monotone" dataKey="sms" stroke="var(--chart-3)" strokeWidth={2} />
              <Line type="monotone" dataKey="rcs" stroke="var(--chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="google" stroke="var(--chart-4)" strokeWidth={2} />
              <Line type="monotone" dataKey="meta" stroke="var(--chart-5)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function relTime(i: number) {
  return ["just now", "1m ago", "3m ago", "8m ago"][i] || `${i}m ago`;
}

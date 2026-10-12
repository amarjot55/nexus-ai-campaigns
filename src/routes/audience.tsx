import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { segments, aiSuggestedSegments } from "@/lib/mock-data";
import { Sparkles, Users } from "lucide-react";
import { useAIPanel } from "@/components/ai/AIAssistant";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";

export const Route = createFileRoute("/audience")({
  component: AudiencePage,
});

function AudiencePage() {
  const ai = useAIPanel();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Audience & Segments</h1>
        <p className="text-sm text-muted-foreground">
          Static segments and AI-generated cohorts refreshed continuously.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">AI-suggested segments</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {aiSuggestedSegments.map((s) => (
            <Card
              key={s.name}
              className="ai-glow-shadow border-primary/30 bg-gradient-to-br from-card to-accent/30 p-4"
            >
              <div className="text-sm font-semibold">{s.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.reason}</div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="secondary">{s.size.toLocaleString("en-IN")} users</Badge>
                <Button
                  size="sm"
                  className="ai-gradient text-white"
                  onClick={() => ai?.submit(`Create a campaign for the "${s.name}" segment`)}
                >
                  Create campaign
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Saved segments</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {segments.map((s) => {
            const data = Object.entries(s.cities).map(([n, v]) => ({ n, v }));
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">Updated {s.updated}</div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" /> {s.size.toLocaleString("en-IN")}
                  </Badge>
                </div>
                <div className="mt-3 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <XAxis
                        dataKey="n"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar dataKey="v" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

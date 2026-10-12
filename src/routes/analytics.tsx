import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { channelPerf, funnelData } from "@/lib/mock-data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Download, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const conversion = [
  { day: "Mon", cost: 6.2, cvr: 2.1 },
  { day: "Tue", cost: 5.9, cvr: 2.3 },
  { day: "Wed", cost: 5.4, cvr: 2.5 },
  { day: "Thu", cost: 5.1, cvr: 2.7 },
  { day: "Fri", cost: 4.8, cvr: 3.0 },
  { day: "Sat", cost: 4.4, cvr: 3.3 },
  { day: "Sun", cost: 4.6, cvr: 3.1 },
];

function AnalyticsPage() {
  const max = funnelData[0].value;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Cross-channel performance and AI-detected anomalies.
          </p>
        </div>
        <ReportDialog />
      </div>

      <Card className="border-warning/40 bg-warning/10 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold">Anomaly detected</div>
              <Badge className="bg-warning/20 text-warning">Auto-paused</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              AI detected a <b>34% drop</b> in delivery rate for WhatsApp campaigns in the last 2
              hours. 1 campaign auto-paused: <b>Flash Sale NCR</b>.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">
            View details
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">Channel performance</div>
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

        <Card className="p-4">
          <div className="mb-3 text-sm font-semibold">Conversion rate vs cost / conv (₹)</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversion}>
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
                <Line
                  type="monotone"
                  dataKey="cvr"
                  name="CVR %"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="Cost ₹"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-4 text-sm font-semibold">Conversion funnel</div>
        <div className="space-y-2">
          {funnelData.map((f, i) => {
            const pct = (f.value / max) * 100;
            return (
              <div key={f.stage}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{f.stage}</span>
                  <span className="text-muted-foreground">
                    {f.value.toLocaleString("en-IN")} · {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-8 overflow-hidden rounded-lg bg-muted">
                  <div
                    className="ai-gradient h-full transition-all"
                    style={{
                      width: `${pct}%`,
                      opacity: 1 - i * 0.12,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function ReportDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ai-gradient text-white">
          <Sparkles className="mr-2 h-4 w-4" /> Generate report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Weekly AI summary
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            This week, <b className="text-foreground">WhatsApp outperformed SMS by 2.3x on CTR</b>,
            driven primarily by the Delhi NCR repeat-buyer segment (ROI 4.2x). Cart recovery flows
            on WhatsApp saw a 14.9% conversion rate — your highest of the quarter.
          </p>
          <p>
            RCS delivery latency crossed 210ms twice, causing a 4-hour dip. Nexus auto-shifted
            fallback traffic to SMS and preserved 96.4% delivery.
          </p>
          <p>
            Recommendation: consolidate paid spend into{" "}
            <b className="text-foreground">Bengaluru high-AOV</b> lookalike audiences on Meta —
            cost-per-conversion is down 18% week over week.
          </p>
        </div>
        <div className="flex justify-end">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

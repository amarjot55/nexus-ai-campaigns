import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { channels } from "@/lib/mock-data";

export const Route = createFileRoute("/channels")({
  component: ChannelsPage,
});

function ChannelsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Channels</h1>
        <p className="text-sm text-muted-foreground">
          Connected messaging and ad channels with live health checks.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{c.account}</div>
              </div>
              <Badge className="gap-1 bg-success/20 text-success">
                <span className="h-1.5 w-1.5 animate-live rounded-full bg-success" />
                {c.status}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/40 p-2">
                <div className="text-muted-foreground">API latency</div>
                <div className="mt-0.5 text-sm font-semibold">{c.latency} ms</div>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <div className="text-muted-foreground">Delivery success</div>
                <div className="mt-0.5 text-sm font-semibold">{c.success}%</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
